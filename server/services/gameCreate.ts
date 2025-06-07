import {MathRandomGen, RandomGen, SeededRandomGen} from "../utils/randomGen";

const mongoose = require('mongoose');
import ValidationError from '../errors/validation';
import {Game, GameSettings, Team} from './types/Game';
import AchievementService from './achievement';
import ConversationService from './conversation';
import GameCreateValidationService from './gameCreateValidation';
import GameFluxService from './gameFlux';
import GameListService from './gameList';
import GameTypeService from './gameType';
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
import CustomMapService from "./maps/custom";
import {logger} from "../utils/logging";
import StarDistanceService from "./starDistance";

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

const log = logger("GameCreateService");

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
    achievementService: AchievementService;
    userService: UserService;
    gameCreateValidationService: GameCreateValidationService;
    gameFluxService: GameFluxService;
    specialistBanService: SpecialistBanService;
    specialStarBanService: SpecialStarBanService;
    gameTypeService: GameTypeService;
    starService: StarService;
    diplomacyService: DiplomacyService;
    teamService: TeamService;
    carrierService: CarrierService;
    customMapService: CustomMapService;
    starDistanceService: StarDistanceService;

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
        achievementService: AchievementService,
        userService: UserService,
        gameCreateValidationService: GameCreateValidationService,
        gameFluxService: GameFluxService,
        specialistBanService: SpecialistBanService,
        specialStarBanService: SpecialStarBanService,
        gameTypeService: GameTypeService,
        starService: StarService,
        diplomacyService: DiplomacyService,
        teamService: TeamService,
        carrierService: CarrierService,
        customMapService: CustomMapService,
        starDistanceService: StarDistanceService,
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
        this.gameCreateValidationService = gameCreateValidationService;
        this.gameFluxService = gameFluxService;
        this.specialistBanService = specialistBanService;
        this.specialStarBanService = specialStarBanService;
        this.gameTypeService = gameTypeService;
        this.starService = starService;
        this.diplomacyService = diplomacyService;
        this.teamService = teamService;
        this.carrierService = carrierService;
        this.customMapService = customMapService;
        this.starDistanceService = starDistanceService;
    }

    async create(settings: GameSettings) {
        const isTutorial = settings.general.type === 'tutorial';
        const isNewPlayerGame = settings.general.type === 'new_player_rt' || settings.general.type === 'new_player_tb';
        const isOfficialGame = settings.general.createdByUserId == null;

        // If a legit user (not the system) created the game and it isn't a tutorial
        // then that game must be set as a custom game.
        if (settings.general.createdByUserId && !isTutorial) {
            settings.general.type = 'custom'; // All user games MUST be custom type.
            settings.general.timeMachine = 'disabled'; // Time machine is disabled for user created games.
            settings.general.featured = false // Stop any tricksters.

            // Prevent players from being able to create more than 1 game.
            const openGames = await this.gameListService.listOpenGamesCreatedByUser(settings.general.createdByUserId);
            const userIsGameMaster = await this.userService.getUserIsGameMaster(settings.general.createdByUserId);
            const userIsAdmin = await this.userService.getUserIsAdmin(settings.general.createdByUserId);

            if (openGames.length && !userIsGameMaster) {
                throw new ValidationError('Cannot create game, you already have another game waiting for players.');
            }

            if (userIsGameMaster && !userIsAdmin && openGames.length > 5) {
                throw new ValidationError('Game Masters are limited to 5 games waiting for players.');
            }

            // Validate that the player cannot create large games.
            if (settings.general.playerLimit > 16 && !userIsGameMaster) {
                throw new ValidationError(`Games larger than 16 players are reserved for official games or can be created by GMs.`);
            }

            const isEstablishedPlayer = await this.userService.isEstablishedPlayer(settings.general.createdByUserId);

            // Disallow new players from creating games if they haven't completed a game yet.
            if (!isEstablishedPlayer) {
                throw new ValidationError(`You must complete at least one game in order to create a custom game.`);
            }
        }

        if (settings.general.playerLimit > 64) {
            throw new ValidationError(`Games larger than 64 players are not supported.`);
        }
        
        if (settings.general.name.trim().length < 3 || settings.general.name.trim().length > 24) {
            throw new ValidationError('Game name must be between 3 and 24 characters.');
        }

        if (settings.general.password) {
            settings.general.password = await this.passwordService.hash(settings.general.password);
            settings.general.passwordRequired = true;
        }

        // Validate team conquest settings
        if (settings.general.mode === 'teamConquest') {
            const teamsCount = settings.conquest?.teamsCount;

            if (!teamsCount) {
                throw new ValidationError("Team count not provided");
            }

            const valid = Boolean(teamsCount &&
                settings.general.playerLimit >= 4 &&
                settings.general.playerLimit % teamsCount === 0);

            if (!valid) {
                throw new ValidationError(`The number of players must be larger than 3 and divisible by the number of teams.`);
            }

            if (settings.diplomacy?.enabled !== 'enabled') {
                throw new ValidationError('Diplomacy needs to be enabled for a team game.');
            }

            if (settings.diplomacy?.lockedAlliances !== 'enabled') {
                throw new ValidationError('Locked alliances needs to be enabled for a team game.');
            }

            if (settings.diplomacy?.maxAlliances !== (settings.general.playerLimit / teamsCount) - 1) {
                throw new ValidationError('Alliance limit too low for team size.');
            }
        }

        const rand = this._createRandomGenerator(settings);

        let game = new this.gameModel({
            settings
        }) as Game;

        // For non-custom galaxies we need to check that the player has actually provided
        // enough stars for each player.
        let desiredStarCount = 0;
        if (game.settings.galaxy.galaxyType !== 'custom') {
            desiredStarCount = game.settings.galaxy.starsPerPlayer * game.settings.general.playerLimit;
            let desiredPlayerStarCount = game.settings.player.startingStars * game.settings.general.playerLimit;

            if (desiredPlayerStarCount > desiredStarCount) {
                throw new ValidationError(`Cannot create a galaxy of ${desiredStarCount} stars with ${game.settings.player.startingStars} stars per player.`);
            }
        } else {
            // TODO: Validation needs to be better and in one place. Also, we should provide a schema

            let json;

            try {
                json = JSON.parse(settings.galaxy.customJSON!);
            } catch (e) {
                throw new ValidationError(`Failed to parse custom JSON.`);
            }

            if (!json?.stars?.length) {
                throw new ValidationError(`No stars provided in custom JSON.`);
            }

            const starCount = json.stars.length;

            game.settings.galaxy.starsPerPlayer = starCount / game.settings.general.playerLimit;
            desiredStarCount = starCount;
        }

        if (desiredStarCount > 1500) {
            throw new ValidationError(`Galaxy size cannot exceed 1500 stars.`);
        }

        // Ensure that c2c combat is disabled for orbital games.
        if (game.settings.orbitalMechanics.enabled === 'enabled' && game.settings.specialGalaxy.carrierToCarrierCombat === 'enabled') {
            game.settings.specialGalaxy.carrierToCarrierCombat = 'disabled';
        }

        // Ensure that specialist credits setting defaults token specific settings
        if (game.settings.specialGalaxy.specialistsCurrency === 'credits') {
            game.settings.player.startingCreditsSpecialists = 0;
            game.settings.player.tradeCreditsSpecialists = false;
            game.settings.technology.startingTechnologyLevel.specialists = 0;
            game.settings.technology.researchCosts.specialists = 'none';
        }

        // Ensure that specialist bans are cleared if specialists are disabled.
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            game.settings.specialGalaxy.specialistBans = {
                star: [],
                carrier: []
            };
        }

        // Validate research costs
        if (game.settings.technology.researchCostProgression?.progression === 'standard') {
            game.settings.technology.researchCostProgression = {
                progression: 'standard',
            };
        } else if (game.settings.technology.researchCostProgression?.progression === 'exponential') {
            const growthFactor = game.settings.technology.researchCostProgression.growthFactor;

            if (growthFactor && growthFactor === 'soft' || growthFactor === 'medium' || growthFactor === 'hard') {
                game.settings.technology.researchCostProgression = {
                    progression: 'exponential',
                    growthFactor: growthFactor
                };
            } else {
                throw new ValidationError('Invalid growth factor for research cost progression.');
            }
        } else {
            throw new ValidationError('Invalid research cost progression.');
        }

        // Ensure that tick limited games have their ticks to end state preset
        if (game.settings.gameTime.isTickLimited === 'enabled') {
            game.state.ticksToEnd = game.settings.gameTime.tickLimit;
        } else {
            game.settings.gameTime.tickLimit = null;
            game.state.ticksToEnd = null;
        }

        if (game.settings.galaxy.galaxyType === 'custom') {
            game.settings.specialGalaxy.randomWarpGates = 0;
            game.settings.specialGalaxy.randomWormHoles = 0;
            game.settings.specialGalaxy.randomNebulas = 0;
            game.settings.specialGalaxy.randomAsteroidFields = 0;
            game.settings.specialGalaxy.randomBinaryStars = 0;
            game.settings.specialGalaxy.randomBlackHoles = 0;
            game.settings.specialGalaxy.randomPulsars = 0;
        }

        if (game.settings.general.readyToQuit === "enabled") {
            game.settings.general.readyToQuitFraction = game.settings.general.readyToQuitFraction || 1.0;
            game.settings.general.readyToQuitTimerCycles = game.settings.general.readyToQuitTimerCycles || 0;
        }

        // Clamp max alliances if its invalid (minimum of 1)
        let lockedAllianceMod = game.settings.diplomacy.lockedAlliances === 'enabled'
            && game.settings.general.playerLimit >= 3 ? 1 : 0;
        game.settings.diplomacy.maxAlliances = Math.max(1, Math.min(game.settings.diplomacy.maxAlliances, game.settings.general.playerLimit - 1 - lockedAllianceMod));

        if (game.settings.general.mode === 'teamConquest') {
            const teamsNumber = game.settings.conquest.teamsCount;

            if (!teamsNumber) {
                throw new ValidationError("Team count not provided");
            }

            game.settings.general.awardRankTo = 'teams';
            game.settings.general.awardRankToTopN = undefined;
        } else {
            // No reason to check rank awarding for team games.
            const awardRankTo = game.settings.general.awardRankTo;
            const awardRankToTopN = game.settings.general.awardRankToTopN;

            if (awardRankTo === 'top_n' && (!awardRankToTopN || awardRankToTopN < 1 || awardRankToTopN > Math.floor(game.settings.general.playerLimit / 2))) {
                throw new ValidationError('Invalid top N value for awarding rank.');
            } else if (!['all', 'winner', 'top_n'].includes(awardRankTo)) {
                throw new ValidationError('Invalid award rank to setting.');
            }
        }

        // If the game name contains a special string, then replace it with a random name.
        if (game.settings.general.name.indexOf(RANDOM_NAME_STRING) > -1) {
            let randomGameName = this.nameService.getRandomGameName();

            game.settings.general.name = game.settings.general.name.replace(RANDOM_NAME_STRING, randomGameName);
        }

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

        // Create all of the stars required.
        game.galaxy.homeStars = [];
        game.galaxy.linkedStars = [];

        const starGeneration = this.mapService.generateStars(
            rand,
            game, 
            desiredStarCount,
            game.settings.general.playerLimit,
            settings.galaxy.customJSON,
            settings.galaxy.customSeed,
        );

        game.galaxy.stars = starGeneration.stars;
        game.galaxy.homeStars = starGeneration.homeStars;
        game.galaxy.linkedStars = starGeneration.linkedStars;

        if (game.galaxy.stars.length % game.settings.general.playerLimit !== 0) {
            throw new ValidationError(`Cannot create a galaxy with a non-whole number of stars per player.`);
        } else {
            game.settings.galaxy.starsPerPlayer = game.galaxy.stars.length / game.settings.general.playerLimit;
        }

        this.mapService.translateCoordinates(game);

        this.starService.setupStarsForGameStart(game);
        
        // Setup players and assign to their starting positions.
        this.playerService.setupEmptyPlayers(game);

        // Create carriers in custom galaxies with the advanced mode enabled.
        let advancedCustomGalaxyEnabled = game.settings.galaxy?.advancedCustomGalaxyEnabled === 'enabled';
        
        if (advancedCustomGalaxyEnabled) {
            game.galaxy.carriers = this.customMapService.generateCarriers(game, settings.galaxy.customJSON!, starGeneration.starLocations);
        } else {
            game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);
        }

        this.mapService.generateTerrain(rand, game);

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = this._calculateStarsForVictory(game);

        this._setGalaxyCenter(game);

        if (isTutorial) {
            this._setupTutorialPlayers(game);
        } else {
            this.conversationService.createConversationAllPlayers(game);
        }

        await this.teamService.setDiplomacyStates(game);

        this.gameCreateValidationService.validate(game);

        const gameObject = await game.save();

        await this.historyService.log(gameObject);

        return gameObject;
    }

    _createRandomGenerator(settings: GameSettings) {
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

        game.constants.distances.galaxyCenterLocation = this.starDistanceService.getGalaxyCenter(starLocations);
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
