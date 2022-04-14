import { DBObjectId } from "../types/DBObjectId";
import { Carrier, CarrierPosition } from "../types/Carrier";
import { Game } from "../types/Game";
import { User } from "../types/User";
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
import LeaderboardService from "./leaderboard";
import OrbitalMechanicsService from "./orbitalMechanics";
import PlayerService from "./player";
import ReputationService from "./reputation";
import ResearchService from "./research";
import SpecialistService from "./specialist";
import StarService from "./star";
import StarUpgradeService from "./starUpgrade";
import TechnologyService from "./technology";
import UserService from "./user";
import WaypointService from "./waypoint";
import { CarrierActionWaypoint } from "../types/GameTick";
import { Star } from "../types/Star";
import { GameRankingResult } from "../types/Rating";
import DiplomacyUpkeepService from "./diplomacyUpkeep";
import CarrierGiftService from "./carrierGift";
import CarrierMovementService from "./carrierMovement";
import PlayerCycleRewardsService from "./playerCycleRewards";
import StarContestedService from "./starContested";
import PlayerReadyService from "./playerReady";

const EventEmitter = require('events');
const moment = require('moment');

export default class GameTickService extends EventEmitter {
    distanceService: DistanceService;
    starService: StarService;
    carrierService: CarrierService;
    researchService: ResearchService;
    playerService: PlayerService;
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
    orbitalMechanicsService: OrbitalMechanicsService;
    diplomacyService: DiplomacyService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    playerCycleRewardsService: PlayerCycleRewardsService;
    diplomacyUpkeepService: DiplomacyUpkeepService;
    carrierMovementService: CarrierMovementService;
    carrierGiftService: CarrierGiftService;
    starContestedService: StarContestedService;
    playerReadyService: PlayerReadyService;
    
    constructor(
        distanceService: DistanceService,
        starService: StarService,
        carrierService: CarrierService,
        researchService: ResearchService,
        playerService: PlayerService,
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
        orbitalMechanicsService: OrbitalMechanicsService,
        diplomacyService: DiplomacyService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        playerCycleRewardsService: PlayerCycleRewardsService,
        diplomacyUpkeepService: DiplomacyUpkeepService,
        carrierMovementService: CarrierMovementService,
        carrierGiftService: CarrierGiftService,
        starContestedService: StarContestedService,
        playerReadyService: PlayerReadyService
    ) {
        super();
            
        this.distanceService = distanceService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.researchService = researchService;
        this.playerService = playerService;
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
        this.orbitalMechanicsService = orbitalMechanicsService;
        this.diplomacyService = diplomacyService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.playerCycleRewardsService = playerCycleRewardsService;
        this.diplomacyUpkeepService = diplomacyUpkeepService;
        this.carrierMovementService = carrierMovementService;
        this.carrierGiftService = carrierGiftService;
        this.starContestedService = starContestedService;
        this.playerReadyService = playerReadyService;
    }

    async tick(gameId: DBObjectId) {
        let game = await this.gameService.getByIdAll(gameId);

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
        console.info(`[${game.settings.general.name}] - Game tick started.`);

        game.state.lastTickDate = moment().utc();

        let taskTime = process.hrtime();
        let taskTimeEnd: [number, number] | null = null;

        let logTime = (taskName: string) => {
            taskTimeEnd = process.hrtime(taskTime);
            taskTime = process.hrtime();
            console.info(`[${game.settings.general.name}] - ${taskName}: %ds %dms'`, taskTimeEnd[0], taskTimeEnd[1] / 1000000);
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

            this._awardCreditsPerTick(game);
            logTime('Award tick credits from specialists');

            this._orbitGalaxy(game);
            logTime('Orbital mechanics');

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

        this.playerReadyService.resetReadyStatuses(game, hasProductionTicked);

        await game.save();
        logTime('Save game');

        // Save user profile achievements if any have changed.
        for (let user of gameUsers) {
            await user.save();
        }

        logTime('Save users');

        let endTime = process.hrtime(startTime);

        console.info(`[${game.settings.general.name}] - Game tick ended: %ds %dms'`, endTime[0], endTime[1] / 1000000);
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

        if (this.gameService.isAllUndefeatedPlayersReadyToQuit(game)) {
            return true;
        }

        let lastTick = moment(game.state.lastTickDate).utc();
        let nextTick;
        
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

            let destinationStar = game.galaxy.stars.find(s => s._id.toString() === waypoint.destination.toString())!;

            // Save the distance travelled so it can be used later for combat.
            carrier.distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);
             
            carriersInTransit.push(carrier);
        }

        carriersInTransit = carriersInTransit.sort((a, b) => a.distanceToDestination! - b.distanceToDestination!);

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
        this.starService.produceShips(game);

        // 4c. Do the rest of the waypoint actions.
        this.waypointService.performWaypointActionsCollects(game, actionWaypoints);
        this.waypointService.performWaypointActionsGarrisons(game, actionWaypoints);

        this._sanitiseDarkModeCarrierWaypoints(game);
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

            this.starService.claimUnownedStar(game, gameUsers, contestedStar.star, carrier);
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
                    this.emit('onPlayerGalacticCycleCompleted', {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        player, 
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
                    });
                }
            }

            // Destroy stars for battle royale mode.
            if (game.settings.general.mode === 'battleRoyale') {
                this.battleRoyaleService.performBattleRoyaleTick(game);
            }

            this.emit('onGameCycleEnded', {
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

            this.playerService.performDefeatedOrAfkCheck(game, player, isTurnBasedGame);

            if (player.defeated) {
                game.state.players--; // Deduct number of active players from the game.

                let user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());

                if (player.afk) {
                    // Keep a log of players who have been afk so they cannot rejoin.
                    if (player.userId) {
                        game.afkers.push(player.userId);
                    }
            
                    // AFK counts as a defeat as well.
                    if (user && !isTutorialGame) {
                        user.achievements.defeated++;
                        user.achievements.afk++;
                    }

                    this.emit('onPlayerAfk', {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        player
                    });
                }
                else {
                    if (user && !isTutorialGame) {
                        user.achievements.defeated++;
                    }

                    this.emit('onPlayerDefeated', {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        player
                    });
                }
            }
        }

        this.gameStateService.updateStatePlayerCount(game);
    }

    async _gameWinCheck(game: Game, gameUsers: User[]) {
        let isTutorialGame = this.gameTypeService.isTutorialGame(game);

        let winner = this.leaderboardService.getGameWinner(game);

        if (winner) {
            this.gameStateService.finishGame(game, winner);

            if (!isTutorialGame) {
                let rankingResult: GameRankingResult | null = null;
    
                // There must have been at least X production ticks in order for
                // rankings to be added to players. This is to slow down players
                // should they wish to cheat the system.
                let productionTickCap = this.gameTypeService.is1v1Game(game) ? 1 : 2;

                if (game.state.productionTick > productionTickCap) {
                    let leaderboard = this.leaderboardService.getLeaderboardRankings(game).leaderboard;
                    
                    rankingResult = await this.leaderboardService.addGameRankings(game, gameUsers, leaderboard);
                }

                // Mark all players as established regardless of game length.
                this.leaderboardService.markNonAFKPlayersAsEstablishedPlayers(game, gameUsers);

                // If the game is anonymous, then ranking results should be omitted from the game ended event.
                if (this.gameTypeService.isAnonymousGame(game)) {
                    rankingResult = null;
                }
                
                this.emit('onGameEnded', {
                    gameId: game._id,
                    gameTick: game.state.tick,
                    rankingResult
                });
            }

            return true;
        }

        return false;
    }

    async _playAI(game: Game) {
        for (let player of game.galaxy.players.filter(p => p.defeated)) {
            await this.aiService.play(game, player);
        }
    }

    _awardCreditsPerTick(game: Game) {
        for (let player of game.galaxy.players) {
            let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
                                .filter(s => !this.starService.isDeadStar(s));

            for (let star of playerStars) {
                let creditsByScience = this.specialistService.getCreditsPerTickByScience(star);

                player.credits += creditsByScience * star.infrastructure.science!;
            }
        }
    }

    _orbitGalaxy(game: Game) {
        if (this.gameTypeService.isOrbitalMode(game)) {
            for (let star of game.galaxy.stars) {
                this.orbitalMechanicsService.orbitStar(game, star);
            }

            for (let carrier of game.galaxy.carriers) {
                this.orbitalMechanicsService.orbitCarrier(game, carrier);
            }

            for (let carrier of game.galaxy.carriers) {
                this.waypointService.cullWaypointsByHyperspaceRange(game, carrier);
            }
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
}
