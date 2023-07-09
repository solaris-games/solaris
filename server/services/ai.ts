import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {KnownAttack} from "./types/Ai";
import CarrierService from "./carrier";
import CombatService from "./combat";
import DistanceService from "./distance";
import PlayerService from "./player";
import ShipTransferService from "./shipTransfer";
import StarService from "./star";
import StarUpgradeService from "./starUpgrade";
import TechnologyService from "./technology";
import WaypointService from "./waypoint";
import {Star} from "./types/Star";
import {Carrier} from "./types/Carrier";
import {getOrInsert, maxBy, minBy, notNull, reverseSort} from "./utils";
import {CarrierWaypoint, CarrierWaypointActionType} from "./types/CarrierWaypoint";
import ReputationService from "./reputation";
import DiplomacyService from "./diplomacy";
import PlayerStatisticsService from "./playerStatistics";
import {DBObjectId} from "./types/DBObjectId";
import PlayerAfkService from "./playerAfk";
import ShipService from "./ship";

const Heap = require('qheap');
const mongoose = require("mongoose");

const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const EMPTY_STAR_SCORE_MULTIPLIER = 1;
const ENEMY_STAR_SCORE_MULTIPLIER = 5;

const REINFORCEMENT_MIN_CYCLES = 1.5;
const REINFORCEMENT_MIN_FACTOR = 1.4;

const INVASION_ATTACK_FACTOR = 1.5;

enum AiAction {
    DefendStar,
    ClaimStar,
    ReinforceStar,
    InvadeStar
};

interface DefendStarOrder {
    type: AiAction.DefendStar;
    score: number;
    star: string;
    ticksUntil: number;
    incomingCarriers: Carrier[];
};

interface ClaimStarOrder {
    type: AiAction.ClaimStar;
    star: string;
    score: number;
};

interface ReinforceStarOrder {
    type: AiAction.ReinforceStar;
    score: number;
    star: string;
    source: string;
};

interface InvadeStarOrder {
    type: AiAction.InvadeStar;
    star: string;
    score: number;
};

interface TracePoint {
    starId: string;
    action?: CarrierWaypointActionType;
};

type Order = DefendStarOrder | ClaimStarOrder | ReinforceStarOrder | InvadeStarOrder;

type StarGraph = Map<string, Set<string>>;

interface Context {
    playerStars: Star[];
    playerCarriers: Carrier[];
    starsById: Map<string, Star>;
    allReachableFromPlayerStars: StarGraph;
    freelyReachableFromPlayerStars: StarGraph;
    reachablePlayerStars: StarGraph;
    freelyReachableStars: StarGraph;
    allCanReachPlayerStars: StarGraph;
    starsInGlobalRange: StarGraph;
    borderStars: Set<string>;
    carriersOrbiting: Map<string, Carrier[]>;
    carriersById: Map<string, Carrier>;
    attacksByStarId: Map<string, Map<number, Carrier[]>>;
    attackedStarIds: Set<string>;
    playerEconomy: number;
    playerIndustry: number;
    playerScience: number;
    transitFromCarriers: Map<string, Carrier[]>,
    arrivingAtCarriers: Map<string, Carrier[]>
}

interface Assignment {
    carriers: Carrier[];
    star: Star;
    totalShips: number;
};

interface FoundAssignment {
    assignment: Assignment;
    trace: TracePoint[];
};

// IMPORTANT IMPLEMENTATION NOTES
// During AI tick, care must be taken to NEVER write any changes to the database.
// This is performed automatically by mongoose (when calling game.save()).
// Use the writeToDB parameters to skip (or introduce them where needed).
// Otherwise, changes will get duplicated.
export default class AIService {
    starUpgradeService: StarUpgradeService;
    carrierService: CarrierService;
    starService: StarService;
    distanceService: DistanceService;
    waypointService: WaypointService;
    combatService: CombatService;
    shipTransferService: ShipTransferService;
    technologyService: TechnologyService;
    playerService: PlayerService;
    playerAfkService: PlayerAfkService;
    reputationService: ReputationService;
    diplomacyService: DiplomacyService;
    playerStatisticsService: PlayerStatisticsService;
    shipService: ShipService;

    constructor(
        starUpgradeService: StarUpgradeService,
        carrierService: CarrierService,
        starService: StarService,
        distanceService: DistanceService,
        waypointService: WaypointService,
        combatService: CombatService,
        shipTransferService: ShipTransferService,
        technologyService: TechnologyService,
        playerService: PlayerService,
        playerAfkService: PlayerAfkService,
        reputationService: ReputationService,
        diplomacyService: DiplomacyService,
        playerStatisticsService: PlayerStatisticsService,
        shipService: ShipService
    ) {
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.waypointService = waypointService;
        this.combatService = combatService;
        this.shipTransferService = shipTransferService;
        this.technologyService = technologyService;
        this.playerService = playerService;
        this.playerAfkService = playerAfkService;
        this.reputationService = reputationService;
        this.diplomacyService = diplomacyService;
        this.playerStatisticsService = playerStatisticsService;
        this.shipService = shipService;
    }

    async play(game: Game, player: Player) {
        if (!this.playerAfkService.isAIControlled(game, player, true)) {
            throw new Error('The player is not under AI control.');
        }

        const isFirstTickOfCycle = game.state.tick % game.settings.galaxy.productionTicks === 1;
        const isLastTickOfCycle = game.state.tick % game.settings.galaxy.productionTicks === game.settings.galaxy.productionTicks - 1;

        // Considering the growing complexity of AI logic,
        // it's better to catch any possible errors and have the game continue with disfunctional AI than to break the game tick logic.
        try {
            if (game.settings.general.advancedAI === 'enabled') {
                await this._doAdvancedLogic(game, player, isFirstTickOfCycle, isLastTickOfCycle);
            }

            await this._doBasicLogic(game, player, isFirstTickOfCycle, isLastTickOfCycle);
        } catch (e) {
            console.error(e);
        }
    }

    async _doBasicLogic(game: Game, player: Player, isFirstTickOfCycle: boolean, isLastTickOfCycle: boolean) {
        if (isFirstTickOfCycle) {
            await this._playFirstTick(game, player);
        } else if (isLastTickOfCycle) {
            await this._playLastTick(game, player);
        }

        // TODO: Not sure if this is an issue but there was an occassion during debugging
        // where the player credits amount was less than 0, I assume its the AI spending too much somehow
        // so adding this here just in case but need to investigate.
        player.credits = Math.max(0, player.credits);
    }

    async _doAdvancedLogic(game: Game, player: Player, isFirstTickOfCycle: boolean, isLastTickOfCycle: boolean) {
        const context = this._createContext(game, player);

        if (context == null) {
            this._clearState(player);
            return;
        }

        if (!player.aiState) {
            this._setInitialState(game, player);
        }

        this._sanitizeState(game, player, context);

        const orders = this._gatherOrders(game, player, context);
        const assignments = await this._gatherAssignments(game, player, context);

        await this._evaluateOrders(game, player, context, orders, assignments);

        // Mongoose method that cannot be typechecked
        // @ts-ignore
        player.markModified('aiState');
    }

    _setInitialState(game: Game, player: Player): void {
        player.aiState = {
            knownAttacks: [],
            startedClaims: [],
            invasionsInProgress: []
        };

        this.reputationService.initializeReputationForAlliedPlayers(game, player);
    }

    _sanitizeState(game: Game, player: Player, context: Context) {
        if (!player.aiState) {
            return;
        }

        if (player.aiState.knownAttacks) {
            player.aiState.knownAttacks = player.aiState.knownAttacks.filter(attack => attack.arrivalTick > game.state.tick);
        }

        if (player.aiState.invasionsInProgress) {
            player.aiState.invasionsInProgress = player.aiState.invasionsInProgress.filter(invasion => invasion.arrivalTick > game.state.tick);
        }
    }

    _clearState(player: Player) {
        if (player.aiState) {
            player.aiState = null;
            // @ts-ignore
            player.markModified('aiState');
        }
    }

    _createContext(game: Game, player: Player): Context | null {
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        // The AI can't do shit if they don't have any stars.
        if (!playerStars.length) {
            return null;
        }

        const playerId = player._id.toString();

        const starsById = new Map<string, Star>()

        for (const star of game.galaxy.stars) {
            starsById.set(star._id.toString(), star);
        }

        const traversableStars = game.galaxy.stars.filter(star => !star.ownedByPlayerId || star.ownedByPlayerId.toString() === playerId);
        // All stars (belonging to anyone) that can be reached directly from a player star
        const allReachableFromPlayerStars = this._computeStarGraph(starsById, game, player, playerStars, game.galaxy.stars, this._getHyperspaceRangeExternal(game, player));
        // All stars (belonging to anyone) that can reach a player star (with our players range)
        const allCanReachPlayerStars = this._computeStarGraph(starsById, game, player, game.galaxy.stars, playerStars, this._getHyperspaceRangeExternal(game, player));
        // All stars (unowned or owned by this player) that can be reached from player stars
        const freelyReachableFromPlayerStars = this._computeStarGraph(starsById, game, player, playerStars, traversableStars, this._getHyperspaceRangeExternal(game, player));
        // Player stars reachable from player stars
        const reachablePlayerStars = this._computeStarGraph(starsById, game, player, playerStars, playerStars, this._getHyperspaceRangeInternal(game, player));
        // All free stars that can be reached from other free stars
        const freelyReachableStars = this._computeStarGraph(starsById, game, player, traversableStars, traversableStars, this._getHyperspaceRangeExternal(game, player));
        // All stars that can be reached from player stars with globally highest range tech
        const starsInGlobalRange = this._computeStarGraph(starsById, game, player, playerStars, game.galaxy.stars, this._getGlobalHighestHyperspaceRange(game));

        const borderStars = new Set<string>();

        for (const [from, reachables] of starsInGlobalRange) {
            for (const reachableId of reachables) {
                const reachable = starsById.get(reachableId)!;

                if (!reachable.ownedByPlayerId || reachable.ownedByPlayerId.toString() !== playerId) {
                    borderStars.add(from);
                }
            }
        }

        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        const carriersOrbiting = new Map<string, Carrier[]>();

        for (const carrier of game.galaxy.carriers) {
            if ((!carrier.waypoints || carrier.waypoints.length === 0) && carrier.orbiting) {
                const carriersInOrbit = getOrInsert(carriersOrbiting, carrier.orbiting.toString(), () => []);
                carriersInOrbit.push(carrier);
            }
        }

        const carriersById = new Map<string, Carrier>();

        for (const carrier of game.galaxy.carriers) {
            carriersById.set(carrier._id.toString(), carrier);
        }

        // Enemy carriers that are in transition to one of our stars
        const incomingCarriers = game.galaxy.carriers
            .filter(carrier => this._isEnemyPlayer(game, player, carrier.ownedByPlayerId!) && carrier.orbiting == null)
            .map(carrier => {
                const waypoint = carrier.waypoints[0];
                const destinationId = waypoint.destination;
                const destinationStar = starsById.get(destinationId.toString())!;

                if (destinationStar.ownedByPlayerId && destinationStar.ownedByPlayerId.toString() === playerId) {
                    return {
                        carrier,
                        waypoint
                    };
                }

                return null;
            })
            .filter(notNull);

        const attacksByStarId = new Map<string, Map<number, Carrier[]>>();
        const attackedStarIds = new Set<string>();

        for (const { carrier: incomingCarrier, waypoint: incomingWaypoint } of incomingCarriers) {
            const targetStar = incomingWaypoint.destination.toString();
            const attacks = getOrInsert(attacksByStarId, targetStar, () => new Map<number, Carrier[]>());

            attackedStarIds.add(targetStar);

            const attackInTicks = this.waypointService.calculateWaypointTicksEta(game, incomingCarrier, incomingWaypoint);
            const simultaneousAttacks = getOrInsert(attacks, attackInTicks, () => []);

            simultaneousAttacks.push(incomingCarrier);
        }

        const transitFromCarriers = new Map<string, Carrier[]>();
        const arrivingAtCarriers = new Map<string, Carrier[]>();

        for (const carrier of playerCarriers) {
            if (carrier.waypoints.length !== 0) {
                const fromId = carrier.waypoints[0].source.toString();

                const fromCarriers = getOrInsert(transitFromCarriers, fromId, () => []);
                fromCarriers.push(carrier);

                if (carrier.waypoints.length === 1) {
                    const toId = carrier.waypoints[0].destination.toString();
                    const toCarriers = getOrInsert(arrivingAtCarriers, toId, () => []);
                    toCarriers.push(carrier);
                }
            }
        }

        return {
            playerStars,
            playerCarriers,
            starsById,
            allReachableFromPlayerStars,
            freelyReachableFromPlayerStars,
            allCanReachPlayerStars,
            freelyReachableStars,
            reachablePlayerStars,
            starsInGlobalRange,
            borderStars,
            carriersOrbiting,
            carriersById,
            attacksByStarId,
            attackedStarIds,
            playerEconomy: this.playerStatisticsService.calculateTotalEconomy(playerStars),
            playerIndustry: this.playerStatisticsService.calculateTotalIndustry(playerStars),
            playerScience: this.playerStatisticsService.calculateTotalScience(playerStars),
            transitFromCarriers,
            arrivingAtCarriers
        };
    }

    async _evaluateOrders(game: Game, player: Player, context: Context, orders: Order[], assignments: Map<string, Assignment>) {
        const sorter = (o1, o2) => {
            const categoryPriority = this.priorityFromOrderCategory(o1.type) - this.priorityFromOrderCategory(o2.type);
            if (categoryPriority !== 0) {
                return categoryPriority;
            } else {
                return o1.score - o2.score;
            }
        };

        orders.sort(reverseSort(sorter));

        // This is a hack to ensure that ships are never assigned from a star where they are needed for defense.
        // Later, with an improved scoring system, this should not be necessary
        for (const order of orders) {
            if (order.type === AiAction.DefendStar) {
                assignments.delete(order.star);
            }
        }

        const newKnownAttacks: KnownAttack[] = [];
        const newClaimedStars = new Set(player.aiState!.startedClaims);

        // For now, process orders in order of importance and try to find the best assignment possible for each order.
        // Later, a different scoring process could be used to maximize overall scores.

        for (const order of orders) {
            if (order.type === AiAction.DefendStar) {
                // Later, take weapons level and specialists into account
                const attackData = this._getAttackData(game, player, order.star, order.ticksUntil) || this._createDefaultAttackData(game, order.star, order.ticksUntil);
                const defendingStar = context.starsById.get(order.star)!;
                const requiredAdditionallyForDefense = this._calculateRequiredShipsForDefense(game, player, context, attackData, order.incomingCarriers, defendingStar);

                newKnownAttacks.push(attackData);

                const allPossibleAssignments: FoundAssignment[] = this._findAssignmentsWithTickLimit(game, player, context, context.reachablePlayerStars, assignments, order.star, order.ticksUntil, this._canAffordCarrier(context, game, player, true));

                let shipsNeeded = requiredAdditionallyForDefense;

                for (const {assignment, trace} of allPossibleAssignments) {
                    if (shipsNeeded <= 0 || assignment.totalShips === 1) {
                        break;
                    }

                    // Skip assignments that we cannot afford to fulfill
                    if ((!assignment.carriers || assignment.carriers.length === 0) && !this._canAffordCarrier(context, game, player, true)) {
                        continue;
                    }

                    let shipsUsed;

                    if (shipsNeeded <= assignment.totalShips) {
                        shipsUsed = shipsNeeded;
                        shipsNeeded = 0;
                    } else {
                        shipsUsed = assignment.totalShips;
                        shipsNeeded -= assignment.totalShips;
                    }

                    // We'll wait until the last possible moment to launch the defense to avoid wasting carriers
                    const timeLeftUntilSchedule =  order.ticksUntil - this._calculateTraceDuration(context, game, trace);
                    if (timeLeftUntilSchedule > 0) {
                        assignments.delete(assignment.star._id.toString());
                    } else {
                        await this._useAssignment(context, game, player, assignments, assignment, this._createWaypointsDropAndReturn(trace), shipsUsed, (carrier) => attackData.carriersOnTheWay.push(carrier._id.toString()));
                    }
                }
            } else if (order.type === AiAction.InvadeStar) {
                if (player.aiState && player.aiState.invasionsInProgress && player.aiState.invasionsInProgress.find(iv => order.star === iv.star)) {
                    continue;
                }

                const starToInvade = context.starsById.get(order.star)!;
                const ticksLimit = game.settings.galaxy.productionTicks * 2;
                const fittingAssignments = this._findAssignmentsWithTickLimit(game, player, context, context.allCanReachPlayerStars, assignments, order.star, ticksLimit,  this._canAffordCarrier(context, game, player, false), false);

                if (!fittingAssignments || !fittingAssignments.length) {
                    continue;
                }

                for (const {assignment, trace} of fittingAssignments) {
                    const ticksUntilArrival = this._calculateTraceDuration(context, game, trace);
                    const requiredShips = Math.floor(this._calculateRequiredShipsForAttack(game, player, context, starToInvade, ticksUntilArrival) * INVASION_ATTACK_FACTOR);

                    if (assignment.totalShips >= requiredShips) {
                        const carrierResult = await this._useAssignment(context, game, player, assignments, assignment, this._createWaypointsFromTrace(trace), requiredShips);

                        player.aiState!.invasionsInProgress.push({
                            star: order.star,
                            arrivalTick: game.state.tick + carrierResult.ticksEtaTotal!
                        });

                        break;
                    }
                }
            } else if (order.type === AiAction.ClaimStar) {
                // Skip double claiming stars that might have been claimed by an earlier action
                if (newClaimedStars.has(order.star)) {
                    continue;
                }

                const ticksLimit = game.settings.galaxy.productionTicks * 2; // If star is not reachable in that time, try again next cycle
                const fittingAssignments = this._findAssignmentsWithTickLimit(game, player, context, context.freelyReachableStars, assignments, order.star, ticksLimit, this._canAffordCarrier(context, game, player, false), true)
                const found: FoundAssignment = fittingAssignments && fittingAssignments[0];

                if (!found) {
                    continue;
                }

                const waypoints = this._createWaypointsFromTrace(found.trace);

                await this._useAssignment(context, game, player, assignments, found.assignment, waypoints, found.assignment.totalShips);

                for (const visitedStar of found.trace) {
                    newClaimedStars.add(visitedStar.starId);
                }
            } else if (order.type === AiAction.ReinforceStar) {
                const assignment = assignments.get(order.source);

                if (!assignment || assignment.totalShips <= 1) {
                    continue;
                }

                const hasIdleCarrier = assignment.carriers && assignment.carriers.length > 0;

                const reinforce = async () => {
                    const waypoints: CarrierWaypoint[] = [
                        {
                            _id: new mongoose.Types.ObjectId(),
                            source: new mongoose.Types.ObjectId(order.source),
                            destination: new mongoose.Types.ObjectId(order.star),
                            action: 'dropAll',
                            actionShips: 0,
                            delayTicks: 0
                        },
                        {
                            _id: new mongoose.Types.ObjectId(),
                            source: new mongoose.Types.ObjectId(order.star),
                            destination: new mongoose.Types.ObjectId(order.source),
                            action: 'nothing',
                            actionShips: 0,
                            delayTicks: 0
                        }
                    ];

                    await this._useAssignment(context, game, player, assignments, assignment, waypoints, assignment.totalShips);
                }

                if (hasIdleCarrier) {
                    // Since a carrier is standing around, we might as well use it
                    await reinforce();
                } else if (this._canAffordCarrier(context, game, player, false)) {
                    const routeCarrier = this._logisticRouteExists(context, order.source, order.star);

                    // Only allow one carrier per route
                    if (!routeCarrier) {
                        const nextReturning = this._nextArrivingCarrierIn(context, game, order.source);
                        if (!nextReturning)  {
                            await reinforce();
                        }
                    }
                }
            }
        }

        player.aiState!.knownAttacks = newKnownAttacks;

        const claimsInProgress: string[] = [];

        for (const claim of newClaimedStars) {
            const star = context.starsById.get(claim)!;

            if (!star.ownedByPlayerId) {
                claimsInProgress.push(claim);
            }
        }

        player.aiState!.startedClaims = claimsInProgress;
    }

    _nextArrivingCarrierIn(context: Context, game: Game, starId: string): number | undefined {
        const carriers = context.arrivingAtCarriers.get(starId);
        return carriers && minBy(c => this.waypointService.calculateWaypointTicks(game, c, c.waypoints[0]), carriers)
    }

    async _useAssignment(context: Context, game: Game, player: Player, assignments: Map<string, Assignment>, assignment: Assignment, waypoints: CarrierWaypoint[], ships: number, onCarrierUsed: ((Carrier) => void) | null = null) {
        let shipsToTransfer = ships;
        const starId = assignment.star._id;
        let carrier: Carrier = assignment.carriers && assignment.carriers[0];

        if (carrier) {
            assignment.carriers.shift();
        } else {
            const buildResult = await this.starUpgradeService.buildCarrier(game, player, starId, 1, false);
            carrier = this.carrierService.getById(game, buildResult.carrier._id);
            shipsToTransfer -= 1;
            assignment.totalShips -= 1;
        }

        if (shipsToTransfer > 0) {
            const remaining = Math.max(assignment.star.ships! - shipsToTransfer, 0);
            await this.shipTransferService.transfer(game, player, carrier._id, shipsToTransfer + 1, starId, remaining, false);
            assignment.totalShips = assignment.star.ships!;
        }

        const carrierResult = await this.waypointService.saveWaypointsForCarrier(game, player, carrier, waypoints, false, false);
        const carrierRemaining = assignment.carriers && assignment.carriers.length > 0;

        if (!carrierRemaining && assignment.totalShips === 0) {
            assignments.delete(starId.toString());
        }

        if (onCarrierUsed) {
            onCarrierUsed(carrier);
        }

        return carrierResult;
    }

    _createWaypointsDropAndReturn(trace: TracePoint[]): CarrierWaypoint[] {
        const newTrace: TracePoint[] = trace.slice(0, trace.length - 1);

        newTrace.push({
            starId: trace[trace.length - 1].starId,
            action: "dropAll"
        });

        const backTrace = (trace.slice(0, trace.length - 1).reverse());

        return this._createWaypointsFromTrace(newTrace.concat(backTrace));
    }

    _createWaypointsFromTrace(trace: TracePoint[]): CarrierWaypoint[] {
        const waypoints: CarrierWaypoint[] = [];
        let last = trace[0].starId;

        for (let i = 1; i < trace.length; i++) {
            const id = trace[i].starId;

            waypoints.push({
                _id: new mongoose.Types.ObjectId(),
                source: new mongoose.Types.ObjectId(last),
                destination: new mongoose.Types.ObjectId(id),
                action: trace[i].action || 'nothing',
                actionShips: 0,
                delayTicks: 0
            });

            last = id;
        }

        return waypoints;
    }

    _logisticRouteExists(context: Context, fromStarId: string, toStarId: string): Carrier | undefined {
        const movingFrom = context.transitFromCarriers.get(fromStarId) ?? [];
        const hasCarrierOutbound = movingFrom.find((c) => c.waypoints[0].destination.toString() === toStarId);
        if (hasCarrierOutbound) {
            return hasCarrierOutbound;
        }

        const movingTo = context.arrivingAtCarriers.get(fromStarId) ?? [];
        return movingTo.find((c) => c.waypoints[0].source.toString() === toStarId);
    }

    _canAffordCarrier(context: Context, game: Game, player: Player, highPriority: boolean): boolean {
        // Keep 50% of budget for upgrades
        const leaveOver = highPriority ? 0 : context.playerEconomy * 5;
        const availableFunds = player.credits - leaveOver;
        const carrierExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];

        return availableFunds >= this.starUpgradeService.calculateCarrierCost(game, carrierExpenseConfig);
    }

    _searchAssignments(context: Context, starGraph: StarGraph, assignments: Map<string, Assignment>, nextFilter: (trace: TracePoint[], nextStarId: string) => boolean, onAssignment: (assignment: Assignment, trace: TracePoint[]) => boolean, startStarId: string) {
        const queue = new Heap({
            comparBefore: (b1, b2) => b1.totalDistance > b2.totalDistance,
            compar: (b1, b2) => b2.totalDistance - b1.totalDistance
        });

        const init = {
            trace: [{starId: startStarId}],
            starId: startStarId,
            totalDistance: 0
        };

        queue.push(init);

        const visited = new Set();

        while (queue.length > 0) {
            const {starId, trace, totalDistance} = queue.shift();

            visited.add(starId);

            const currentStarAssignment = assignments.get(starId);

            if (currentStarAssignment) {
                if (!onAssignment(currentStarAssignment, trace)) {
                    return;
                }
            }

            const nextCandidates = starGraph.get(starId);

            if (nextCandidates) {
                const star = context.starsById.get(starId)!;
                const fittingCandidates = Array.from(nextCandidates).filter(candidate => nextFilter(trace, candidate));

                for (const fittingCandidate of fittingCandidates) {
                    if (!visited.has(fittingCandidate)) {
                        visited.add(fittingCandidate);

                        const distToNext = this._calculateTravelDistance(star, context.starsById.get(fittingCandidate)!)
                        const newTotalDist = totalDistance + distToNext;

                        queue.push({
                            starId: fittingCandidate,
                            trace: [{starId: fittingCandidate}].concat(trace),
                            totalDistance: newTotalDist
                        });
                    }
                }
            }
        }
    }

    _filterAssignmentByCarrierPurchase(assignment: Assignment, allowCarrierPurchase: boolean) {
        const hasCarriers = assignment.carriers && assignment.carriers.length > 0;

        return allowCarrierPurchase || hasCarriers;
    }

    _calculateTravelDistance(star1: Star, star2: Star): number {
        if (this.starService.isStarPairWormHole(star1, star2)) {
            return 0;
        } else {
            return this.distanceService.getDistanceBetweenLocations(star1.location, star2.location);
        }
    }

    _calculateTraceDistance(context: Context, game: Game, trace: TracePoint[]): number {
        if (trace.length < 2) {
            return 0;
        }

        let last = trace[0];
        let distance = 0;

        for (let i = 1; i < trace.length; i++) {
            const lastStar = context.starsById.get(last.starId)!;
            const thisStar = context.starsById.get(trace[i].starId)!;

            distance += this._calculateTravelDistance(lastStar, thisStar);

            last = trace[i];
        }

        return distance;
    }

    _calculateTraceDuration(context: Context, game: Game, trace: TracePoint[]): number {
        const distancePerTick = game.settings.specialGalaxy.carrierSpeed;
        const entireDistance = this._calculateTraceDistance(context, game, trace);
        return Math.ceil(entireDistance / distancePerTick);
    }

    _findAssignmentsWithTickLimit(game: Game, player: Player, context: Context, starGraph: StarGraph, assignments: Map<string, Assignment>, destinationId: string, ticksLimit: number, allowCarrierPurchase: boolean, onlyOne = false, filterNext: ((trace: TracePoint[], nextStarId: string) => boolean) | null = null): FoundAssignment[] {
        const nextFilter = (trace: TracePoint[], nextStarId: string) => {
            const entireTrace = trace.concat([{starId: nextStarId}]);
            const ticksRequired = this._calculateTraceDuration(context, game, entireTrace);
            const withinLimit = ticksRequired <= ticksLimit;

            if (filterNext) {
                return withinLimit && filterNext(trace, nextStarId);
            }

            return withinLimit;
        }

        const fittingAssignments: FoundAssignment[] = [];

        const onAssignment = (assignment: Assignment, trace: TracePoint[]) => {
            if (this._filterAssignmentByCarrierPurchase(assignment, allowCarrierPurchase)) {
                fittingAssignments.push({
                    assignment,
                    trace
                });
            }

            return !onlyOne;
        }

        this._searchAssignments(context, starGraph, assignments, nextFilter, onAssignment, destinationId)

        return fittingAssignments;
    }

    _createDefaultAttackData(game: Game, starId: string, ticksUntil: number): KnownAttack {
        const arrivalTick = game.state.tick + ticksUntil;

        return {
            starId,
            arrivalTick,
            carriersOnTheWay: []
        };
    }

    _calculateRequiredShipsForAttack(game: Game, player: Player, context: Context, starToInvade: Star, ticksToArrival: number) {
        const invadedPlayer = starToInvade.ownedByPlayerId!;

        const starId = starToInvade._id.toString();
        const defendingPlayer = this.playerService.getById(game, invadedPlayer)!;
        const defendingCarriers = context.carriersOrbiting.get(starId) || [];

        const techLevel = this.technologyService.getStarEffectiveTechnologyLevels(game, starToInvade, false);
        const shipsOnCarriers = defendingCarriers.reduce((sum, c) => sum + (c.ships || 0), 0);
        const shipsProduced = this.shipService.calculateStarShipsByTicks(techLevel.manufacturing, starToInvade.infrastructure.industry || 0, ticksToArrival, game.settings.galaxy.productionTicks);
        const shipsAtArrival = (starToInvade.shipsActual || 0) + shipsOnCarriers + shipsProduced;

        const defender = {
            ships: Math.ceil(shipsAtArrival),
            weaponsLevel: this.technologyService.getStarEffectiveWeaponsLevel(game, [defendingPlayer], starToInvade, defendingCarriers)
        };

        const attacker = {
            ships: 0,
            weaponsLevel: player.research.weapons.level
        };

        const result = this.combatService.calculate(defender, attacker, true, true);

        return result.needed!.attacker;
    }

    _calculateRequiredShipsForDefense(game: Game, player: Player, context: Context, attackData: KnownAttack, attackingCarriers, defendingStar) {
        const attackerIds = new Set();
        const attackers: Player[] = [];

        for (const attackingCarrier of attackingCarriers) {
            const attacker = this.playerService.getById(game, attackingCarrier.ownedByPlayerId)!;
            const attackerId = attacker._id.toString();
            
            if (!attackerIds.has(attackerId)) {
                attackerIds.add(attackerId);
                attackers.push(attacker);
            }
        }

        const defenseCarriersAtStar = context.carriersOrbiting.get(defendingStar._id.toString()) || [];
        let defenseCarriersOnTheWay: Carrier[] = [];
        if (attackData) {
            defenseCarriersOnTheWay = attackData.carriersOnTheWay.map(carrierId => context.carriersById.get(carrierId.toString())!);
        }
        const defenseCarriers = defenseCarriersAtStar.concat(defenseCarriersOnTheWay);
        const result = this.combatService.calculateStar(game, defendingStar, [player], attackers, defenseCarriers, attackingCarriers, true);

        if (result.after.defender <= 0) {
            return result.needed!.defender - result.before.defender;
        }

        return 0;
    }

    priorityFromOrderCategory(category: AiAction) {
        switch (category) {
            case AiAction.DefendStar:
                return 4;
            case AiAction.InvadeStar:
                return 3
            case AiAction.ClaimStar:
                return 2;
            case AiAction.ReinforceStar:
                return 1;
            default:
                return 0;
        }
    }

    async _gatherAssignments(game: Game, player: Player, context: Context): Promise<Map<string, Assignment>> {
        const assignments = new Map<string, Assignment>();

        for (const playerStar of context.playerStars) {
            const carriersHere = context.carriersOrbiting.get(playerStar._id.toString()) || [];
            const carriersOwned = carriersHere.filter(c => c.ownedByPlayerId!.toString() === player._id.toString());

            for (const carrier of carriersOwned) {
                if (carrier.ships! > 1) {
                    const newStarShips = playerStar.ships! + carrier.ships! - 1;
                    await this.shipTransferService.transfer(game, player, carrier._id, 1, playerStar._id, newStarShips, false);
                }
            }

            if (playerStar.ships! < 1 && carriersOwned.length === 0) {
                continue;
            }

            assignments.set(playerStar._id.toString(), {
                carriers: carriersOwned,
                star: playerStar,
                totalShips: playerStar.ships!
            });
        }

        return assignments;
    }

    _gatherOrders(game: Game, player: Player, context: Context): Order[] {
        const defenseOrders = this._gatherDefenseOrders(game, player, context);
        const invasionOrders = this._gatherInvasionOrders(game, player, context);
        const expansionOrders = this._gatherExpansionOrders(game, player, context);
        const movementOrders = this._gatherMovementOrders(game, player, context);

        return defenseOrders.concat(invasionOrders, expansionOrders, movementOrders);
    }

    _isEnemyPlayer(game: Game, player: Player, otherPlayerId: DBObjectId): boolean {
        return player._id !== otherPlayerId
            && this.diplomacyService.getDiplomaticStatusToPlayer(game, player._id, otherPlayerId).actualStatus !== 'allies';
    }

    _isEnemyStar(game: Game, player: Player, context: Context, star: Star): boolean {
        if (star.ownedByPlayerId) {
            return this._isEnemyPlayer(game, player, star.ownedByPlayerId);
        }

        return false;
    }

    _getStarScore(star: Star): number {
        return (star.infrastructure.economy || 0) + (2 * (star.infrastructure.industry || 0)) + (3 * (star.infrastructure.science || 0));
    }

    _gatherInvasionOrders(game: Game, player: Player, context: Context): Order[] {
        const orders: Order[] = [];
        const visited = new Set<string>();

        for (const [fromId, reachables] of context.allReachableFromPlayerStars) {
            for (const reachable of reachables) {
                if (!visited.has(reachable)) {
                    visited.add(reachable);

                    const star = context.starsById.get(reachable)!;

                    if (this._isEnemyStar(game, player, context, star)) {
                        const score = this._getStarScore(star);

                        orders.push({
                            type: AiAction.InvadeStar,
                            star: reachable,
                            score
                        });
                    }
                }
            }
        }

        return orders;
    }

    _claimInProgress(player: Player, starId: string): boolean {
        return Boolean(player.aiState!.startedClaims && player.aiState!.startedClaims.find(claim => claim === starId));
    }

    _gatherExpansionOrders(game: Game, player: Player, context: Context): Order[] {
        const orders: Order[] = [];
        const used = new Set<string>();

        for (const [fromId, reachables] of context.freelyReachableFromPlayerStars) {
            const claimCandidates = Array.from(reachables).map(starId => context.starsById.get(starId)!).filter(star => !star.ownedByPlayerId);
            for (const candidate of claimCandidates) {
                const candidateId = candidate._id.toString();
                if (!this._claimInProgress(player, candidateId) && !used.has(candidateId)) {
                    used.add(candidateId);

                    let score = 1;
                    if (candidate.naturalResources) {
                        score = candidate.naturalResources.economy + candidate.naturalResources.industry + candidate.naturalResources.science;
                    }

                    orders.push({
                        type: AiAction.ClaimStar,
                        star: candidateId,
                        score
                    });
                }
            }
        }

        return orders;
    }

    _getAttackData(game: Game, player: Player, attackedStarId: string, attackInTicks: number): KnownAttack | undefined {
        const attackAbsoluteTick = game.state.tick + attackInTicks;

        return player.aiState!.knownAttacks.find(attack => attack.starId === attackedStarId.toString() && attack.arrivalTick === attackAbsoluteTick);
    }

    _gatherDefenseOrders(game: Game, player: Player, context: Context): Order[] {
        const orders: Order[] = [];

        for (const [attackedStarId, attacks] of context.attacksByStarId) {
            for (const [attackInTicks, incomingCarriers] of attacks) {
                const attackedStar = context.starsById.get(attackedStarId)!;
                const starScore = this._getStarScore(attackedStar);

                orders.push({
                    type: AiAction.DefendStar,
                    score: starScore,
                    star: attackedStarId,
                    ticksUntil: attackInTicks,
                    incomingCarriers
                });
            }
        }

        return orders;
    }

    _isUnderAttack(context: Context, starId: string): boolean {
        return context.attackedStarIds.has(starId);
    }

    _gatherMovementOrders(game: Game, player: Player, context: Context): Order[] {
        const orders: Order[] = [];
        const starPriorities = this._computeStarPriorities(game, player, context);

        for (const [starId, priority] of starPriorities) {

            const neighbors = context.reachablePlayerStars.get(starId)!;
            for (const neighbor of neighbors) {
                if (this._isUnderAttack(context, neighbor)) {
                    continue;
                }

                const neighborPriority = starPriorities.get(neighbor)!;
                if (neighborPriority * REINFORCEMENT_MIN_FACTOR < priority) {
                    orders.push({
                        type: AiAction.ReinforceStar,
                        score: priority - neighborPriority,
                        star: starId,
                        source: neighbor
                    });
                }
            }
        }

        return orders;
    }

    _computeStarPriorities(game: Game, player: Player, context: Context): Map<string, number> {
        const hyperspaceRange = this._getGlobalHighestHyperspaceRange(game);
        const borderStarPriorities = new Map<string, number>();

        for (const borderStarId of context.borderStars) {
            const borderStar = context.starsById.get(borderStarId)!;
            const reachables = context.starsInGlobalRange.get(borderStarId)!;

            let score = 0;

            for (const reachableId of reachables) {
                const reachableStar = context.starsById.get(reachableId)!;

                if (!reachableStar.ownedByPlayerId) {
                    const distance = this.distanceService.getDistanceBetweenLocations(borderStar.location, reachableStar.location);
                    const distanceScore = (distance / hyperspaceRange) * EMPTY_STAR_SCORE_MULTIPLIER;

                    score += distanceScore;
                } else if (reachableStar.ownedByPlayerId.toString() !== player._id.toString()) {
                    const distance = this.distanceService.getDistanceBetweenLocations(borderStar.location, reachableStar.location);
                    const distanceScore = distance / hyperspaceRange * ENEMY_STAR_SCORE_MULTIPLIER;

                    score += distanceScore;
                }
            }

            borderStarPriorities.set(borderStarId, score);
        }

        const visited = new Set();
        const starPriorities = new Map(borderStarPriorities);

        while (true) {
            let changed = false;

            for (const [starId, priority] of starPriorities) {
                if (!visited.has(starId)) {
                    visited.add(starId);

                    const reachables = context.reachablePlayerStars.get(starId)!;

                    for (const reachableId of reachables) {
                        const oldPriority = starPriorities.get(reachableId) || 0;
                        const transitivePriority = priority * 0.5;
                        const newPriority = Math.max(oldPriority, transitivePriority);

                        starPriorities.set(reachableId, newPriority);

                        changed = true;
                    }
                }
            }

            if (!changed) {
                break;
            }
        }

        return starPriorities;
    }

    _getGlobalHighestHyperspaceRange(game: Game): number {
        const highestLevel = maxBy((p: Player) => p.research.hyperspace.level, game.galaxy.players);

        return this.distanceService.getHyperspaceDistance(game, highestLevel);
    }

    _getHyperspaceRangeExternal(game: Game, player: Player): number {
        const scanningRange = this.distanceService.getScanningDistance(game, player.research.scanning.level);
        const hyperspaceRange = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);
        return Math.min(scanningRange, hyperspaceRange);
    }

    _getHyperspaceRangeInternal(game: Game, player: Player): number {
        return this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);
    }

    _computeStarGraph(starsById: Map<string, Star>, game: Game, player: Player, traverseStars: Star[], reachStars: Star[], hyperspaceRange: number): StarGraph {
        const starGraph = new Map<string, Set<string>>();

        traverseStars.forEach(star => {
            const reachableFromPlayerStars = new Set<string>();

            reachStars.forEach(otherStar => {
                if (star._id !== otherStar._id && this._calculateTravelDistance(star, otherStar) <= hyperspaceRange) {
                    reachableFromPlayerStars.add(otherStar._id.toString());
                }
            });

            starGraph.set(star._id.toString(), reachableFromPlayerStars);
        });

        return starGraph;
    }

    async _playFirstTick(game: Game, player: Player) {
        if (!player.credits || player.credits < 0) {
            return
        }

        // On the first tick after production:
        // 1. Bulk upgrade X% of credits to ind and sci.
        let creditsToSpendSci = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE);
        let creditsToSpendInd = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE);

        if (creditsToSpendSci) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'science', creditsToSpendSci, false);
        }

        if (creditsToSpendInd) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'industry', creditsToSpendInd, false);
        }
    }

    async _playLastTick(game: Game, player: Player) {
        if (!player.credits || player.credits <= 0) {
            return
        }

        // On the last tick of the cycle:
        // 1. Spend remaining credits upgrading economy.
        let creditsToSpendEco = Math.floor(player.credits / 100 * LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE);

        if (creditsToSpendEco) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'economy', creditsToSpendEco, false);
        }
    }

    getStarName(context: Context, starId: string) {
        return context.starsById.get(starId)!.name;
    }

    cleanupState(player: Player) {
        player.aiState = null;
    }
};
