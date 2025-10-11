import {CarrierWaypointBase, ValidationError} from "solaris-common";
import AvatarService from './avatar';
import BattleRoyaleService from './battleRoyale';
import CacheService from './cache';
import CarrierService from './carrier';
import DiplomacyService from './diplomacy';
import { DistanceService } from 'solaris-common';
import GameService from './game';
import GameFluxService from './gameFlux';
import GameMaskingService from "./gameMaskingService";
import GameStateService from './gameState';
import { GameTypeService } from 'solaris-common'
import UserGuildService from './guildUser';
import HistoryService from './history';
import MapService from './map';
import PlayerService from './player';
import PlayerAfkService from './playerAfk';
import PlayerStatisticsService from './playerStatistics';
import ReputationService from './reputation';
import ResearchService from './research';
import ShipService from './ship';
import SocketService from './socket';
import SpecialistService from './specialist';
import SpectatorService from './spectator';
import StarService from './star';
import { StarDistanceService } from 'solaris-common';
import StarMovementService from './starMovement';
import StarUpgradeService from './starUpgrade';
import TechnologyService from './technology';
import { Carrier } from './types/Carrier';
import { CarrierWaypoint } from 'solaris-common';
import { DBObjectId } from './types/DBObjectId';
import { Game } from './types/Game';
import {GameHistoryCarrier, GameHistoryCarrierWaypoint} from "./types/GameHistory";
import { Guild, GuildUserWithTag } from './types/Guild';
import { Player, PlayerDiplomaticState, PlayerReputation, PlayerResearch } from './types/Player';
import { Star } from './types/Star';
import WaypointService from './waypoint';
import mongoose from 'mongoose';

enum ViewpointKind {
    Basic,
    Finished,
    Perspectives,
}

type Viewpoint =
    | { kind: ViewpointKind.Basic }
    | { kind: ViewpointKind.Finished }
    | { kind: ViewpointKind.Perspectives, perspectives: Player[] };


export default class GameGalaxyService {
    cacheService: CacheService;
    socketService: SocketService;
    gameService: GameService;
    mapService: MapService;
    playerService: PlayerService;
    playerAfkService: PlayerAfkService;
    starService: StarService;
    shipService: ShipService;
    distanceService: DistanceService;
    starDistanceService: StarDistanceService;
    starUpgradeService: StarUpgradeService;
    carrierService: CarrierService;
    waypointService: WaypointService;
    researchService: ResearchService;
    specialistService: SpecialistService;
    technologyService: TechnologyService;
    reputationService: ReputationService;
    guildUserService: UserGuildService;
    historyService: HistoryService;
    battleRoyaleService: BattleRoyaleService;
    starMovementService: StarMovementService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    diplomacyService: DiplomacyService;
    avatarService: AvatarService;
    playerStatisticsService: PlayerStatisticsService;
    gameFluxService: GameFluxService;
    spectatorService: SpectatorService;
    gameMaskingService: GameMaskingService;

    constructor(
        cacheService: CacheService,
        socketService: SocketService,
        gameService: GameService,
        mapService: MapService,
        playerService: PlayerService,
        playerAfkService: PlayerAfkService,
        starService: StarService,
        shipService: ShipService,
        distanceService: DistanceService, 
        starDistanceService: StarDistanceService,
        starUpgradeService: StarUpgradeService,
        carrierService: CarrierService, 
        waypointService: WaypointService,
        researchService: ResearchService,
        specialistService: SpecialistService,
        technologyService: TechnologyService,
        reputationService: ReputationService,
        guildUserService: UserGuildService,
        historyService: HistoryService,
        battleRoyaleService: BattleRoyaleService,
        starMovementService: StarMovementService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        diplomacyService: DiplomacyService,
        avatarService: AvatarService,
        playerStatisticsService: PlayerStatisticsService,
        gameFluxService: GameFluxService,
        spectatorService: SpectatorService,
        gameMaskingService: GameMaskingService,
    ) {
        this.cacheService = cacheService;
        this.socketService = socketService;
        this.gameService = gameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.playerAfkService = playerAfkService;
        this.starService = starService;
        this.shipService = shipService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.waypointService = waypointService;
        this.researchService = researchService;
        this.specialistService = specialistService;
        this.technologyService = technologyService;
        this.reputationService = reputationService;
        this.guildUserService = guildUserService;
        this.historyService = historyService;
        this.battleRoyaleService = battleRoyaleService;
        this.starMovementService = starMovementService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.diplomacyService = diplomacyService;
        this.avatarService = avatarService;
        this.playerStatisticsService = playerStatisticsService;
        this.gameFluxService = gameFluxService;
        this.spectatorService = spectatorService;
        this.gameMaskingService = gameMaskingService;
    }

    async getGalaxy(gameId: DBObjectId, userId: DBObjectId | null, tick: number | null) {
        // Try loading the game for the user from the cache for historical ticks.
        let gameStateTick = await this.gameService.getGameStateTick(gameId);

        if (gameStateTick == null) {
            throw new ValidationError('Game not found.', 404);
        }

        let isHistorical = tick != null && tick !== gameStateTick; // Indicates whether we are requesting a specific tick and not the CURRENT state of the galaxy.

        let cached;

        if (!isHistorical) {
            tick = gameStateTick;
        } else {
            cached = this._getCachedGalaxy(gameId, userId, tick, gameStateTick);

            if (cached && cached.galaxy) {
                return cached.galaxy;
            }
        }

        let game: Game | null = await this.gameService.getByIdGalaxyLean(gameId);

        if (!game) {
            throw new ValidationError(`Game not found`, 404);
        }

        if (isHistorical && game.settings.general.timeMachine === 'disabled') {
            throw new ValidationError(`The time machine is disabled in this game.`);
        }
        else if (game.settings.general.timeMachine === 'enabled') {
            game.state.timeMachineMinimumTick = await this.historyService.getHistoryMinimumTick(gameId);
        }

        // Check if the user is playing in this game.
        const userPlayer = this._getUserPlayer(game, userId);

        // Remove who created the game.
        delete game.settings.general.createdByUserId;
        delete game.settings.general.password; // Don't really need to explain why this is removed.

        await this._maskGalaxy(game, userPlayer, isHistorical, tick);

        // Append the player stats to each player.
        this._setPlayerStats(game);

        // Append the destruction flag before doing any scanning culling because
        // we need to ensure that the flag is set based on ALL stars in the galaxy instead
        // of culled stars (for example dark galaxy star culling)
        if (this.gameTypeService.isBattleRoyaleMode(game) && !this.gameStateService.isFinished(game)) {
            this._appendStarsPendingDestructionFlag(game);
        }

        // Calculate what perspectives the user can see, i.e which players the user is spectating.
        const viewpoint = this._getViewpoint(game, userId, userPlayer);

        this._setReadyToQuitCount(game);

        // We always need to filter the player data so that it's basic info only.
        await this._setPlayerInfoBasic(game, userPlayer, viewpoint);

        // if the user isn't playing this game or spectating, then only return
        // basic data about the stars, exclude any important info like ships.
        // If the game has finished then everyone should be able to view the full game.
        if (viewpoint.kind === ViewpointKind.Basic) {
            this._setStarInfoBasic(game);
            this._clearPlayerCarriers(game);
        } else {
            this._setCarrierInfoDetailed(game, viewpoint);
            this._setStarInfoDetailed(game, userPlayer, viewpoint);
        }

        this._filterPlayerHomeStars(game);

        // For extra dark mode games, overwrite the player stats as by this stage
        // scanning range will have kicked in and filtered out stars and carriers the player
        // can't see and therefore global stats should display what the current player can see
        // instead of their actual values.
        // TODO: Better to not overwrite, but just not do it above in the first place?
        // Also, remove the leaderboard, since it should not be visible to players in extra
        // dark mode games.
        if (this.gameTypeService.isDarkModeExtra(game)) {
            this._setPlayerStats(game);
            game.state.leaderboard = null;
            game.state.teamLeaderboard = null;
        }

        // If any kind of dark mode, remove the galaxy center from the constants.
        if (this.gameTypeService.isDarkMode(game)) {
            delete game.constants.distances.galaxyCenterLocation;
        }

        // Add the flux object
        game.settings.general.flux = this.gameFluxService.getFluxById(game.settings.general.fluxId);

        if (isHistorical && cached) {
            this.cacheService.put(cached.cacheKey!, game, 1200000); // 20 minutes.
        }

        return game;
    }

    _filterPlayerHomeStars(game: Game) {
        for (let player of game.galaxy.players) {
            const homeStarId = player.homeStarId?.toString();

            if (homeStarId) {
                const homeStar = this.starService.getByIdBS(game, homeStarId);
                if (!homeStar?.isInScanningRange) {
                    delete player.homeStarId;
                }
            }
        }
    }

    _getCachedGalaxy(gameId: DBObjectId, userId: DBObjectId | null, requestedTick: number | null, currentTick: number) {
        // Cache up to 24 ticks, any more and its too much memory.
        // Note: If we limit how much history data is logged we will
        // need to update this logic.
        if (requestedTick && currentTick - requestedTick > 24) {
            return {
                cacheKey: null,
                galaxy: null
            };
        }

        if (!userId) {
            return null;
        }

        let cacheKey = `galaxy_${gameId}_${userId}_${requestedTick}`;
        let galaxy = null;

        let cached = this.cacheService.get(cacheKey);

        if (cached) {
            galaxy = cached;
        }

        return {
            cacheKey,
            galaxy
        };
    }

    _getUserPlayer(doc: Game, userId: DBObjectId | null) {
        if (!userId) {
            return null;
        }

        return doc.galaxy.players.find(x => x.userId && x.userId.toString() === userId.toString()) || null;
    }

    _setPlayerStats(doc: Game) {
        const isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(doc);

        let kingOfTheHillPlayer: Player | null = null;

        if (isKingOfTheHillMode) {
            kingOfTheHillPlayer = this.playerService.getKingOfTheHillPlayer(doc);
        }

        // Get all of the player's statistics.
        doc.galaxy.players.forEach(p => {
            p.stats = this.playerStatisticsService.getStats(doc, p);

            if (isKingOfTheHillMode) {
                p.isKingOfTheHill = kingOfTheHillPlayer != null && kingOfTheHillPlayer._id.toString() === p._id.toString();
            }
        });
    }

    _setReadyToQuitCount(game: Game) {
        if (game.settings.general.readyToQuitVisibility === 'hidden') {
            return;
        }

        game.state.readyToQuitCount = game.galaxy.players.filter((p) => !p.defeated && p.readyToQuit).length;
    }

    _setStarInfoBasic(doc: Game) {
        // Work out whether we are in dark galaxy mode.
        // This is true if the dark galaxy setting is enabled,
        // OR if its "start only" and the game has not yet started.
        const isDarkStart = this.gameTypeService.isDarkStart(doc);
        const isDarkMode = this.gameTypeService.isDarkMode(doc);
        const isDarkFogged = this.gameTypeService.isDarkFogged(doc);
        const isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(doc);

        let kingOfTheHillStar: Star | null = null;

        if (isKingOfTheHillMode) {
            kingOfTheHillStar = this.starService.getKingOfTheHillStar(doc);
        }

        // If its a dark galaxy start then return no stars.
        if (isDarkMode || isDarkFogged || (isDarkStart && !doc.state.startDate)) {
            doc.galaxy.stars = [];
        }

        doc.galaxy.stars = doc.galaxy.stars
        .map(s => {
            let star = {
                _id: s._id,
                name: s.name,
                ownedByPlayerId: s.ownedByPlayerId,
                location: s.location,
                warpGate: false,
                isNebula: false,
                isAsteroidField: false,
                isBinaryStar: false,
                isBlackHole: false,
                isPulsar: false,
                wormHoleToStarId: null
            } as Star;

            star.effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(doc, star);

            if (isKingOfTheHillMode) {
                star.isKingOfTheHillStar = kingOfTheHillStar != null && kingOfTheHillStar._id.toString() === s._id.toString();
            }

            return star;
        });
    }

    _setStarInfoDetailed(doc: Game, userPlayer: Player | null, viewpoint: Viewpoint) {
        const isFinished = this.gameStateService.isFinished(doc);
        const isDarkStart = this.gameTypeService.isDarkStart(doc);
        const isDarkMode = this.gameTypeService.isDarkMode(doc);
        const isDarkFogged = this.gameTypeService.isDarkFogged(doc);
        const isOrbital = this.gameTypeService.isOrbitalMode(doc);
        const isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(doc);

        let kingOfTheHillStar: Star | null = null;

        if (isKingOfTheHillMode) {
            kingOfTheHillStar = this.starService.getKingOfTheHillStar(doc);
        }

        // If dark start and game hasn't started yet OR is dark mode, then filter out
        // any stars the player cannot see in scanning range.
        if (viewpoint.kind === ViewpointKind.Perspectives && (isDarkMode || (isDarkStart && !doc.state.startDate))) {
            if (isDarkMode) {
                doc.galaxy.stars = this.starService.filterStarsByScanningRangeAndWaypointDestinations(doc, viewpoint.perspectives);
            } else {
                doc.galaxy.stars = this.starService.filterStarsByScanningRange(doc, viewpoint.perspectives);
            }
        }

        // Get all of the player's stars.
        let playerStars: Star[] = [];
        let playerScanningStars: Star[] = [];
        let playerCarriersInOrbit: Carrier[] = [];

        if (viewpoint.kind === ViewpointKind.Perspectives) {
            const perspectivePlayerIds = viewpoint.perspectives.map(p => p._id);
            playerStars = this.starService.listStarsOwnedByPlayers(doc.galaxy.stars, perspectivePlayerIds);
            playerScanningStars = this.starService.listStarsWithScanningRangeByPlayers(doc, perspectivePlayerIds);
            playerCarriersInOrbit = this.carrierService.listCarriersOwnedByPlayersInOrbit(doc.galaxy.carriers, perspectivePlayerIds);
        }

        // Work out which ones are not in scanning range and clear their data.
        doc.galaxy.stars = (doc.galaxy.stars as any[]) // TODO: Doing this to get around the whacky TS errors when deleting fields from the model
            .map(s => {
                s.effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(doc, s);

                // Calculate the star's terraformed resources.
                if (s.ownedByPlayerId) {
                    s.terraformedResources = this.starService.calculateTerraformedResources(s, s.effectiveTechs.terraforming);
                }

                // Round the Natural Resources
                s.naturalResources = this.starService.calculateActualNaturalResources(s);
                s.manufacturing = this.shipService.calculateStarManufacturing(doc, s);

                if (isOrbital) {
                    s.locationNext = this.starMovementService.getNextLocation(doc, s);
                }

                // If the star is dead then it has no infrastructure.
                if (this.starService.isDeadStar(s)) {
                    delete s.infrastructure;
                }

                if (isKingOfTheHillMode) {
                    s.isKingOfTheHillStar = kingOfTheHillStar != null && kingOfTheHillStar._id.toString() === s._id.toString();
                }

                // Ignore stars the player owns, they will always be visible.
                let isOwnedByCurrentPlayer = this.starService.getByIdBSForStars(playerStars, s._id);

                if (isOwnedByCurrentPlayer) {
                    // Calculate infrastructure upgrades for the star.
                    this.starUpgradeService.setUpgradeCosts(doc, s, s.terraformedResources!);

                    if (s.specialistId) {
                        s.specialist = this.specialistService.getByIdStar(s.specialistId);
                    }

                    // The player may be being spectated, so the ignore bulk upgrade stuff is only
                    // relevant for the user player.
                    if (userPlayer) {
                        s.ignoreBulkUpgrade = (s.ignoreBulkUpgrade || null) || this.starService.resetIgnoreBulkUpgradeStatuses(s);
                    } else {
                        delete s.ignoreBulkUpgrade;
                    }
                    
                    s.isInScanningRange = true;

                    return s;
                } else {
                    // Remove fields that other users shouldn't see.
                    delete s.ignoreBulkUpgrade;
                    delete s.shipsActual;
                }

                s.isInScanningRange = isFinished ||                                                         // The game is finished
                    this.starService.isStarWithinScanningRangeOfStars(doc, s, playerScanningStars) ||       // The star is within scanning range
                    playerCarriersInOrbit.find(c => c.orbiting!.toString() === s._id.toString()) != null;   // The star has a friendly carrier in orbit

                // If its in range then its all good, send the star back as is.
                // Otherwise only return a subset of the data.
                if (s.isInScanningRange) {
                    if (s.specialistId) {
                        s.specialist = this.specialistService.getByIdStar(s.specialistId);
                    }

                    if (isFinished) {
                        return s;
                    }

                    if (s.isNebula) {
                        delete s.infrastructure;
                        // NOTE: From this point, this star will be considered "dead", as star.isDeadStar(s)
                        // looks for the existence and thruthness of the naturalResources field.
                        // This had caused issues when a carrier orbiting allies nebula could not get tech scanning.
                        delete s.naturalResources;
                        delete s.terraformedResources;
                        delete s.manufacturing;
                    }

                    let canSeeStarShips = viewpoint.kind === ViewpointKind.Perspectives && this.starService.canPlayersSeeStarShips(s, viewpoint.perspectives.map(p => p._id));

                    if (!canSeeStarShips) {
                        s.ships = null;
                    }

                    return s;
                } else {
                    const mappedStar = {
                        _id: s._id,
                        name: s.name,
                        ownedByPlayerId: s.ownedByPlayerId,
                        location: s.location,
                        locationNext: s.locationNext,
                        warpGate: false, // Hide warp gates outside of scanning range
                        isNebula: false, // Hide nebula outside of scanning range
                        isAsteroidField: false, // Hide asteroid fields outside of scanning range
                        isBinaryStar: false, // Hide outside of scanning range
                        isBlackHole: false, // Hide outside of scanning range
                        isPulsar: s.isPulsar,
                        wormHoleToStarId: s.wormHoleToStarId,
                        isKingOfTheHillStar: s.isKingOfTheHillStar,
                        isInScanningRange: s.isInScanningRange,
                        effectiveTechs: null
                    } as any

                    mappedStar.effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(doc, mappedStar); // Redo effective techs

                    if (isDarkFogged && !s.isInScanningRange) {
                        mappedStar.ownedByPlayerId = null;
                    }
                    
                    return mappedStar;
                };
            }) as any;
    }

    _setCarrierInfoDetailed(doc: Game, viewpoint: Viewpoint) {
        const isFinished = this.gameStateService.isFinished(doc)
        const isOrbital = this.gameTypeService.isOrbitalMode(doc);

        // If the game hasn't finished we need to filter and sanitize carriers.
        if (viewpoint.kind !== ViewpointKind.Finished) {
            const perspectivePlayerIds = viewpoint.kind === ViewpointKind.Perspectives ? viewpoint.perspectives.map(p => p._id) : [];

            doc.galaxy.carriers = this.carrierService.filterCarriersByScanningRange(doc, perspectivePlayerIds);

            // Remove all waypoints (except those in transit) for all carriers that do not belong
            // to the player.
            doc.galaxy.carriers = this.carrierService.sanitizeCarriersByPlayers(doc, perspectivePlayerIds) as any;
        }

        // Populate the number of ticks it will take for all waypoints.
        doc.galaxy.carriers
            .forEach(c => {

                c.effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(doc, c);

                this.waypointService.populateCarrierWaypointEta(doc, c);

                if (c.specialistId) {
                    c.specialist = this.specialistService.getByIdCarrier(c.specialistId)
                }

                let canSeeCarrierShips = isFinished || (viewpoint.kind === ViewpointKind.Perspectives && this.carrierService.canPlayersSeeCarrierShips(doc, viewpoint.perspectives, c));

                if (!canSeeCarrierShips) {
                    c.ships = null;
                }

                if (isOrbital) {
                    c.locationNext = this.starMovementService.getNextLocation(doc, c);
                }
            });
    }

    async _setPlayerInfoBasic(doc: Game, userPlayer: Player | null, viewpoint: Viewpoint) {
        const avatars = this.avatarService.listAllAvatars();

        const isFinished = this.gameStateService.isFinished(doc);
        const isDarkModeExtra = this.gameTypeService.isDarkModeExtra(doc);

        let onlinePlayers = this.socketService.getOnlinePlayers(doc); // Need this for later.

        // Get the list of all guilds associated to players, we'll need this later.
        let guildUsers: GuildUserWithTag[] = [];

        if (!this.gameTypeService.isAnonymousGame(doc)) {
            let userIds: DBObjectId[] = doc.galaxy.players.filter(x => x.userId).map(x => x.userId!);
            guildUsers = await this.guildUserService.listUsersWithGuildTags(userIds)
        }

        // Calculate which players are in scanning range.
        let playersInRange: Player[] = [];

        if (userPlayer) {
            playersInRange = this.playerService.getPlayersWithinScanningRangeOfPlayer(doc, doc.galaxy.players, userPlayer);
        } else if (viewpoint.kind === ViewpointKind.Perspectives) {
            playersInRange = viewpoint.perspectives;

            const visited = new Set<string>();
            viewpoint.perspectives.forEach(p => visited.add(p._id.toString()))

            for (const player of viewpoint.perspectives) {
                const inRangeOfPlayer = this.playerService.getPlayersWithinScanningRangeOfPlayer(doc, doc.galaxy.players, player).filter(x => !visited.has(x._id.toString()));
                inRangeOfPlayer.forEach(p => visited.add(p._id.toString()));
                playersInRange = playersInRange.concat(inRangeOfPlayer);
            }
        }

        let displayOnlineStatus = doc.settings.general.playerOnlineStatus === 'visible';

        this._populatePlayerHasDuplicateIPs(doc);

        // Sanitize other players by only returning basic info about them.
        // We don't want players snooping on others via api responses containing sensitive info.
        doc.galaxy.players = doc.galaxy.players.map(p => {
            let isCurrentUserPlayer = userPlayer && p._id.toString() === userPlayer._id.toString();

            // Set whether the user has the perspective of this player. This is used on the UI for spectator view.
            p.hasPerspective = Boolean(viewpoint.kind === ViewpointKind.Perspectives && viewpoint.perspectives.find(otherPlayer => otherPlayer._id.toString() === p._id.toString()));

            // Append the guild tag to the player alias.
            let playerGuild: Guild | null = null;

            if (p.userId) {
                let guildUser = guildUsers.find(u => p.userId && u._id.toString() === p.userId.toString());

                if (guildUser && guildUser.displayGuildTag === 'visible') {
                    playerGuild = guildUser.guild;

                    if (playerGuild) {
                        p.alias += `[${playerGuild.tag}]`;
                    }
                }
            }

            // Calculate whether the user is AI controlled or not. If they are the current user
            // then do not include psuedo afk. We only want to check that for other players.
            p.isAIControlled = this.playerAfkService.isAIControlled(doc, p, !isCurrentUserPlayer);

            p.isInScanningRange = playersInRange.find(x => x._id.toString() === p._id.toString()) != null;
            p.shape = p.shape || 'circle'; // TODO: I don't know why the shape isn't being returned by mongoose defaults.
            p.avatar = p.avatar ? avatars.find(a => a.id.toString() === p.avatar!.toString())!.file : null; // TODO: We should made the ID a number and not a string as it is an ID.

            // If the user is in the game and it is the current
            // player we are looking at then return everything.
            if (isCurrentUserPlayer) {
                userPlayer!.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(doc, userPlayer!);
                userPlayer!.nextResearchTicksEta = this.researchService.calculateNextResearchETAInTicks(doc, userPlayer!);

                delete p.notes; // Don't need to send this back.
                delete p.lastSeenIP; // Super sensitive data.

                p.isRealUser = true;
                
                return p;
            }

            // NOTE: From this point onwards, the player is NOT the current user.

            if (!displayOnlineStatus) {
                p.lastSeen = null;
                p.isOnline = null;
            } else {
                // Work out whether the player is online.
                p.isOnline = isCurrentUserPlayer || onlinePlayers.find(op => op._id.toString() === p._id.toString()) != null;
            }

            let reputation: PlayerReputation | undefined = undefined;

            if (userPlayer) {
                reputation = this.reputationService.getReputation(p, userPlayer)?.reputation;
            }

            let research: PlayerResearch | null = {
                scanning: { 
                    level: p.research.scanning.level
                },
                hyperspace: { 
                    level: p.research.hyperspace.level
                },
                terraforming: { 
                    level: p.research.terraforming.level
                },
                experimentation: { 
                    level: p.research.experimentation.level
                },
                weapons: { 
                    level: p.research.weapons.level
                },
                banking: { 
                    level: p.research.banking.level
                },
                manufacturing: { 
                    level: p.research.manufacturing.level
                },
                specialists: { 
                    level: p.research.specialists.level
                }
            };

            // In ultra dark mode games, research is visible 
            // only to players who are within scanning range.
            if (!isFinished && isDarkModeExtra && !p.isInScanningRange) {
                research = null;
            }

            let diplomacy: PlayerDiplomaticState[] = [];

            if (userPlayer) {
                diplomacy = this.diplomacyService.getFilteredDiplomacy(p, userPlayer);
            }

            // Return a subset of the user, key info only.
            // @ts-ignore
            const resultPlayer = {
                _id: p._id,
                isRealUser: p.userId != null,
                isAIControlled: p.isAIControlled,
                homeStarId: p.homeStarId,
                colour: p.colour,
                shape: p.shape,
                research,
                isOpenSlot: p.isOpenSlot,
                isInScanningRange: p.isInScanningRange,
                defeated: p.defeated,
                defeatedDate: p.defeatedDate,
                afk: p.afk,
                ready: p.ready,
                readyToQuit: p.readyToQuit,
                missedTurns: p.missedTurns,
                alias: p.alias,
                avatar: p.avatar,
                stats: p.stats,
                reputation,
                lastSeen: p.lastSeen,
                isOnline: p.isOnline,
                guild: playerGuild,
                hasDuplicateIP: p.hasDuplicateIP,
                hasFilledAfkSlot: p.hasFilledAfkSlot,
                isKingOfTheHill: p.isKingOfTheHill,
                hasPerspective: p.hasPerspective,
                diplomacy,
            } as Player;

            this._maskReadyToQuitState(doc, resultPlayer);

            return resultPlayer;
        }) as any;
    }

    _getViewpoint(game: Game, userId: DBObjectId | null, userPlayer: Player | null): Viewpoint {
        if (this.gameStateService.isFinished(game)) {
            return {
                kind: ViewpointKind.Finished
            };
        }

        // Check if the user is playing in this game, if so they can only see from
        // their own perspective.

        if (userPlayer) {
            return {
                kind: ViewpointKind.Perspectives,
                perspectives: [userPlayer]
            };
        }

        // If the user is spectating then they can see from the perspectives of all
        // players who they are spectating.
        // If they are a player themselves, the spectator perspective is ignored
        if (userId && this.spectatorService.isSpectatingEnabled(game)) {
            const spectating = this.spectatorService.listSpectatingPlayers(game, userId);

            if (spectating.length) {
                return {
                    kind: ViewpointKind.Perspectives,
                    perspectives: spectating
                };
            }
        }



        return {
            kind: ViewpointKind.Basic
        };
    }

    _maskReadyToQuitState(game: Game, player: Player) {
        if (game.settings.general.readyToQuitVisibility !== 'visible') {
            delete player.readyToQuit;
        }
    }

    _populatePlayerHasDuplicateIPs(game: Game) {
        if (game.settings.general.playerIPWarning === 'disabled') {
            return;
        }

        for (let player of game.galaxy.players) {
            player.hasDuplicateIP = this.playerService.hasDuplicateLastSeenIP(game, player);
        }
    }

    _hasGameStarted(doc: Game) {
        return doc.state.startDate != null;
    }

    _clearPlayerCarriers(doc: Game) {
        doc.galaxy.carriers = [];
    }

    _fromHistoryCarrier(historyCarrier: GameHistoryCarrier): Carrier {
        return {
            _id: historyCarrier.carrierId,
            isGift: historyCarrier.isGift,
            location: historyCarrier.location,
            locationNext: undefined,
            name: historyCarrier.name,
            orbiting: historyCarrier.orbiting,
            ownedByPlayerId: historyCarrier.ownedByPlayerId,
            ships: historyCarrier.ships,
            specialist: historyCarrier.specialistId && this.specialistService.getById(historyCarrier.specialistId, 'carrier'),
            specialistExpireTick: null,
            specialistId: historyCarrier.specialistId,
            waypoints: historyCarrier.waypoints.map(w => this._waypointFromHistory(w)),
            waypointsLooped: false,
        } as any as Carrier;
    }

    async _maskGalaxy(game: Game, userPlayer: Player | null, isHistorical: boolean, tick: number | null) {
        /*
            Masking of galaxy data occurs here, it prevent players from seeing what other
            players are doing until the tick has finished.

            This will be a combination of the current state of the galaxy for the player and
            the previous tick's galaxy data for other players.

            The following logic will be applied to the galaxy:
            1. Apply previous tick's data to all STARS the player does not own.
                - Ships, specialist, warp gate and infrastructure needs to be reset.
            2. Apply previous tick's data to all CARRIERS the player does not own.
                - Remove any carriers that exist in the current tick but not in the previous tick.
                - Ships, specialist and gift status needs to be reset.
            3. Continue to run through current logic as we do today.
        */

        const history = await this.historyService.getHistoryByTick(game._id, tick);

        if (!history) {
            return;
        }

        // Support for legacy games, not all history for players/stars/carriers have been logged so
        // bomb out if we're missing any of those.
        if (!history.players.length || !history.stars.length || !history.carriers.length) {
            return;
        }

        // If in historical mode, apply the previous tick's data for all players.
        // If the user is requesting the current tick then we need to ensure that the
        // data returned for players is based on the current state of the game because
        // players can be defeated, afk'd, ready etc. Player data does not need to be
        // masked if requesting the current tick.
        if (isHistorical) {
            for (let i = 0; i < game.galaxy.players.length; i++) {
                let gamePlayer = game.galaxy.players[i];

                let historyPlayer = history.players.find(x => x.playerId.toString() === gamePlayer._id.toString());

                if (historyPlayer) {
                    gamePlayer.userId = historyPlayer.userId;
                    gamePlayer.alias = historyPlayer.alias;
                    gamePlayer.avatar = historyPlayer.avatar;
                    gamePlayer.researchingNow = historyPlayer.researchingNow;
                    gamePlayer.researchingNext = historyPlayer.researchingNext;
                    gamePlayer.credits = historyPlayer.credits;
                    gamePlayer.creditsSpecialists = historyPlayer.creditsSpecialists;
                    gamePlayer.isOpenSlot = historyPlayer.isOpenSlot;
                    gamePlayer.defeated = historyPlayer.defeated;
                    gamePlayer.defeatedDate = historyPlayer.defeatedDate;
                    gamePlayer.afk = historyPlayer.afk;
                    gamePlayer.research = historyPlayer.research;
                    gamePlayer.ready = historyPlayer.ready;
                    gamePlayer.readyToQuit = historyPlayer.readyToQuit;
                }

                this._maskReadyToQuitState(game, gamePlayer);
            }
        }

        this.gameMaskingService.maskStars(game, userPlayer, history, isHistorical);

        // Apply previous tick's data to all CARRIERS the player does not own.
        // If historical mode, then its all carrier data in the requested tick.
        // If not historical mode, then replace non-player owned carrier data.
        for (let i = 0; i < game.galaxy.carriers.length; i++) {
            let gameCarrier = game.galaxy.carriers[i];

            if (!isHistorical && userPlayer && gameCarrier.ownedByPlayerId!.toString() === userPlayer._id.toString()) {
                continue;
            }

            let historyCarrier = history.carriers.find(x => x.carrierId.toString() === gameCarrier._id.toString());

            // Remove any carriers that exist in the current tick but not in the previous tick.
            if (!historyCarrier) {
                game.galaxy.carriers.splice(i, 1);
                i--;
                continue;
            }

            gameCarrier.ownedByPlayerId = historyCarrier.ownedByPlayerId;
            gameCarrier.name = historyCarrier.name;
            gameCarrier.orbiting = historyCarrier.orbiting;
            gameCarrier.ships = historyCarrier.ships;
            gameCarrier.specialistId = historyCarrier.specialistId;
            gameCarrier.isGift = historyCarrier.isGift;
            gameCarrier.location = historyCarrier.location;
            gameCarrier.waypoints = historyCarrier.waypoints as CarrierWaypoint<DBObjectId>[];
        }

        // Add any carriers that were in the previous tick that do not exist in the current tick
        // This is only applicable when requesting a historical tick as the current tick may have
        // destroyed carriers.
        if (isHistorical) {
            for (let historyCarrier of history.carriers) {
                let gameCarrier = game.galaxy.carriers.find(x => x._id.toString() === historyCarrier.carrierId.toString());
                
                if (!gameCarrier) {
                    game.galaxy.carriers.push(this._fromHistoryCarrier(historyCarrier));
                }
            }
        }

        // Add any carriers that were destroyed in orbit in the current tick.
        // This is to account for abandoned stars where carriers are destroyed.
        if (!isHistorical) {
            const carrierInOrbitToAdd = history.carriers.filter(c => c.orbiting && (!userPlayer || c.ownedByPlayerId!.toString() !== userPlayer._id.toString()))

            for (let historyCarrier of carrierInOrbitToAdd) {
                let gameCarrier = game.galaxy.carriers.find(x => x._id.toString() === historyCarrier.carrierId.toString());
                
                if (!gameCarrier) {
                    game.galaxy.carriers.push(this._fromHistoryCarrier(historyCarrier));
                }
            }
        }

        // If the user is requesting a specific tick then we also need to update the game state to match
        if (isHistorical) {
            game.state.tick = history.tick
            game.state.productionTick = history.productionTick
        }
    }

    _appendStarsPendingDestructionFlag(game: Game) {
        let pendingStars = this.battleRoyaleService.getStarsToDestroyPreview(game);

        for (let pendingStar of pendingStars) {
            pendingStar.targeted = true;
        }
    }

    _waypointFromHistory(wp: GameHistoryCarrierWaypoint) {
        return {
            _id: new mongoose.Types.ObjectId(),
            source: wp.source,
            destination: wp.destination,
            action: 'nothing',
            actionShips: 0,
            delayTicks: 0
        } as CarrierWaypointBase<DBObjectId>;
    }

};
