import { DBObjectId } from "./types/DBObjectId";
import { Carrier, CarrierPosition } from "./types/Carrier";
import { Game } from "./types/Game";
import { User } from "./types/User";
import AIService from "./ai";
import BattleRoyaleService from "./battleRoyale";
import CarrierService from "./carrier";
import CombatService from "./combat";
import DiplomacyService from "./diplomacy";
import DistanceService from "./distance";
import GameService from "./game";
import GameStateService from "./gameState";
import GameTypeService from "./gameType";
import HistoryService from "./history";
import LeaderboardService, {GameWinner} from "./leaderboard";
import StarMovementService from "./starMovement";
import PlayerService from "./player";
import ReputationService from "./reputation";
import ResearchService from "./research";
import SpecialistService from "./specialist";
import StarService from "./star";
import StarUpgradeService from "./starUpgrade";
import TechnologyService from "./technology";
import UserService from "./user";
import WaypointService from "./waypoint";
import { CarrierActionWaypoint } from "./types/GameTick";
import { Star } from "./types/Star";
import { GameRankingResult } from "./types/Rating";
import DiplomacyUpkeepService from "./diplomacyUpkeep";
import CarrierGiftService from "./carrierGift";
import CarrierMovementService, { CarrierMovementReport } from "./carrierMovement";
import PlayerCycleRewardsService from "./playerCycleRewards";
import StarContestedService from "./starContested";
import PlayerReadyService from "./playerReady";
import PlayerGalacticCycleCompletedEvent from "./types/events/PlayerGalacticCycleComplete"
import GamePlayerDefeatedEvent from "./types/events/GamePlayerDefeated";
import GamePlayerAFKEvent from "./types/events/GamePlayerAFK";
import GameEndedEvent from "./types/events/GameEnded";
import PlayerAfkService from "./playerAfk";
import ShipService from "./ship";
import { Specialist } from "./types/Specialist";
import InboundAttacksService from "./inboundAttacks";
import {Moment} from "moment";

const EventEmitter = require('events');
const moment = require('moment');

export const GameTickServiceEvents = {
    onPlayerGalacticCycleCompleted: 'onPlayerGalacticCycleCompleted',
    onGameCycleEnded: 'onGameCycleEnded',
    onPlayerAfk: 'onPlayerAfk',
    onPlayerDefeated: 'onPlayerDefeated',
    onGameEnded: 'onGameEnded',
    onGameTurnEnded: 'onGameTurnEnded'
}

export default class GameTickService extends EventEmitter {
    distanceService: DistanceService;
    starService: StarService;
    carrierService: CarrierService;
    researchService: ResearchService;
    playerService: PlayerService;
    playerAfkService: PlayerAfkService;
    historyService: HistoryService;
    waypointService: WaypointService;
    combatService: CombatService;
    leaderboardService: LeaderboardService;
    userService: UserService;
    gameService: GameService;
    technologyService: TechnologyService;
    specialistService: SpecialistService;
    starUpgradeService: StarUpgradeService;
    reputationService: ReputationService;
    aiService: AIService;
    battleRoyaleService: BattleRoyaleService;
    starMovementService: StarMovementService;
    diplomacyService: DiplomacyService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    playerCycleRewardsService: PlayerCycleRewardsService;
    diplomacyUpkeepService: DiplomacyUpkeepService;
    carrierMovementService: CarrierMovementService;
    carrierGiftService: CarrierGiftService;
    starContestedService: StarContestedService;
    playerReadyService: PlayerReadyService;
    shipService: ShipService;
    inboundAttacksService: InboundAttacksService

    constructor(
        distanceService: DistanceService,
        starService: StarService,
        carrierService: CarrierService,
        researchService: ResearchService,
        playerService: PlayerService,
        playerAfkService: PlayerAfkService,
        historyService: HistoryService,
        waypointService: WaypointService,
        combatService: CombatService,
        leaderboardService: LeaderboardService,
        userService: UserService,
        gameService: GameService,
        technologyService: TechnologyService,
        specialistService: SpecialistService,
        starUpgradeService: StarUpgradeService,
        reputationService: ReputationService,
        aiService: AIService,
        battleRoyaleService: BattleRoyaleService,
        starMovementService: StarMovementService,
        diplomacyService: DiplomacyService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        playerCycleRewardsService: PlayerCycleRewardsService,
        diplomacyUpkeepService: DiplomacyUpkeepService,
        carrierMovementService: CarrierMovementService,
        carrierGiftService: CarrierGiftService,
        starContestedService: StarContestedService,
        playerReadyService: PlayerReadyService,
        shipService: ShipService,
        inboundAttacksService: InboundAttacksService

    ) {
        super();

        this.distanceService = distanceService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.researchService = researchService;
        this.playerService = playerService;
        this.playerAfkService = playerAfkService;
        this.historyService = historyService;
        this.waypointService = waypointService;
        this.combatService = combatService;
        this.leaderboardService = leaderboardService;
        this.userService = userService;
        this.gameService = gameService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.starUpgradeService = starUpgradeService;
        this.reputationService = reputationService;
        this.aiService = aiService;
        this.battleRoyaleService = battleRoyaleService;
        this.starMovementService = starMovementService;
        this.diplomacyService = diplomacyService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.playerCycleRewardsService = playerCycleRewardsService;
        this.diplomacyUpkeepService = diplomacyUpkeepService;
        this.carrierMovementService = carrierMovementService;
        this.carrierGiftService = carrierGiftService;
        this.starContestedService = starContestedService;
        this.playerReadyService = playerReadyService;
        this.shipService = shipService;
        this.inboundAttacksService = inboundAttacksService;
    }

    async tick(gameId: DBObjectId) {
        const game = (await this.gameService.getByIdAll(gameId));

        if (!game) {
            console.error(`Game not found: ${gameId}`);
            return;
        }

        // Double check the game isn't locked.
        if (!this.gameStateService.isLocked(game)) {
            throw new Error(`The game is not locked.`);
        }

        /*
            1. Move all carriers
            2. Perform combat at stars that have enemy carriers in orbit
            3. Industry creates new ships
            4. Players conduct research
            5. If its the last tick in the galactic cycle, all players earn money and experimentation is done.
            6. Check to see if anyone has won the game.
        */

        let startTime = process.hrtime();
        console.log(`[${game.settings.general.name}] - Game tick started at ${new Date().toISOString()}`);

        game.state.lastTickDate = moment().utc();

        let taskTime = process.hrtime();
        let taskTimeEnd: [number, number] | null = null;

        let logTime = (taskName: string) => {
            taskTimeEnd = process.hrtime(taskTime);
            taskTime = process.hrtime();
            console.log(`[${game.settings.general.name}] - ${taskName}: %ds %dms'`, taskTimeEnd[0], taskTimeEnd[1] / 1000000);
        };

        let gameUsers = await this.userService.getGameUsers(game);
        logTime('Loaded game users');

        let iterations = 1;

        // If we are in turn based mode, we need to repeat the tick X number of times.
        if (this.gameTypeService.isTurnBasedGame(game)) {
            iterations = game.settings.gameTime.turnJumps;

            // Increment missed turns for players so that they can be kicked for being AFK later.
            this.playerService.incrementMissedTurns(game);
        }

        let hasProductionTicked: boolean = false;

        while (iterations--) {
            game.state.tick++;

            logTime(`Tick ${game.state.tick}`);

            await this._captureAbandonedStars(game, gameUsers);
            logTime('Capture abandoned stars');

            await this._transferGiftsInOrbit(game, gameUsers);
            logTime('Transfer gifts in orbit');

            await this._combatCarriers(game, gameUsers);
            logTime('Combat carriers');

            await this._moveCarriers(game, gameUsers);
            logTime('Move carriers and produce ships');

            await this._combatContestedStars(game, gameUsers);
            logTime('Combat at contested stars');

            let ticked: boolean = await this._endOfGalacticCycleCheck(game);
            logTime('Galactic cycle check');

            if (ticked && !hasProductionTicked) {
                hasProductionTicked = true;
            }

            await this._gameLoseCheck(game, gameUsers);
            logTime('Game lose check');

            await this._playAI(game);
            logTime('AI controlled players turn');
            
            await this.researchService.conductResearchAll(game, gameUsers);
            logTime('Conduct research');

            this._orbitGalaxy(game);
            logTime('Orbital mechanics');

            this.waypointService.cullAllWaypointsByHyperspaceRange(game);
            logTime('Sanitise all carrier waypoints');

            this._oneTickSpecialists(game);
            logTime('Apply effects of onetick specialists');

            this._clearExpiredSpecialists(game);
            logTime('Clear expired specialists')

            this._countdownToEndCheck(game);
            logTime('Countdown to end check');

            let hasWinner = await this._gameWinCheck(game, gameUsers);
            logTime('Game win check');

            await this._logHistory(game);
            logTime('Log history');

            if (hasWinner) {
                break;
            }
        }

        // TODO: This has been moved out of _moveCarriers, see comment in there.
        this._sanitiseDarkModeCarrierWaypoints(game);
        logTime('Sanitise dark mode carrier waypoints');

        this.playerReadyService.resetReadyStatuses(game, hasProductionTicked);

        await game.save();
        logTime('Save game');

        // Save user profile achievements if any have changed.
        for (let user of gameUsers) {
            await user.save();
        }

        logTime('Save users');

        this._emitEvents(game);

        let endTime = process.hrtime(startTime);

        console.log(`[${game.settings.general.name}] - Game tick ended: %ds %dms'`, endTime[0], endTime[1] / 1000000);
    }

    canTick(game: Game) {
        // Cannot perform a game tick on a locked, paused or completed game.
        if (game.state.locked || game.state.paused || game.state.endDate) {
            return false;
        }

        // Cannot perform a game tick as this game has not yet started.
        if (moment(game.state.startDate).utc().diff(moment().utc()) > 0) {
            return false;
        }

        if (this.gameService.isReadyToQuitImmediateEnd(game)) {
            return true;
        }

        let lastTick = moment(game.state.lastTickDate).utc();
        let nextTick: Moment;
        
        if (this.gameTypeService.isRealTimeGame(game)) {
            // If in real time mode, then calculate when the next tick will be and work out if we have reached that tick.
            nextTick = moment(lastTick).utc().add(game.settings.gameTime.speed, 'seconds');
        } else if (this.gameTypeService.isTurnBasedGame(game)) {
            // If in turn based mode, then check if all undefeated players are ready
            // OR the max time wait limit has been reached.
            let isAllPlayersReady = this.gameService.isAllUndefeatedPlayersReady(game);
            
            if (isAllPlayersReady) {
                return true;
            }

            nextTick = moment(lastTick).utc().add(game.settings.gameTime.maxTurnWait, 'minutes');
        } else {
            throw new Error(`Unsupported game type.`);
        }
    
        return nextTick.diff(moment().utc(), 'seconds') <= 0;
    }

    async _combatCarriers(game: Game, gameUsers: User[]) {
        if (game.settings.specialGalaxy.carrierToCarrierCombat !== 'enabled') {
            return;
        }

        let isAlliancesEnabled = this.diplomacyService.isFormalAlliancesEnabled(game);

        // Get all carriers that are in transit, their current locations
        // and where they will be moving to.
        let carrierPositions: CarrierPosition[] = game.galaxy.carriers
            .filter(x => 
                this.carrierMovementService.isInTransit(x)           // Carrier is already in transit
                || this.carrierMovementService.isLaunching(x)        // Or the carrier is just about to launch (this prevent carrier from hopping over attackers)
            )
            .map(c => {
                let waypoint = c.waypoints[0];
                let locationNext = this.carrierMovementService.getNextLocationToWaypoint(game, c);

                let sourceStar = this.starService.getById(game, waypoint.source);
                let destinationStar = this.starService.getById(game, waypoint.destination);

                // Note: There should never be a scenario where a carrier is travelling to a
                // destroyed star.
                let distanceToDestinationCurrent = this.distanceService.getDistanceBetweenLocations(c.location, destinationStar.location);
                let distanceToDestinationNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, destinationStar.location);

                let distanceToSourceCurrent,
                    distanceToSourceNext;

                // TODO: BUG: Its possible that a carrier is travelling from a star that has been destroyed
                // and is no longer in the game, this will cause carrier to carrier combat to be actioned.
                // RESOLUTION: Ideally store the source and destination locations instead of a reference to the stars
                // and then we still have a reference to the location of the now destroyed star.
                if (sourceStar) {
                    distanceToSourceCurrent = this.distanceService.getDistanceBetweenLocations(c.location, sourceStar.location);
                    distanceToSourceNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, sourceStar.location);
                } else {
                    distanceToSourceCurrent = 0;
                    distanceToSourceNext = distanceToSourceCurrent + locationNext.distance;
                }

                return {
                    carrier: c,
                    source: waypoint.source,
                    destination: waypoint.destination,
                    locationCurrent: c.location,
                    locationNext: locationNext.location,
                    distanceToSourceCurrent,
                    distanceToDestinationCurrent,
                    distanceToSourceNext,
                    distanceToDestinationNext
                };
            });

        const graph = this._getCarrierPositionGraph(carrierPositions);

        for (let carrierPath in graph) {
            let positions = graph[carrierPath];

            if (positions.length <= 1) {
                continue;
            }

            for (let i = 0; i < positions.length; i++) {
                let friendlyCarrier = positions[i];

                if (friendlyCarrier.carrier.ships <= 0) {
                    continue;
                }

                // First up, get all carriers that are heading from the destination and to the source
                // and are in front of the carrier.
                let collisionCarriers: CarrierPosition[] = positions
                    .filter((c: CarrierPosition) => {
                        return (c.carrier.ships! > 0 && !c.carrier.isGift) // Is still alive and not a gift
                            && (
                                // Head to head combat:
                                (
                                    c.destination.toString() === friendlyCarrier.source.toString()
                                    && c.distanceToSourceCurrent <= friendlyCarrier.distanceToDestinationCurrent
                                    && c.distanceToSourceNext >= friendlyCarrier.distanceToDestinationNext
                                )
                                ||
                                // Combat from behind: 
                                (
                                    c.destination.toString() === friendlyCarrier.destination.toString()
                                    && c.distanceToDestinationCurrent <= friendlyCarrier.distanceToDestinationCurrent
                                    && c.distanceToDestinationNext >= friendlyCarrier.distanceToDestinationNext
                                )
                            )
                    });

                // Filter any carriers that avoid carrier-to-carrier combat.
                collisionCarriers = this._filterAvoidCarrierToCarrierCombatCarriers(collisionCarriers);

                if (!collisionCarriers.length) {
                    continue;
                }

                // If all of the carriers that have collided are friendly then no need to do combat.
                let friendlyCarriers = collisionCarriers
                    .filter(c => c.carrier.ships! > 0 && c.carrier.ownedByPlayerId!.toString() === friendlyCarrier.carrier.ownedByPlayerId.toString());

                // If all other carriers are friendly then skip.
                if (friendlyCarriers.length === collisionCarriers.length) {
                    continue;
                }

                let friendlyPlayer = this.playerService.getById(game, friendlyCarrier.carrier.ownedByPlayerId)!;
                
                let combatCarriers = collisionCarriers
                    .map(c => c.carrier)
                    .filter(c => c.ships! > 0);

                // Double check that there are carriers that can fight.
                if (!combatCarriers.length) {
                    continue;
                }

                // If alliances is enabled then ensure that only enemies fight.
                // TODO: Alliance combat here is very complicated when more than 2 players are involved.
                // For now, we will perform normal combat if any participant is an enemy of the others.
                if (isAlliancesEnabled) {
                    const playerIds: DBObjectId[] = [...new Set(combatCarriers.map(x => x.ownedByPlayerId!))];

                    const isAllPlayersAllied = this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, playerIds);

                    if (isAllPlayersAllied) {
                        continue;
                    }
                }

                // TODO: Check for specialists that affect pre-combat.

                await this.combatService.performCombat(game, gameUsers, friendlyPlayer, null, combatCarriers);
            }
        }
    }

    _getCarrierPositionGraph(carrierPositions: CarrierPosition[]) {
        const graph = {};

        for (let carrierPosition of carrierPositions) {
            const graphKeyA = carrierPosition.destination.toString() + carrierPosition.source.toString();
            const graphKeyB = carrierPosition.source.toString() + carrierPosition.destination.toString();

            if (graphKeyA === graphKeyB) {
                continue;
            }

            const graphObj = graph[graphKeyA] || graph[graphKeyB];
            
            if (graphObj) {
                graphObj.push(carrierPosition);
            } else {
                graph[graphKeyA] = [ carrierPosition ];
            }
        }

        return graph;
    }

    _filterAvoidCarrierToCarrierCombatCarriers(carrierPositions: CarrierPosition[]): CarrierPosition[] {
        return carrierPositions.filter(c => {
            let specialist = this.specialistService.getByIdCarrier(c.carrier.specialistId);

            if (specialist && specialist.modifiers && specialist.modifiers.special 
                && specialist.modifiers.special.avoidCombatCarrierToCarrier) {
                return false;
            }

            return true;
        });
    }

    async _moveCarriers(game: Game, gameUsers: User[]) {
        // 1. Get all carriers that have waypoints ordered by the distance
        // they need to travel.
        // Note, we order by distance ascending for 2 reasons:
        //  1. To prevent carriers hopping over combat.
        //  2. To ensure that carriers who are closest to their destinations
        // land before any other carriers due to land in the same tick.
        let carriersInTransit: Carrier[] = [];

        let carriersWithWaypoints = game.galaxy.carriers.filter(c => c.waypoints.length);

        for (let i = 0; i < carriersWithWaypoints.length; i++) {
            let carrier = carriersWithWaypoints[i];
            let waypoint = carrier.waypoints[0];

            // If the waypoint has a delay on it for a carrier that is stationed
            // at a star, then we need to wait until there are no more delay ticks.
            if (waypoint.delayTicks && carrier.orbiting) {
                waypoint.delayTicks--;
                continue;
            }

            let destinationStar = this.starService.getById(game, waypoint.destination)!;

            // Save the distance travelled so it can be used later for combat.
            carrier.distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);
             
            carriersInTransit.push(carrier);
        }

        // Carriers in transit will prioritize carriers with the most ships first.
        // This is to ensure that capturing of unclaimed stars uses this priority.
        // TODO: This is more of a bodge to get around the unclaimed stars thing, it would
        // be better to refactor the capturing of unclaimed stars to occur after all movements
        // have taken place.
        carriersInTransit = carriersInTransit.sort((a, b) => {
            // Sort by ship count (highest ships first)
            if (a.ships! > b.ships!) return -1;
            if (a.ships! < b.ships!) return 1;

            // Then by distance (closest carrier first)
            return (a.distanceToDestination || 0) - (b.distanceToDestination || 0);
        });

        // 2. Iterate through each carrier, move it, then check for combat.
        // (DO NOT do any combat yet as we have to wait for all of the carriers to move)
        // Because carriers are ordered by distance to their destination,
        // this means that always the carrier that is closest to its destination
        // will land first. This is important for unclaimed stars and defender bonuses.

        let combatStars: Star[] = [];
        let actionWaypoints: CarrierActionWaypoint[] = [];

        for (let i = 0; i < carriersInTransit.length; i++) {
            let carrierInTransit = carriersInTransit[i];
        
            let carrierMovementReport = await this.carrierMovementService.moveCarrier(game, gameUsers, carrierInTransit);

            // If the carrier has arrived at the star then
            // append the movement waypoint to the array of action waypoints so that we can deal with it after combat.
            if (carrierMovementReport.arrivedAtStar) {
                actionWaypoints.push({
                    carrier: carrierInTransit,
                    star: carrierMovementReport.destinationStar,
                    waypoint: carrierMovementReport.waypoint
                });

                // Unset inboundAttack notification - if there is ever a way to reroute a carrier mid flight, this will need to be called there too
                await this.inboundAttacksService.unsetNotificationFlag(game, carrierInTransit)
            }

            // Check if combat is required, if so add the destination star to the array of combat stars to check later.
            if (carrierMovementReport.combatRequiredStar && combatStars.indexOf(carrierMovementReport.destinationStar) < 0) {
                combatStars.push(carrierMovementReport.destinationStar);
            }
        }

        // 3. Now that all carriers have finished moving, perform combat.
        for (let i = 0; i < combatStars.length; i++) {
            let combatStar = combatStars[i];

            // Get all carriers orbiting the star and perform combat.
            let carriersAtStar = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.toString() === combatStar._id.toString());

            let starOwningPlayer = this.playerService.getById(game, combatStar.ownedByPlayerId!)!;

            await this.combatService.performCombat(game, gameUsers, starOwningPlayer, combatStar, carriersAtStar);
        }

        // There may be carriers in the waypoint list that do not have any remaining ships or have been rerouted, filter them out.
        actionWaypoints = actionWaypoints.filter(x => x.carrier.orbiting && x.carrier.ships! > 0);

        // 4a. Now that combat is done, perform any carrier waypoint actions.
        // Do the drops first
        this.waypointService.performWaypointActionsDrops(game, actionWaypoints);

        // 4b. Build ships at star.
        this.starService.applyStarSpecialistSpecialModifiers(game);
        this.shipService.produceShips(game);

        // 4c. Do the rest of the waypoint actions.
        this.waypointService.performWaypointActionsCollects(game, actionWaypoints);
        this.waypointService.performWaypointActionsGarrisons(game, actionWaypoints);

        // 5. Send inbound attacks notifications
        this.inboundAttacksService.notifyInboundAttacks(game);

        // TODO: This is incredibly inefficient in large turn based games; moved it outside the main tick loop
        // for performance reasons because it needs to calculate the scanning ranges of all players.
        // Moving it out of here technically introduces a bug where carriers may travel to stars they cannot see _within_ a turn (rare occurrence).
        // Performance gain outweighs the risk of encountering this issue.
        // this._sanitiseDarkModeCarrierWaypoints(game);
    }

    async _combatContestedStars(game: Game, gameUsers: User[]) {
        // Note: Contested stars are only possible when formal alliances is enabled.
        if (!this.diplomacyService.isFormalAlliancesEnabled(game)) {
            return;
        }

        // Check for scenario where a player changes diplomatic status to another player.
        // Perform combat at contested stars.
        let contestedStars = this.starContestedService.listContestedStars(game);

        for (let i = 0; i < contestedStars.length; i++) {
            let contestedStar = contestedStars[i];

            let starOwningPlayer = this.playerService.getById(game, contestedStar.star.ownedByPlayerId!)!;

            await this.combatService.performCombat(game, gameUsers, starOwningPlayer, contestedStar.star, contestedStar.carriersInOrbit);
        }
    }

    async _captureAbandonedStars(game: Game, gameUsers: User[]) {
        // Note: Capturing abandoned stars in this way is only possible in the scenario
        // where a player has abandoned a star for an ally to capture who is already in orbit.
        if (!this.diplomacyService.isFormalAlliancesEnabled(game)) {
            return;
        }

        let contestedAbandonedStars = this.starContestedService.listContestedUnownedStars(game);

        for (let i = 0; i < contestedAbandonedStars.length; i++) {
            let contestedStar = contestedAbandonedStars[i];

            // The player who owns the carrier with the most ships will capture the star.
            let carrier = contestedStar.carriersInOrbit
                .sort((a: Carrier, b: Carrier) => b.ships! - a.ships!)[0];

            await this.starService.claimUnownedStar(game, gameUsers, contestedStar.star, carrier);
        }
    }

    _sanitiseDarkModeCarrierWaypoints(game: Game) {
        if (this.gameTypeService.isDarkMode(game)) {
            this.waypointService.sanitiseAllCarrierWaypointsByScanningRange(game);
        }
    }

    async _endOfGalacticCycleCheck(game: Game) {
        let hasProductionTicked: boolean = game.state.tick % game.settings.galaxy.productionTicks === 0;

        // Check if we have reached the production tick.
        if (hasProductionTicked) {
            game.state.productionTick++;

            // For each player, perform the end of cycle actions.
            // Give each player money.
            // Conduct experiments.
            for (let i = 0; i < game.galaxy.players.length; i++) {
                let player = game.galaxy.players[i];
                
                let creditsResult = this.playerCycleRewardsService.givePlayerCreditsEndOfCycleRewards(game, player);
                let experimentResult = this.researchService.conductExperiments(game, player);
                let carrierUpkeepResult = this.playerService.deductCarrierUpkeepCost(game, player);
                let allianceUpkeepResult: any | null = null; // TODO: Type

                if (this.diplomacyUpkeepService.isAllianceUpkeepEnabled(game)) {
                    let allianceCount = this.diplomacyService.getAlliesOfPlayer(game, player).length;
                    
                    allianceUpkeepResult = this.diplomacyUpkeepService.deductTotalUpkeep(game, player, creditsResult.creditsTotal, allianceCount); 
                }

                // Raise an event if the player isn't defeated, AI doesn't care about events.
                if (!player.defeated) {
                    let e: PlayerGalacticCycleCompletedEvent = {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        playerId: player._id,
                        creditsEconomy: creditsResult.creditsFromEconomy, 
                        creditsBanking: creditsResult.creditsFromBanking,
                        creditsSpecialists: creditsResult.creditsFromSpecialistsTechnology,
                        experimentTechnology: experimentResult.technology,
                        experimentTechnologyLevel: experimentResult.level,
                        experimentAmount: experimentResult.amount,
                        experimentLevelUp: experimentResult.levelUp,
                        experimentResearchingNext: experimentResult.researchingNext,
                        carrierUpkeep: carrierUpkeepResult,
                        allianceUpkeep: allianceUpkeepResult
                    };

                    this.emit(GameTickServiceEvents.onPlayerGalacticCycleCompleted, e);
                }
            }

            // Destroy stars for battle royale mode.
            if (game.settings.general.mode === 'battleRoyale') {
                this.battleRoyaleService.performBattleRoyaleTick(game);
            }

            this.emit(GameTickServiceEvents.onGameCycleEnded, {
                gameId: game._id
            });
        }

        return hasProductionTicked;
    }

    async _logHistory(game: Game) {
        await this.historyService.log(game);
    }

    async _gameLoseCheck(game: Game, gameUsers: User[]) {
        // Check to see if anyone has been defeated.
        // A player is defeated if they have no stars and no carriers remaining.
        let isTutorialGame = this.gameTypeService.isTutorialGame(game);
        let isTurnBasedGame = this.gameTypeService.isTurnBasedGame(game);
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

        for (let i = 0; i < undefeatedPlayers.length; i++) {
            let player = undefeatedPlayers[i];

            this.playerAfkService.performDefeatedOrAfkCheck(game, player);

            if (player.defeated) {
                game.state.players--; // Deduct number of active players from the game.

                let user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());

                if (player.afk) {
                    // Keep a log of players who have been afk so they cannot rejoin.
                    if (player.userId) {
                        game.afkers.push(player.userId);
                    }
            
                    if (user && !isTutorialGame) {
                        user.achievements.afk++;
                    }

                    let e: GamePlayerAFKEvent = {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        playerId: player._id,
                        playerAlias: player.alias
                    };

                    this.emit(GameTickServiceEvents.onPlayerAfk, e);
                }
                else {
                    if (user && !isTutorialGame) {
                        user.achievements.defeated++;

                        if (this.gameTypeService.is1v1Game(game)) {
                            user.achievements.defeated1v1++;
                        }
                    }

                    let e: GamePlayerDefeatedEvent = {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        playerId: player._id,
                        playerAlias: player.alias,
                        openSlot: false
                    };
                    
                    this.emit(GameTickServiceEvents.onPlayerDefeated, e);
                }
            }
        }

        this.gameStateService.updateStatePlayerCount(game);
    }

    async _gameWinCheck(game: Game, gameUsers: User[]) {
        const isTutorialGame = this.gameTypeService.isTutorialGame(game);


        // Update the leaderboard state here so we can keep track of positions
        // without having to actually calculate it.
        const leaderboard = this.leaderboardService.getGameLeaderboard(game).leaderboard;

        game.state.leaderboard = leaderboard.map(l => l.player._id);

        if (game.settings.general.readyToQuit === 'enabled' && this.gameService.checkReadyToQuit(game, leaderboard)) {
            const ticksRemaining = (game.settings.general.readyToQuitTimerCycles || 0) * game.settings.galaxy.productionTicks;
            if (game.state.ticksToEnd || game.state.ticksToEnd === 0) {
                game.state.ticksToEnd = Math.min(ticksRemaining, game.state.ticksToEnd);
            } else {
                game.state.ticksToEnd = ticksRemaining;
            }
        }

        let winner: GameWinner | null;

        if (this.gameTypeService.isTeamConquestGame(game)) {
            const teamLeaderboard = this.leaderboardService.getTeamLeaderboard(game)!.leaderboard;

            game.state.teamLeaderboard = teamLeaderboard.map(t => t.team._id);

            winner = this.leaderboardService.getGameWinnerTeam(game, teamLeaderboard);
        } else {
            winner = this.leaderboardService.getGameWinner(game, leaderboard);
        }

        if (winner) {
            this.gameStateService.finishGame(game, winner);

            for (const player of game.galaxy.players) {
                if (this.playerAfkService.isAIControlled(game, player, true)) {
                    this.aiService.cleanupState(player);
                }
            }

            if (!isTutorialGame) {
                let rankingResult: GameRankingResult | null = null;

                if (this.gameTypeService.isRankedGame(game)) {
                    rankingResult = this._awardEndGameRank(game, gameUsers, true);
                }

                // Mark all players as established regardless of game length.
                this.leaderboardService.markNonAFKPlayersAsEstablishedPlayers(game, gameUsers);
                this.leaderboardService.incrementPlayersCompletedAchievement(game, gameUsers);

                let e: GameEndedEvent = {
                    gameId: game._id,
                    gameTick: game.state.tick,
                    rankingResult
                };

                this.emit(GameTickServiceEvents.onGameEnded, e);
            }

            return true;
        }

        return false;
    }

    _awardEndGameRank(game: Game, gameUsers: User[], awardCredits: boolean) {
        let rankingResult: GameRankingResult | null = null;
    
        // There must have been at least X production ticks in order for
        // rankings to be added to players. This is to slow down players
        // should they wish to cheat the system.
        let productionTickCap = this.gameTypeService.is1v1Game(game) ? 1 : 2;
        let canAwardRank = this.gameTypeService.isRankedGame(game) && game.state.productionTick > productionTickCap;

        if (canAwardRank) {
            if (this.gameTypeService.isTeamConquestGame(game)) {
                let teamLeaderboard = this.leaderboardService.getTeamLeaderboard(game)!.leaderboard;

                rankingResult = this.leaderboardService.addTeamRankings(game, gameUsers, teamLeaderboard);

                // TODO: What kind of awards do we want for team games?
            } else {
                let leaderboard = this.leaderboardService.getGameLeaderboard(game).leaderboard;

                rankingResult = this.leaderboardService.addGameRankings(game, gameUsers, leaderboard);
                this.leaderboardService.incrementGameWinnerAchievements(game, gameUsers, leaderboard[0].player, awardCredits);
            }
        }

        // If the game is anonymous, then ranking results should be omitted from the game ended event.
        if (this.gameTypeService.isAnonymousGame(game)) {
            rankingResult = null;
        }
        
        return rankingResult;
    }

    async _playAI(game: Game) {
        for (let player of game.galaxy.players.filter(p => this.playerAfkService.isAIControlled(game, p, true))) {
            await this.aiService.play(game, player);
        }
    }

    _oneTickSpecialists(game: Game) {
        this.playerCycleRewardsService.giveFinancialAnalystCredits(game);
        this.starMovementService.moveStellarEngines(game);
        this.starService.pairWormHoleConstructors(game);
    }

    _clearExpiredSpecialists(game: Game) {
        this.specialistService.clearExpiredSpecialists(game);
    }

    _orbitGalaxy(game: Game) {
        if (this.gameTypeService.isOrbitalMode(game)) {
            this.starMovementService.orbitGalaxy(game);
        }
    }

    _countdownToEndCheck(game: Game) {
        if (
            this.gameStateService.isCountingDownToEnd(game) ||                                                      // Is already counting down
            (this.gameTypeService.isKingOfTheHillMode(game) && this.playerService.getKingOfTheHillPlayer(game))     // Is KotH and there is a king
        ) {
            this.gameStateService.countdownToEnd(game);
        }
    }

    _transferGiftsInOrbit(game: Game, gameUsers: User[]) {
        const carriers = this.carrierService.listGiftCarriersInOrbit(game);

        for (let carrier of carriers) {
            const star = this.starService.getById(game, carrier.orbiting!);

            this.carrierGiftService.transferGift(game, gameUsers, star, carrier);
        }
    }

    _emitEvents(game: Game) {
        if (this.gameTypeService.isTurnBasedGame(game)) {
            this.emit(GameTickServiceEvents.onGameTurnEnded, {
                gameId: game._id
            });
        }
    }
}
