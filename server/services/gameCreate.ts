import { MathRandomGen, SeededRandomGen } from "../utils/randomGen";

import { ValidationError } from "solaris-common";
import { Game } from './types/Game';
import UserAchievementService from './userAchievement';
import ConversationService from './conversation';
import GameFluxService from './gameFlux';
import GameListService from './gameList';
import { GameTypeService } from 'solaris-common'
import HistoryService from './history';
import MapService from './map';
import NameService from './name';
import PasswordService from './password';
import PlayerService from './player';
import SpecialistBanService from './specialistBan';
import UserService from './user';
import GameJoinService from './gameJoin';
import SpecialStarBanService from './specialStarBan';
import StarService from './star';
import DiplomacyService from "./diplomacy";
import TeamService from "./team";
import CarrierService from './carrier';
import { logger } from "../utils/logging";
import { StarDistanceService } from 'solaris-common';
import { DBObjectId } from "./types/DBObjectId";
import CustomGalaxyService from "./customGalaxy";
import {
    GameSettings,
    GameSettingsGalaxy,
    GameSettingsGeneralBase, GameSettingsInvariable,
    GameSettingsSpecialGalaxyBase
} from "solaris-common";
import InitialGameStateService from "./initialGameState";

const GAME_MASTER_LIMIT = 5;

const ESTABLISHED_PLAYER_LIMIT = 2;

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

const log = logger("GameCreateService");

export type GameSettingsGalaxyReq = GameSettingsGalaxy & {
    customSeed?: string;
}

export type GameSettingsReq = GameSettingsInvariable & {
    general: GameSettingsGeneralBase,
    galaxy: GameSettingsGalaxyReq,
    specialGalaxy: GameSettingsSpecialGalaxyBase,
}

export default class GameCreateService {
    gameModel;
    gameJoinService: GameJoinService;
    gameListService: GameListService;
    nameService: NameService;
    mapService: MapService;
    playerService: PlayerService;
    passwordService: PasswordService;
    conversationService: ConversationService;
    historyService: HistoryService;
    achievementService: UserAchievementService;
    userService: UserService;
    gameFluxService: GameFluxService;
    specialistBanService: SpecialistBanService;
    specialStarBanService: SpecialStarBanService;
    gameTypeService: GameTypeService;
    starService: StarService;
    diplomacyService: DiplomacyService;
    teamService: TeamService;
    carrierService: CarrierService;
    starDistanceService: StarDistanceService;
    customGalaxyService: CustomGalaxyService;
    initialGameStateService: InitialGameStateService;

    constructor(
        gameModel,
        gameJoinService: GameJoinService,
        gameListService: GameListService,
        nameService: NameService,
        mapService: MapService,
        playerService: PlayerService,
        passwordService: PasswordService,
        conversationService: ConversationService,
        historyService: HistoryService,
        achievementService: UserAchievementService,
        userService: UserService,
        gameFluxService: GameFluxService,
        specialistBanService: SpecialistBanService,
        specialStarBanService: SpecialStarBanService,
        gameTypeService: GameTypeService,
        starService: StarService,
        diplomacyService: DiplomacyService,
        teamService: TeamService,
        carrierService: CarrierService,
        starDistanceService: StarDistanceService,
        customGalaxyService: CustomGalaxyService,
        initialGameStateService: InitialGameStateService,
    ) {
        this.gameModel = gameModel;
        this.gameJoinService = gameJoinService;
        this.gameListService = gameListService;
        this.nameService = nameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.conversationService = conversationService;
        this.historyService = historyService;
        this.achievementService = achievementService;
        this.userService = userService;
        this.gameFluxService = gameFluxService;
        this.specialistBanService = specialistBanService;
        this.specialStarBanService = specialStarBanService;
        this.gameTypeService = gameTypeService;
        this.starService = starService;
        this.diplomacyService = diplomacyService;
        this.teamService = teamService;
        this.carrierService = carrierService;
        this.starDistanceService = starDistanceService;
        this.customGalaxyService = customGalaxyService;
        this.initialGameStateService = initialGameStateService;
    }

    async create(settingsReq: GameSettingsReq, userId: DBObjectId | null) {
        const isTutorial = settingsReq.general.type === 'tutorial';
        const isCustomGalaxy = settingsReq.galaxy.galaxyType === 'custom';
        const isAdvancedCustomGalaxy = isCustomGalaxy && settingsReq.galaxy.advancedCustomGalaxyEnabled === 'enabled';
        const customSeed = settingsReq.galaxy.customSeed;

        const { settings, desiredStarCount } = await this._validateAndCompleteSettings(settingsReq, userId);

        const rand = this._createRandomGenerator(settingsReq);

        const game = new this.gameModel({
            settings
        }) as Game;

        if (this.gameTypeService.isFluxGame(game)) {
            this.gameFluxService.applyCurrentFlux(game);

            // Apply spec bans if applicable.
            if (game.settings.specialGalaxy.specialistCost !== 'none') {
                const banAmount = game.constants.specialists.monthlyBanAmount; // Random X specs of each type.

                const starBans = this.specialistBanService.getCurrentMonthStarBans(banAmount).map(s => s.id);
                const carrierBans = this.specialistBanService.getCurrentMonthCarrierBans(banAmount).map(s => s.id);

                // Append bans to any existing ones configured.
                game.settings.specialGalaxy.specialistBans = {
                    star: [...new Set(game.settings.specialGalaxy.specialistBans.star.concat(starBans))],
                    carrier: [...new Set(game.settings.specialGalaxy.specialistBans.carrier.concat(carrierBans))]
                };
            }

            // Apply special star bans
            const specialStarBans = this.specialStarBanService.getCurrentMonthBans().specialStar;

            for (let specialStarBan of specialStarBans) {
                if (game.settings.specialGalaxy[specialStarBan.id] != null) {
                    game.settings.specialGalaxy[specialStarBan.id] = 0;
                }
            }
        }

        // Create the galaxy.
        if (isCustomGalaxy) {
            if (isAdvancedCustomGalaxy) {
                const generatedPlayers = this.customGalaxyService.generatePlayers(game, settings.galaxy.customGalaxy!);

                const generatedStars = this.customGalaxyService.generateStarsAdvanced(game, generatedPlayers, settings.galaxy.customGalaxy!);

                game.galaxy.players = Array.from(generatedPlayers.values());
                game.galaxy.stars = Array.from(generatedStars.values());
                game.galaxy.carriers = this.customGalaxyService.generateCarriers(game, generatedPlayers, generatedStars, settings.galaxy.customGalaxy!);

            } else {
                const starGeneration = this.customGalaxyService.generateStars(game, settings.galaxy.customGalaxy!);

                game.galaxy.stars = starGeneration.stars;
                game.galaxy.homeStars = starGeneration.homeStarIds;
                game.galaxy.linkedStars = starGeneration.linkedStarIds;

                this.playerService.setupEmptyPlayers(game);

                game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);
            }
        } else {
            const starGeneration = this.mapService.generateStars(
                rand,
                game,
                desiredStarCount,
                game.settings.general.playerLimit,
                customSeed,
            );

            game.galaxy.stars = starGeneration.stars;
            game.galaxy.homeStars = starGeneration.homeStarIds;
            game.galaxy.linkedStars = starGeneration.linkedStarIds;

            this.starService.setupStarsForGameStart(game);

            this.mapService.translateCoordinates(game);

            // Setup players and assign to their starting positions.
            this.playerService.setupEmptyPlayers(game);

            game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);

            this.mapService.generateTerrain(rand, game);
        }

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = this._calculateStarsForVictory(game);

        this._setGalaxyCenter(game);

        if (isTutorial) {
            this._setupTutorialPlayers(game);
        } else {
            this.conversationService.createConversationAllPlayers(game);
        }

        // Ensure that tick limited games have their ticks to end state preset
        if (settings.gameTime.isTickLimited === 'enabled') {
            game.state.ticksToEnd = settings.gameTime.tickLimit;
        } else {
            settings.gameTime.tickLimit = null;
            game.state.ticksToEnd = null;
        }

        await this.teamService.setDiplomacyStates(game);

        const gameObject = await game.save();

        await this.initialGameStateService.storeStateFor(gameObject);
        await this.historyService.log(gameObject);

        return gameObject;
    }

    private async _validateAndCompleteSettings(settings: GameSettingsReq, userId: DBObjectId | null): Promise<{ settings: GameSettings<DBObjectId>, desiredStarCount: number }> {
        const isTutorial = settings.general.type === 'tutorial';
        const isOfficialGame = !userId;
        const isCustomGalaxy = settings.galaxy.galaxyType === 'custom';
        const isAdvancedCustomGalaxy = isCustomGalaxy && settings.galaxy.advancedCustomGalaxyEnabled === 'enabled';

        if (isCustomGalaxy) {
            // Validate it here so that we can assume it is valid later.
            this.customGalaxyService.validateAndCompleteCustomGalaxy(settings, isAdvancedCustomGalaxy);
        }

        // If a legit user (not the system) created the game then that game must be set as a custom game.
        if (!isOfficialGame) {
            if (!isTutorial) {
                await this._validateUserCanCreateGame(userId!, settings);
            }

            settings.general.type = 'custom';
        }

        if (settings.general.playerLimit < 2) {
            throw new ValidationError(`Games must have at least 2 players.`);
        }

        if (settings.general.playerLimit > 64) {
            throw new ValidationError(`Games larger than 64 players are not supported.`);
        }

        if (settings.general.name.trim().length < 3 || settings.general.name.trim().length > 24) {
            throw new ValidationError('Game name must be between 3 and 24 characters.');
        }

        if (settings.general.password) {
            settings.general.password = await this.passwordService.hash(settings.general.password);
        }

        // Validate team conquest settings
        if (settings.general.mode === 'teamConquest') {
            this._validateTeamConquest(settings, isAdvancedCustomGalaxy);
        }

        if (settings.general.mode === 'battleRoyale' && settings.general.readyToQuit !== "disabled") {
            settings.general.readyToQuit = "disabled";
            settings.general.readyToQuitVisibility = "hidden";
            settings.general.readyToQuitFraction = undefined;
            settings.general.readyToQuitTimerCycles = undefined;
        }

        // For non-custom galaxies we need to check that the player has actually provided
        // enough stars for each player.
        let desiredStarCount = 0;
        if (!isCustomGalaxy) {
            desiredStarCount = settings.galaxy.starsPerPlayer * settings.general.playerLimit;
            const desiredPlayerStarCount = settings.player.startingStars * settings.general.playerLimit;

            if (desiredPlayerStarCount > desiredStarCount) {
                throw new ValidationError(`Cannot create a galaxy of ${desiredStarCount} stars with ${settings.player.startingStars} stars per player.`);
            }
        } else {
            const starCount = settings.galaxy.customGalaxy!.stars.length;

            settings.galaxy.starsPerPlayer = starCount / settings.general.playerLimit;
            desiredStarCount = starCount;
        }

        if (desiredStarCount > 1500) {
            throw new ValidationError(`Galaxy size cannot exceed 1500 stars.`);
        }

        // Ensure that c2c combat is disabled for orbital games.
        if (settings.orbitalMechanics.enabled === 'enabled' && settings.specialGalaxy.carrierToCarrierCombat === 'enabled') {
            settings.specialGalaxy.carrierToCarrierCombat = 'disabled';
        }

        // Ensure that specialist credits setting defaults token specific settings
        if (settings.specialGalaxy.specialistsCurrency === 'credits') {
            settings.player.startingCreditsSpecialists = 0;
            settings.player.tradeCreditsSpecialists = false;
            settings.technology.startingTechnologyLevel.specialists = 0;
            settings.technology.researchCosts.specialists = 'none';
        }

        // Ensure that specialist bans are cleared if specialists are disabled.
        if (settings.specialGalaxy.specialistCost === 'none') {
            settings.specialGalaxy.specialistBans = {
                star: [],
                carrier: []
            };
        }

        // Validate research costs
        if (settings.technology.researchCostProgression?.progression === 'standard') {
            settings.technology.researchCostProgression = {
                progression: 'standard',
            };
        } else if (settings.technology.researchCostProgression?.progression === 'exponential') {
            const growthFactor = settings.technology.researchCostProgression.growthFactor;

            if (growthFactor && growthFactor === 'soft' || growthFactor === 'medium' || growthFactor === 'hard') {
                settings.technology.researchCostProgression = {
                    progression: 'exponential',
                    growthFactor: growthFactor
                };
            } else {
                throw new ValidationError('Invalid growth factor for research cost progression.');
            }
        } else {
            throw new ValidationError('Invalid research cost progression.');
        }

        if (settings.general.readyToQuit === "enabled") {
            settings.general.readyToQuitFraction = settings.general.readyToQuitFraction || 1.0;
            settings.general.readyToQuitTimerCycles = settings.general.readyToQuitTimerCycles || 0;
        }

        // Clamp max alliances if its invalid (minimum of 1)
        let lockedAllianceMod = settings.diplomacy.lockedAlliances === 'enabled'
        && settings.general.playerLimit >= 3 ? 1 : 0;
        settings.diplomacy.maxAlliances = Math.max(1, Math.min(settings.diplomacy.maxAlliances, settings.general.playerLimit - 1 - lockedAllianceMod));

        if (settings.general.mode === 'teamConquest') {
            const teamsNumber = settings.conquest.teamsCount;

            if (!teamsNumber) {
                throw new ValidationError("Team count not provided");
            }

            settings.general.awardRankTo = 'teams';
            settings.general.awardRankToTopN = undefined;
        } else {
            // No reason to check rank awarding for team games.
            const awardRankTo = settings.general.awardRankTo;
            const awardRankToTopN = settings.general.awardRankToTopN;

            if (awardRankTo === 'top_n' && (!awardRankToTopN || awardRankToTopN < 1 || awardRankToTopN > Math.floor(settings.general.playerLimit / 2))) {
                throw new ValidationError('Invalid top N value for awarding rank.');
            } else if (!['all', 'winner', 'top_n'].includes(awardRankTo)) {
                throw new ValidationError('Invalid award rank to setting.');
            }
        }

        // If the game name contains a special string, then replace it with a random name.
        let name = settings.general.name.trim();

        if (name.indexOf(RANDOM_NAME_STRING) > -1) {
            let randomGameName = this.nameService.getRandomGameName();

            name = name.replace(RANDOM_NAME_STRING, randomGameName);
        }

        const newSettings: GameSettings<DBObjectId> = {
            ...settings,
            general: {
                ...settings.general,
                name,
                createdByUserId: userId,
                fluxId: null, // will be applied later
                featured: false,
                timeMachine: isOfficialGame ? 'enabled' : 'disabled',
                passwordRequired: Boolean(settings.general.password),
            },
            specialGalaxy: {
                ...settings.specialGalaxy,
                combatResolutionMalusStrategy: 'largestCarrier',
            },
        };

        return {
            settings: newSettings,
            desiredStarCount,
        };
    }

    private _validateTeamConquest(settings: GameSettingsReq, isAdvancedCustomGalaxy: boolean) {
        const teamsCount = settings.conquest?.teamsCount;

        if (!teamsCount) {
            throw new ValidationError("Team count not provided");
        }

        if (teamsCount < 2) {
            throw new ValidationError(`The number of teams must be larger than 2.`);
        }

        if (!isAdvancedCustomGalaxy) {
            const valid = Boolean(teamsCount &&
                settings.general.playerLimit >= 4 &&
                settings.general.playerLimit % teamsCount === 0);

            if (!valid) {
                throw new ValidationError(`The number of players must be larger than 3 and divisible by the number of teams.`);
            }
        } else {
            if (settings.general.playerLimit <= 2) {
                throw new ValidationError(`The number of players must be larger than 2.`);
            }
        }

        if (settings.diplomacy?.enabled !== 'enabled') {
            throw new ValidationError('Diplomacy needs to be enabled for a team game.');
        }

        if (settings.diplomacy?.lockedAlliances !== 'enabled') {
            throw new ValidationError('Locked alliances needs to be enabled for a team game.');
        }

        if (settings.diplomacy?.maxAlliances !== (settings.general.playerLimit / teamsCount) - 1 && !isAdvancedCustomGalaxy) {
            throw new ValidationError('Alliance limit too low for team size.');
        }
    }

    async _validateUserCanCreateGame(userId: DBObjectId, settings: GameSettingsReq) {
        // Prevent players from being able to create more than 1 game.
        const openGames = await this.gameListService.listOpenGamesCreatedByUser(userId);
        const userIsGameMaster = await this.userService.getUserIsGameMaster(userId);
        const userIsAdmin = await this.userService.getUserIsAdmin(userId);

        if (openGames.length > ESTABLISHED_PLAYER_LIMIT && !userIsGameMaster) {
            throw new ValidationError(`Cannot create game, you already have ${openGames.length} game(s) waiting for players.`);
        }

        if (userIsGameMaster && !userIsAdmin && openGames.length > GAME_MASTER_LIMIT) {
            throw new ValidationError(`Game Masters are limited to ${GAME_MASTER_LIMIT} games waiting for players.`);
        }

        // Validate that the player cannot create large games.
        if (settings.general.playerLimit > 16 && !userIsGameMaster) {
            throw new ValidationError(`Games larger than 16 players are reserved for official games or can be created by GMs.`);
        }

        const isEstablishedPlayer = await this.userService.isEstablishedPlayer(userId);

        // Disallow new players from creating games if they haven't completed a game yet.
        if (!isEstablishedPlayer) {
            throw new ValidationError(`You must complete at least one game in order to create a custom game.`);
        }
    }

    _createRandomGenerator(settings: GameSettingsReq) {
        if (settings.galaxy.galaxyType === 'irregular') {
            const seed = settings.galaxy.customSeed || (Math.random() * Number.MAX_SAFE_INTEGER).toFixed(0);
            log.info(`Generating irregular map for ${settings.general.name}: ${settings.general.playerLimit} players (${settings.galaxy.starsPerPlayer} SPP) with seed ${seed}`);

            return new SeededRandomGen(seed);
        } else {
            return new MathRandomGen();
        }
    }

    _setGalaxyCenter(game: Game) {
        const starLocations = game.galaxy.stars.map(s => s.location);

        game.constants.distances.galaxyCenterLocation = this.starDistanceService.getGalaxyCenterOfMass(starLocations);
    }

    _calculateStarsForVictory(game: Game) {
        if (game.settings.general.mode === 'conquest' || game.settings.general.mode === 'teamConquest') {
            // TODO: Find a better place for this as its shared in the star service.
            switch (game.settings.conquest.victoryCondition) {
                case 'starPercentage':
                    return Math.ceil((game.state.stars / 100) * game.settings.conquest.victoryPercentage);
                case 'homeStarPercentage':
                    return Math.max(2, Math.ceil((game.settings.general.playerLimit / 100) * game.settings.conquest.victoryPercentage)); // At least 2 home stars needed to win.
                default:
                    throw new Error(`Unsupported conquest victory condition: ${game.settings.conquest.victoryCondition}`);
            }
        }

        // game.settings.conquest.victoryCondition = 'starPercentage'; // TODO: Default to starPercentage if not in conquest mode?

        return game.galaxy.stars.length;
    }

    _setupTutorialPlayers(game: Game) {
        // Dump the player who created the game straight into the first slot and set the other slots to AI.
        this.gameJoinService.assignPlayerToUser(game, game.galaxy.players[0], game.settings.general.createdByUserId!, `Player`, 0);
        this.gameJoinService.assignNonUserPlayersToAI(game);
    }
}
