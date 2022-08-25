import { DBObjectId } from './types/DBObjectId';
import ValidationError from '../errors/validation';
import { Game } from './types/Game';
import { Player, PlayerDiplomaticState, PlayerReputation, PlayerResearch } from './types/Player';
import BattleRoyaleService from './battleRoyale';
import BroadcastService from './broadcast';
import CacheService from './cache';
import CarrierService from './carrier';
import DiplomacyService from './diplomacy';
import DistanceService from './distance';
import GameService from './game';
import GameStateService from './gameState';
import GameTypeService from './gameType';
import UserGuildService from './guildUser';
import HistoryService from './history';
import MapService from './map';
import StarMovementService from './starMovement';
import PlayerService from './player';
import ReputationService from './reputation';
import ResearchService from './research';
import SpecialistService from './specialist';
import StarService from './star';
import StarDistanceService from './starDistance';
import StarUpgradeService from './starUpgrade';
import TechnologyService from './technology';
import WaypointService from './waypoint';
import { Star } from './types/Star';
import { Guild, GuildUserWithTag } from './types/Guild';
import { CarrierWaypoint } from './types/CarrierWaypoint';
import { Carrier } from './types/Carrier';
import AvatarService from './avatar';
import PlayerStatisticsService from './playerStatistics';
import GameFluxService from './gameFlux';
import PlayerAfkService from './playerAfk';

export default class GameGalaxyService {
    cacheService: CacheService;
    broadcastService: BroadcastService;
    gameService: GameService;
    mapService: MapService;
    playerService: PlayerService;
    playerAfkService: PlayerAfkService;
    starService: StarService;
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

    constructor(
        cacheService: CacheService,
        broadcastService: BroadcastService,
        gameService: GameService,
        mapService: MapService,
        playerService: PlayerService,
        playerAfkService: PlayerAfkService,
        starService: StarService,
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
        gameFluxService: GameFluxService
    ) {
        this.cacheService = cacheService;
        this.broadcastService = broadcastService;
        this.gameService = gameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.playerAfkService = playerAfkService;
        this.starService = starService;
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

        // Check if the user is playing in this game.
        let userPlayer = this._getUserPlayer(game, userId);

        // If the user is a spectator then they are allowed to see the entire galaxy.
        const isSpectator = userPlayer == null && game.spectators!.find(s => s.toString() === userId!.toString()) != null;

        // Remove who created the game.
        delete game.settings.general.createdByUserId;
        delete game.settings.general.password; // Don't really need to explain why this is removed.
        delete game.spectators; // Don't want to pass back user ids of spectators

        await this._maskGalaxy(game, userPlayer, isHistorical, tick);

        // Append the player stats to each player.
        this._setPlayerStats(game);

        // Append the destruction flag before doing any scanning culling because
        // we need to ensure that the flag is set based on ALL stars in the galaxy instead
        // of culled stars (for example dark galaxy star culling)
        if (this.gameTypeService.isBattleRoyaleMode(game) && !this.gameStateService.isFinished(game)) {
            this._appendStarsPendingDestructionFlag(game);
        }

        if (!isSpectator) {
            // if the user isn't playing this game, then only return
            // basic data about the stars, exclude any important info like ships.
            // If the game has finished then everyone should be able to view the full game.
            if (!userPlayer && !this.gameStateService.isFinished(game)) {
                this._setStarInfoBasic(game);

                // Also remove all carriers from players.
                this._clearPlayerCarriers(game);
            } else {
                // Populate the rest of the details about stars,
                // carriers and players providing that they are in scanning range.
                this._setCarrierInfoDetailed(game, userPlayer!);
                this._setStarInfoDetailed(game, userPlayer!);
            }
        }

        // We need to filter the player data so that it's basic info.
        await this._setPlayerInfoBasic(game, userPlayer);

        // For extra dark mode games, overwrite the player stats as by this stage
        // scanning range will have kicked in and filtered out stars and carriers the player
        // can't see and therefore global stats should display what the current player can see
        // instead of their actual values.
        // TODO: Better to not overwrite, but just not do it above in the first place.
        if (this.gameTypeService.isDarkModeExtra(game)) {
            this._setPlayerStats(game);
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

    _setStarInfoBasic(doc: Game) {
        // Work out whether we are in dark galaxy mode.
        // This is true if the dark galaxy setting is enabled,
        // OR if its "start only" and the game has not yet started.
        const isDarkStart = this.gameTypeService.isDarkStart(doc);
        const isDarkMode = this.gameTypeService.isDarkMode(doc);
        const isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(doc);

        let kingOfTheHillStar: Star | null = null;

        if (isKingOfTheHillMode) {
            kingOfTheHillStar = this.starService.getKingOfTheHillStar(doc);
        }

        // If its a dark galaxy start then return no stars.
        if (isDarkMode || (isDarkStart && !doc.state.startDate)) {
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

            if (isKingOfTheHillMode) {
                star.isKingOfTheHillStar = kingOfTheHillStar != null && kingOfTheHillStar._id.toString() === s._id.toString();
            }

            return star;
        });
    }

    _setStarInfoDetailed(doc: Game, player: Player) { 
        const isFinished = this.gameStateService.isFinished(doc);
        const isDarkStart = this.gameTypeService.isDarkStart(doc);
        const isDarkMode = this.gameTypeService.isDarkMode(doc);
        const isOrbital = this.gameTypeService.isOrbitalMode(doc);
        const isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(doc);

        let kingOfTheHillStar: Star | null = null;

        if (isKingOfTheHillMode) {
            kingOfTheHillStar = this.starService.getKingOfTheHillStar(doc);
        }

        // If dark start and game hasn't started yet OR is dark mode, then filter out
        // any stars the player cannot see in scanning range.
        if (!isFinished && (isDarkMode || (isDarkStart && !doc.state.startDate))) {
            if (isDarkMode) {
                doc.galaxy.stars = this.starService.filterStarsByScanningRangeAndWaypointDestinations(doc, player);
            } else {
                doc.galaxy.stars = this.starService.filterStarsByScanningRange(doc, player);
            }
        }

        // Get all of the player's stars.
        let playerStars: Star[] = [];
        let playerScanningStars: Star[] = [];
        let playerCarriersInOrbit: Carrier[] = [];

        if (player) {
            playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, player._id);
            playerScanningStars = this.starService.listStarsWithScanningRangeByPlayer(doc, player._id);
            playerCarriersInOrbit = this.carrierService.listCarriersOwnedByPlayerInOrbit(doc.galaxy.carriers, player._id);
        }

        // Work out which ones are not in scanning range and clear their data.
        doc.galaxy.stars = doc.galaxy.stars
            .map(s => {
                delete s.shipsActual; // Don't need to send this back.

                // Calculate the star's terraformed resources.
                if (s.ownedByPlayerId) {
                    let owningPlayerEffectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(doc, s);

                    s.terraformedResources = this.starService.calculateTerraformedResources(s, owningPlayerEffectiveTechs.terraforming);
                }

                // Round the Natural Resources
                s.naturalResources = this.starService.calculateActualNaturalResources(s);

                if (isOrbital) {
                    s.locationNext = this.starMovementService.getNextLocation(doc, s);
                }

                // If the star is dead then it has no infrastructure.
                if (this.starService.isDeadStar(s)) {
                    s.infrastructure.economy = null;
                    s.infrastructure.industry = null;
                    s.infrastructure.science = null;
                }

                if (isKingOfTheHillMode) {
                    s.isKingOfTheHillStar = kingOfTheHillStar != null && kingOfTheHillStar._id.toString() === s._id.toString();
                }

                // Ignore stars the player owns, they will always be visible.
                let isOwnedByCurrentPlayer = playerStars.find(y => y._id.toString() === s._id.toString());

                if (isOwnedByCurrentPlayer) {
                    // Calculate infrastructure upgrades for the star.
                    this.starUpgradeService.setUpgradeCosts(doc, s, s.terraformedResources!);

                    if (s.specialistId) {
                        s.specialist = this.specialistService.getByIdStar(s.specialistId);
                    }

                    s.ignoreBulkUpgrade = (s.ignoreBulkUpgrade || null) || this.starService.resetIgnoreBulkUpgradeStatuses(s);

                    return s;
                } else {
                    // Remove fields that the user player shouldn't see.
                    delete s.ignoreBulkUpgrade;
                }

                // Get the closest player star to this star.
                let inRange = isFinished ||                                                                 // The game is finished
                    this.starService.isStarWithinScanningRangeOfStars(doc, s, playerScanningStars) ||       // The star is within scanning range
                    playerCarriersInOrbit.find(c => c.orbiting!.toString() === s._id.toString()) != null;   // The star has a friendly carrier in orbit

                // If its in range then its all good, send the star back as is.
                // Otherwise only return a subset of the data.
                if (inRange) {
                    if (s.specialistId) {
                        s.specialist = this.specialistService.getByIdStar(s.specialistId);
                    }

                    let canSeeStarShips = isFinished || (player && this.starService.canPlayerSeeStarShips(player, s));

                    if (!canSeeStarShips) {
                        s.ships = null;
                    }

                    return s;
                } else {
                    return {
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
                        isPulsar: false, // Hide outside of scanning range
                        wormHoleToStarId: s.wormHoleToStarId,
                        isKingOfTheHillStar: s.isKingOfTheHillStar
                    }
                };
            }) as any;
    }

    _setCarrierInfoDetailed(doc: Game, userPlayer: Player) {
        const isFinished = this.gameStateService.isFinished(doc);
        const isOrbital = this.gameTypeService.isOrbitalMode(doc);

        // If the game hasn't finished we need to filter and sanitize carriers.
        if (!this.gameStateService.isFinished(doc)) {
            doc.galaxy.carriers = this.carrierService.filterCarriersByScanningRange(doc, userPlayer);

            // Remove all waypoints (except those in transit) for all carriers that do not belong
            // to the player.
            doc.galaxy.carriers = this.carrierService.sanitizeCarriersByPlayer(doc, userPlayer) as any;
        }

        // Populate the number of ticks it will take for all waypoints.
        doc.galaxy.carriers
            .forEach(c => {
                this.waypointService.populateCarrierWaypointEta(doc, c);

                if (c.specialistId) {
                    c.specialist = this.specialistService.getByIdCarrier(c.specialistId)
                }

                let canSeeCarrierShips = isFinished || (userPlayer && this.carrierService.canPlayerSeeCarrierShips(doc, userPlayer, c));

                if (!canSeeCarrierShips) {
                    c.ships = null;
                }

                if (isOrbital) {
                    c.locationNext = this.starMovementService.getNextLocation(doc, c);
                }
            });
    }

    async _setPlayerInfoBasic(doc: Game, userPlayer: Player | null) {
        const avatars = this.avatarService.listAllAvatars();

        const isFinished = this.gameStateService.isFinished(doc);
        const isDarkModeExtra = this.gameTypeService.isDarkModeExtra(doc);

        let onlinePlayers = this.broadcastService.getOnlinePlayers(doc); // Need this for later.

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
        }

        let displayOnlineStatus = doc.settings.general.playerOnlineStatus === 'visible';

        this._populatePlayerHasDuplicateIPs(doc);

        // Sanitize other players by only returning basic info about them.
        // We don't want players snooping on others via api responses containing sensitive info.
        doc.galaxy.players = doc.galaxy.players.map(p => {
            let isCurrentUserPlayer = userPlayer && p._id.toString() === userPlayer._id.toString();

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

            let reputation: PlayerReputation | null = null;

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
            return {
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
                diplomacy
            };
        }) as any;
    }

    _populatePlayerHasDuplicateIPs(game: Game) {
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

        if (!this.gameStateService.isStarted(game) || tick === 0) {
            return;
        }

        let history = await this.historyService.getHistoryByTick(game._id, tick);

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
            }
        }

        // Apply previous tick's data to all STARS the player does not own.
        // If historical mode, then its all star data in the requested tick.
        // If not historical mode, then replace non-player owned star data.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let gameStar = game.galaxy.stars[i];

            if (!isHistorical && userPlayer && gameStar.ownedByPlayerId && gameStar.ownedByPlayerId.toString() === userPlayer._id.toString()) {
                continue;
            }

            let historyStar = history.stars.find(x => x.starId.toString() === gameStar._id.toString());

            if (historyStar) {
                // If the player has abandoned the star in the current tick, then display that representation of the star
                // instead of the historical version.
                if (!isHistorical && userPlayer && historyStar.ownedByPlayerId && gameStar.ownedByPlayerId == null && historyStar.ownedByPlayerId.toString() === userPlayer._id.toString()) {
                    continue;
                }

                gameStar.ownedByPlayerId = historyStar.ownedByPlayerId;
                gameStar.naturalResources = historyStar.naturalResources;
                gameStar.ships = historyStar.ships;
                gameStar.shipsActual = historyStar.shipsActual;
                gameStar.specialistId = historyStar.specialistId;
                gameStar.homeStar = historyStar.homeStar;
                gameStar.warpGate = historyStar.warpGate;
                gameStar.ignoreBulkUpgrade = historyStar.ignoreBulkUpgrade;
                gameStar.infrastructure = historyStar.infrastructure;
                gameStar.location = historyStar.location == null || (historyStar.location.x == null || historyStar.location.y == null) ? gameStar.location : historyStar.location; // TODO: May not have history for the star (BR Mode). Can delete this in a few months after the history is cleaned.
            }
        }

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
            gameCarrier.waypoints = historyCarrier.waypoints as CarrierWaypoint[];
        }

        // Add any carriers that were in the previous tick that do not exist in the current tick
        // This is only applicable when requesting a historical tick as the current tick may have
        // destroyed carriers.
        if (isHistorical) {
            for (let historyCarrier of history.carriers) {
                let gameCarrier = game.galaxy.carriers.find(x => x._id.toString() === historyCarrier.carrierId.toString());
                
                if (!gameCarrier) {
                    game.galaxy.carriers.push(historyCarrier as any);
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
                    game.galaxy.carriers.push(historyCarrier as any);
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
        let pendingStars = this.battleRoyaleService.getStarsToDestroy(game);

        for (let pendingStar of pendingStars) {
            pendingStar.targeted = true;
        }
    }

};
