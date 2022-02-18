import { Game } from "../types/Game";
import { Player } from "../types/Player";
import { AiState, KnownAttack } from "../types/Ai";
import CarrierService from "./carrier";
import CombatService from "./combat";
import DistanceService from "./distance";
import PlayerService from "./player";
import ShipTransferService from "./shipTransfer";
import StarService from "./star";
import StarUpgradeService from "./starUpgrade";
import TechnologyService from "./technology";
import WaypointService from "./waypoint";
import { Star } from "../types/Star";
import { Carrier } from "../types/Carrier";
import { getOrInsert, reverseSort, notNull } from "../utils";
import { CarrierWaypoint } from "../types/CarrierWaypoint";

const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Heap = require('qheap');
const mongoose = require("mongoose");

enum AiAction {
    DefendStar,
    ClaimStar,
    ReinforceStar,
    InvadeStar
}

interface DefendStarOrder {
    type: AiAction.DefendStar,
    score: number,
    star: string,
    ticksUntil: number,
    incomingCarriers: Carrier[]
}

interface ClaimStarOrder {
    type: AiAction.ClaimStar,
    star: string,
    score: number
}

interface ReinforceStarOrder {
    type: AiAction.ReinforceStar,
    score: number,
    star: string,
    source: string
}

interface InvadeStarOrder {
    type: AiAction.InvadeStar,
    star: string,
    score: number
}

type Order = DefendStarOrder | ClaimStarOrder | ReinforceStarOrder | InvadeStarOrder;

type StarGraph = Map<string, Set<string>>;

interface Context {
    aiState: AiState;
    playerStars: Star[];
    playerCarriers: Carrier[];
    starsById: Map<string, Star>;
    allReachableFromPlayerStars: StarGraph;
    freelyReachableFromPlayerStars: StarGraph;
    reachablePlayerStars: StarGraph;
    freelyReachableStars: StarGraph;
    borderStars: Set<string>;
    carriersOrbiting: Map<string, Carrier[]>;
    carriersById: Map<string, Carrier>;
    attacksByStarId: Map<string, Map<number, Carrier[]>>;
    attackedStarIds: Set<string>;
    playerEconomy: number;
    playerIndustry: number;
    playerScience: number;
}

interface Assignment {
    carriers: Carrier[];
    star: Star;
    totalShips: number;
}

interface FoundAssignment {
    assignment: Assignment;
    trace: string[];
}

const EMPTY_STAR_SCORE_MULTIPLIER = 1;
const ENEMY_STAR_SCORE_MULTIPLIER = 5;

const REINFORCEMENT_MIN_CYCLES = 0.8;

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

    constructor(
        starUpgradeService: StarUpgradeService,
        carrierService: CarrierService,
        starService: StarService,
        distanceService: DistanceService,
        waypointService: WaypointService,
        combatService: CombatService,
        shipTransferService: ShipTransferService,
        technologyService: TechnologyService,
        playerService: PlayerService
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
    }

    async play(game: Game, player: Player) {
        if (!player.defeated) {
            throw new Error('The player is not under AI control.');
        }

        const isFirstTick = game.state.tick % game.settings.galaxy.productionTicks === 1;
        const isLastTick = game.state.tick % game.settings.galaxy.productionTicks === game.settings.galaxy.productionTicks - 1;

        await this._doAdvancedLogic(game, player, isFirstTick, isLastTick);

        await this._doBasicLogic(game, player, isFirstTick, isLastTick);
    }

    async _doBasicLogic(game: Game, player: Player, isFirstTick: boolean, isLastTick: boolean) {
        try {
            if (isFirstTick) {
                await this._playFirstTick(game, player);
            } else if (isLastTick) {
                await this._playLastTick(game, player);
            }
        } catch (e) {
            console.error(e);
        }

        // TODO: Not sure if this is an issue but there was an occassion during debugging
        // where the player credits amount was less than 0, I assume its the AI spending too much somehow
        // so adding this here just in case but need to investigate.
        player.credits = Math.max(0, player.credits);
    }

    async _doAdvancedLogic(game: Game, player: Player, isFirstTick: boolean, isLastTick: boolean) {
        // Considering the growing complexity of AI logic, 
        // it's better to catch any possible errors and have the game continue with disfunctional AI than to break the game tick logic.
        try {
            let aiState: AiState;
            if (isFirstTick || !player.ai || !player.aiState) {
                aiState = this._setupAi(game, player);
                player.ai = true;
            } else  {
                aiState = player.aiState;
            }
            const context = this._createContext(game, player, aiState);
            this._updateState(game, player, context);
            const orders = this._gatherOrders(game, player, context);
            const assignments = await this._gatherAssignments(game, player, context);
            await this._evaluateOrders(game, player, context, orders, assignments);
            // Mongoose method that cannot be typechecked
            // @ts-ignore
            player.markModified('aiState');
        } catch (e) {
            console.error(e);
        }
    }

    _setupAi(game: Game, player: Player): AiState {
        const state = {
            knownAttacks: [],
            startedClaims: [],
            invasionsInProgress: []
        };
        player.aiState = state;
        return state;
    }

    _updateState(game: Game, player: Player, context: Context) {
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

    _createContext(game: Game, player: Player, aiState: AiState): Context {
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        const playerId = player._id.toString();

        const starsById = new Map<string, Star>()

        for (const star of game.galaxy.stars) {
            starsById.set(star._id.toString(), star);
        }

        const traversableStars = game.galaxy.stars.filter(star => !star.ownedByPlayerId || star.ownedByPlayerId.toString() === playerId);
        const allReachableFromPlayerStars = this._computeStarGraph(game, player, playerStars, game.galaxy.stars);
        const freelyReachableFromPlayerStars = this._computeStarGraph(game, player, playerStars, traversableStars);
        const reachablePlayerStars = this._computeStarGraph(game, player, playerStars, playerStars);
        const freelyReachableStars = this._computeStarGraph(game, player, traversableStars, traversableStars);
        const borderStars = new Set<string>();
        for (const [from, reachables] of allReachableFromPlayerStars) {
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

        const incomingCarriers = game.galaxy.carriers
            .filter(carrier => carrier.ownedByPlayerId!.toString() !== playerId)
            .map(carrier => {
                const waypoint = carrier.waypoints.find(wp => {
                    const star = starsById.get(wp.destination.toString())!;
                    return star.ownedByPlayerId && star.ownedByPlayerId.toString() === playerId;
                });
                if (waypoint) {
                    return {
                        carrier,
                        waypoint
                    }
                } else {
                    return null;
                }
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

        return {
            aiState,
            playerStars,
            playerCarriers,
            starsById,
            allReachableFromPlayerStars,
            freelyReachableFromPlayerStars,
            freelyReachableStars,
            reachablePlayerStars,
            borderStars,
            carriersOrbiting,
            carriersById,
            attacksByStarId,
            attackedStarIds,
            playerEconomy: this.playerService.calculateTotalEconomy(playerStars),
            playerIndustry: this.playerService.calculateTotalIndustry(playerStars),
            playerScience: this.playerService.calculateTotalScience(playerStars)
        }
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
        const newClaimedStars = new Set(context.aiState.startedClaims);

        // For now, process orders in order of importance and try to find the best assignment possible for each order.
        // Later, a different scoring process could be used to maximize overall scores.

        for (const order of orders) {
            //console.log(order);
            if (order.type === AiAction.DefendStar) {
                // Later, take weapons level and specialists into account
                const attackData = this._getAttackData(game, player, context, order.star, order.ticksUntil) || this._createDefaultAttackData(game, order.star, order.ticksUntil);
                const defendingStar = context.starsById.get(order.star)!;
                const requiredAdditionallyForDefense = this._calculateRequiredShipsForDefense(game, player, context, attackData, order.incomingCarriers, defendingStar);
                newKnownAttacks.push(attackData);
                console.log("Performing defense on: " + defendingStar.name);
                const allPossibleAssignments: FoundAssignment[] = this._findAssignmentsWithTickLimit(game, player, context, context.reachablePlayerStars, assignments, order.star, order.ticksUntil, this._canAffordCarrier(context, game, player, true));

                let shipsNeeded = requiredAdditionallyForDefense;

                for (const {assignment, trace} of allPossibleAssignments) {
                    if (shipsNeeded <= 0) {
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

                    console.log("Defending " + defendingStar.name + " with " + shipsUsed + " ships");
                    await this._useAssignment(context, game, player, assignments, assignment, this._createWaypointsFromTrace(trace), shipsUsed, (carrier) => attackData.carriersOnTheWay.push(carrier._id.toString()));
                }
            } else if (order.type === AiAction.InvadeStar) {
                if (player.aiState && player.aiState.invasionsInProgress && player.aiState.invasionsInProgress.find(iv => order.star === iv.star)) {
                    continue;
                }

                const starToInvade = context.starsById.get(order.star)!;
                const requiredShips = this._calculateRequiredShipsForAttack(game, player, context, starToInvade);
                const ticksLimit = game.settings.galaxy.productionTicks * 2;
                const fittingAssignments = this._findAssignmentsWithTickLimit(game, player, context, context.freelyReachableStars, assignments, order.star, ticksLimit,  this._canAffordCarrier(context, game, player, false), false);

                if (!fittingAssignments || !fittingAssignments.length) {
                    continue;
                }

                for (const {assignment, trace} of fittingAssignments) {
                    if (assignment.totalShips >= requiredShips) {
                        const carrierResult = await this._useAssignment(context, game, player, assignments, assignment, this._createWaypointsFromTrace(trace), requiredShips);

                        console.log("Invading " + starToInvade.name);

                        context.aiState.invasionsInProgress.push({
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
                    newClaimedStars.add(visitedStar);
                }
            } else if (order.type === AiAction.ReinforceStar) {
                const assignment = assignments.get(order.source);
                if (!assignment || assignment.totalShips <= 1) {
                    continue;
                }
                const hasCarrier = assignment.carriers && assignment.carriers.length > 0;

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

                if (hasCarrier) {
                    // Since a carrier is standing around, we might as well use it
                    await reinforce();
                } else {
                    // TODO: We want to be smarter about reinforcements. Maybe sort the orders by the number of ships involved?
                    const source = context.starsById.get(order.source)!;
                    const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, source);
                    const shipProductionPerTick = this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, source.infrastructure.industry || 0, 1, game.settings.galaxy.productionTicks);
                    const ticksProduced = assignment.totalShips / shipProductionPerTick;
                    if (ticksProduced > (game.settings.galaxy.productionTicks * REINFORCEMENT_MIN_CYCLES) && this._canAffordCarrier(context, game, player, false)) {
                        await reinforce();
                    }
                }
            }
        }

        context.aiState.knownAttacks = newKnownAttacks;

        const claimsInProgress: string[] = [];

        for (const claim of newClaimedStars) {
            const star = context.starsById.get(claim)!;
            if (!star.ownedByPlayerId) {
                claimsInProgress.push(claim);
            }
        }

        context.aiState.startedClaims = claimsInProgress;
    }

    async _useAssignment(context: Context, game: Game, player: Player, assignments: Map<string, Assignment>, assignment: Assignment, waypoints: CarrierWaypoint[], ships: number, onCarrierUsed: ((Carrier) => void) | null = null) {
        console.log("Using assignment from " + assignment.star.name + ". " + assignment.carriers.length + " carriers present.");
        let shipsToTransfer = ships;
        const starId = assignment.star._id;
        let carrier: Carrier = assignment.carriers && assignment.carriers[0];
        if (carrier) {
            console.log("Using existing carrier " + carrier.name);
            assignment.carriers.shift();
        } else {
            const buildResult = await this.starUpgradeService.buildCarrier(game, player, starId, 1, false);
            carrier = this.carrierService.getById(game, buildResult.carrier._id);
            shipsToTransfer -= 1;
            assignment.totalShips -= 1;
            console.log("Building new carrier " + carrier.name);
        }
        if (shipsToTransfer > 0) {
            console.log("Ships for transfer: " + shipsToTransfer + ", assignment total: " + assignment.totalShips);
            const remaining = Math.max(assignment.star.ships! - shipsToTransfer, 0);
            await this.shipTransferService.transfer(game, player, carrier._id, shipsToTransfer + 1, starId, remaining, false);
            assignment.totalShips = assignment.star.ships!;
        }
        console.log("Assignment ships after transfer: " + assignment.totalShips);
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

    _createWaypointsFromTrace(trace: string[]): CarrierWaypoint[] {
        const waypoints: CarrierWaypoint[] = [];

        let last = trace[0];
        for (let i = 1; i < trace.length; i++) {
            waypoints.push({
                _id: new mongoose.Types.ObjectId(),
                source: new mongoose.Types.ObjectId(last),
                destination: new mongoose.Types.ObjectId(trace[i]),
                action: 'nothing',
                actionShips: 0,
                delayTicks: 0
            });
            last = trace[i];
        }

        return waypoints;
    }

    _canAffordCarrier(context: Context, game: Game, player: Player, highPriority: boolean): boolean {
        // Keep 20% of budget for upgrades
        const leaveOver = highPriority ? 0 : context.playerEconomy * 2;
        const availableFunds = player.credits - leaveOver;
        const carrierExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];
        return availableFunds >= this.starUpgradeService.calculateCarrierCost(game, carrierExpenseConfig);
    }

    _searchAssignments(context: Context, starGraph: StarGraph, assignments: Map<string, Assignment>, nextFilter, onAssignment, startStarId) {
        const queue = new Heap({
            comparBefore: (b1, b2) => b1.totalDistance > b2.totalDistance,
            compar: (b1, b2) => b2.totalDistance - b1.totalDistance
        });

        const init = {
            trace: [startStarId],
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

                const fittingCandidates = Array.from(nextCandidates)
                    .filter(candidate => nextFilter(trace, candidate));

                for (const fittingCandidate of fittingCandidates) {
                    if (!visited.has(fittingCandidate)) {
                        visited.add(fittingCandidate);
                        const distToNext = this.distanceService.getDistanceSquaredBetweenLocations(star.location, context.starsById.get(fittingCandidate)!.location);
                        const newTotalDist = totalDistance + distToNext;
                        queue.push({
                            starId: fittingCandidate,
                            trace: [fittingCandidate].concat(trace),
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

    _findAssignmentsWithTickLimit(game: Game, player: Player, context: Context, starGraph: StarGraph, assignments: Map<string, Assignment>, destinationId: string, ticksLimit: number, allowCarrierPurchase: boolean, onlyOne = false): FoundAssignment[] {
        const distancePerTick = game.settings.specialGalaxy.carrierSpeed;

        const nextFilter = (trace, nextStarId) => {
            const entireTrace = trace.concat([nextStarId]).map(starId => context.starsById.get(starId)!.location);
            const entireDistance = this.distanceService.getDistanceAlongLocationList(entireTrace);
            const ticksRequired = Math.ceil(entireDistance / distancePerTick);
            return ticksRequired <= ticksLimit;
        }

        const fittingAssignments: FoundAssignment[] = [];

        const onAssignment = (assignment, trace) => {
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
        }
    }

    _calculateRequiredShipsForAttack(game: Game, player: Player, context: Context, starToInvade: Star) {
        const starId = starToInvade._id.toString();
        const defendingPlayer = this.playerService.getById(game, starToInvade.ownedByPlayerId);
        const defendingCarriers = context.carriersOrbiting.get(starId) || [];

        const defender = {
            ships: Math.floor(starToInvade.shipsActual || 0) + defendingCarriers.reduce((sum, c) => sum + (c.ships || 0), 0),
            weaponsLevel: this.technologyService.getStarEffectiveWeaponsLevel(game, [defendingPlayer], starToInvade, defendingCarriers)
        };
        const attacker = {
            ships: 1, // Just needed so we can get the actually needed number
            weaponsLevel: player.research.weapons.level
        };

        const result = this.combatService.calculate(defender, attacker, true, true);
        return result.needed!.attacker;
    }

    _calculateRequiredShipsForDefense(game: Game, player: Player, context: Context, attackData: KnownAttack, attackingCarriers, defendingStar) {
        const attackerIds = new Set();
        const attackers: Player[] = [];

        for (const attackingCarrier of attackingCarriers) {
            const attacker = this.playerService.getById(game, attackingCarrier.ownedByPlayerId);
            const attackerId = attacker._id.toString();
            if (!attackerIds.has(attackerId)) {
                attackerIds.add(attackerId);
                attackers.push(attacker);
            }
        }

        const defenseCarriersAtStar = context.carriersOrbiting.get(defendingStar._id.toString()) || [];
        const defenseCarriersOnTheWay = (attackData && attackData.carriersOnTheWay.map(carrierId => context.carriersById.get(carrierId.toString())!));
        const defenseCarriers = defenseCarriersAtStar.concat(defenseCarriersOnTheWay);
        const sides = this.combatService.constructSidesStar(game, defendingStar, player, [player], attackers, defenseCarriers, attackingCarriers);
        const result = this.combatService.calculate(sides.defender, sides.attacker, true, true);

        if (result.after.defender <= 0) {
            return result.needed!.defender - result.before.defender;
        } else {
            return 0;
        }
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

            for (const carrier of carriersHere) {
                if (carrier.ships! > 1) {
                    const newStarShips = playerStar.ships! + carrier.ships! - 1;
                    await this.shipTransferService.transfer(game, player, carrier._id, 1, playerStar._id, newStarShips, false);
                }
            }

            if (playerStar.ships! < 1 && carriersHere.length === 0) {
                continue;
            }

            assignments.set(playerStar._id.toString(), {
                carriers: carriersHere,
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

    _isEnemyStar(game: Game, player: Player, context: Context, star: Star) {
        return star.ownedByPlayerId && star.ownedByPlayerId.toString() !== player._id.toString(); //TODO
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
                        })
                    }
                }
            }
        }

        return orders;
    }

    _claimInProgress(context: Context, starId: string): boolean {
        return Boolean(context.aiState.startedClaims && context.aiState.startedClaims.find(claim => claim === starId));
    }

    _gatherExpansionOrders(game: Game, player: Player, context: Context): Order[] {
        const orders: Order[] = [];
        const used = new Set<string>();

        for (const [fromId, reachables] of context.freelyReachableFromPlayerStars) {
            const claimCandidates = Array.from(reachables).map(starId => context.starsById.get(starId)!).filter(star => !star.ownedByPlayerId);
            for (const candidate of claimCandidates) {
                const candidateId = candidate._id.toString();
                if (!this._claimInProgress(context, candidateId) && !used.has(candidateId)) {
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

    _getAttackData(game: Game, player: Player, context, attackedStarId, attackInTicks): KnownAttack | undefined {
        const attackAbsoluteTick = game.state.tick + attackInTicks;
        return context.aiState.knownAttacks.find(attack => attack.starId === attackedStarId.toString() && attack.arrivalTick === attackAbsoluteTick);
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

        console.log("Star priorities:");
        for (const [starId, priority] of starPriorities) {
            console.log("Priority: " + context.starsById.get(starId)!.name + " => " + priority);

            const neighbors = context.reachablePlayerStars.get(starId)!;
            for (const neighbor of neighbors) {
                if (this._isUnderAttack(context, neighbor)) {
                    continue;
                }

                const neighborPriority = starPriorities.get(neighbor)!;
                if (neighborPriority < priority) {
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
        const hyperspaceRange = this._getHyperspaceRange(game, player);
        const borderStarPriorities = new Map<string, number>();

        for (const borderStarId of context.borderStars) {
            const borderStar = context.starsById.get(borderStarId)!;
            const reachables = context.allReachableFromPlayerStars.get(borderStarId)!;
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

        console.log("Border star priorities:");
        for (const [id, score] of borderStarPriorities) {
            console.log("Priority: " + context.starsById.get(id)!.name + " => " + score);
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

    _getHyperspaceRange(game: Game, player: Player): number {
        return this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);
    }

    _computeStarGraph(game: Game, player: Player, playerStars: Star[], starCandidates: Star[]): StarGraph {
        const hyperspaceRange = this._getHyperspaceRange(game, player);
        const hyperspaceRangeSquared = hyperspaceRange * hyperspaceRange;

        const starGraph = new Map<string, Set<string>>();

        playerStars.forEach((star, starIdx) => {
            const reachableFromPlayerStars = new Set<string>();

            starCandidates.forEach((otherStar, otherStarIdx) => {
                if (starIdx !== otherStarIdx && this.distanceService.getDistanceSquaredBetweenLocations(star.location, otherStar.location) <= hyperspaceRangeSquared) {
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

};
