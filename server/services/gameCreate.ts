import ValidationError from '../errors/validation';
import { Game, GameSettings } from './types/Game';
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

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

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
        starService: StarService
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

            // Prevent players from being able to create more than 1 game.
            let openGames = await this.gameListService.listOpenGamesCreatedByUser(settings.general.createdByUserId);
            let userIsGameMaster = await this.userService.getUserIsGameMaster(settings.general.createdByUserId);

            if (openGames.length && !userIsGameMaster) {
                throw new ValidationError('Cannot create game, you already have another game waiting for players.');
            }

            if (userIsGameMaster && openGames.length > 5) {
                throw new ValidationError('Game Masters are limited to 5 games waiting for players.');
            }

            // Validate that the player cannot create large games.
            if (settings.general.playerLimit > 16 && !userIsGameMaster) {
                throw new ValidationError(`Games larger than 16 players are reserved for official games or can be created by GMs.`);
            }

            let isEstablishedPlayer = await this.userService.isEstablishedPlayer(settings.general.createdByUserId);

            // Disallow new players from creating games if they haven't completed a game yet.
            if (!isEstablishedPlayer) {
                throw new ValidationError(`You must complete at least one game in order to create a custom game.`);
            }
        }
        
        if (settings.general.name.trim().length < 3 || settings.general.name.trim().length > 24) {
            throw new ValidationError('Game name must be between 3 and 24 characters.');
        }

        if (settings.general.password) {
            settings.general.password = await this.passwordService.hash(settings.general.password);
            settings.general.passwordRequired = true;
        }

        let game = new this.gameModel({
            settings
        }) as Game;

        // For non-custom galaxies we need to check that the player has actually provided
        // enough stars for each player.
        let desiredStarCount = game.settings.galaxy.starsPerPlayer * game.settings.general.playerLimit;
        let desiredPlayerStarCount = game.settings.player.startingStars * game.settings.general.playerLimit;

        if (desiredPlayerStarCount > desiredStarCount) {
            throw new ValidationError(`Cannot create a galaxy of ${desiredStarCount} stars with ${game.settings.player.startingStars} stars per player.`);
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

        // Clamp max alliances if its invalid (minimum of 1)
        game.settings.diplomacy.maxAlliances = Math.max(1, Math.min(game.settings.diplomacy.maxAlliances, game.settings.general.playerLimit - 1));
        
        // If the game name contains a special string, then replace it with a random name.
        if (game.settings.general.name.indexOf(RANDOM_NAME_STRING) > -1) {
            let randomGameName = this.nameService.getRandomGameName();

            game.settings.general.name = game.settings.general.name.replace(RANDOM_NAME_STRING, randomGameName);
        }

        if (this.gameTypeService.isFluxGame(game)) {
            this.gameFluxService.applyCurrentFlux(game);
        }

        const canApplyBans = isOfficialGame && !isNewPlayerGame && !isTutorial;

        if (canApplyBans) {
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

        let starGeneration = this.mapService.generateStars(
            game, 
            desiredStarCount,
            game.settings.general.playerLimit,
            settings.galaxy.customJSON
        );

        game.galaxy.stars = starGeneration.stars;
        game.galaxy.homeStars = starGeneration.homeStars;
        game.galaxy.linkedStars = starGeneration.linkedStars;

        this.starService.setupStarsForGameStart(game);
        
        // Setup players and assign to their starting positions.
        game.galaxy.players = this.playerService.createEmptyPlayers(game);
        game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);

        this.mapService.generateTerrain(game);

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = this._calculateStarsForVictory(game);

        this._setGalaxyCenter(game);

        if (isTutorial) {
            this._setupTutorialPlayers(game);
        } else {
            this.conversationService.createConversationAllPlayers(game);
        }

        this.gameCreateValidationService.validate(game);

        let gameObject = await game.save();

        // TODO: This is a bit more complicated as we need to update the history
        // for the very first tick when players join the game. The galaxy masking
        // should only be applied for stars and carriers if its the very first tick.
        // await this.historyService.log(gameObject);
        // ^ Maybe fire an event for the historyService to capture?
        
        return gameObject;
    }

    _setGalaxyCenter(game: Game) {
        const starLocations = game.galaxy.stars.map(s => s.location);

        game.constants.distances.galaxyCenterLocation = this.mapService.getGalaxyCenter(starLocations);
    }

    _calculateStarsForVictory(game: Game) {
        if (game.settings.general.mode === 'conquest') {
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
