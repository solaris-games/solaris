const ValidationError = require('../errors/validation');

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

module.exports = class GameCreateService {
    
    constructor(gameModel, gameService, gameListService, nameService, mapService, playerService, passwordService, conversationService, historyService, achievementService, userService) {
        this.gameModel = gameModel;
        this.gameService = gameService;
        this.gameListService = gameListService;
        this.nameService = nameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.conversationService = conversationService;
        this.historyService = historyService;
        this.achievementService = achievementService;
        this.userService = userService;
    }

    async create(settings) {
        const isTutorial = settings.general.type === 'tutorial';

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

            let isEstablishedPlayer = await this.achievementService.isEstablishedPlayer(settings.general.createdByUserId);

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
        });

        // Calculate how many stars we need.
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
        
        // If the game name contains a special string, then replace it with a random name.
        if (game.settings.general.name.indexOf(RANDOM_NAME_STRING) > -1) {
            let randomGameName = this.nameService.getRandomGameName();

            game.settings.general.name = game.settings.general.name.replace(RANDOM_NAME_STRING, randomGameName);
        }

        // Create all of the stars required.
        game.galaxy.homeStars = [];
        game.galaxy.linkedStars = [];
        game.galaxy.stars = this.mapService.generateStars(
            game,
            desiredStarCount,
            game.settings.general.playerLimit);
        
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

        let gameObject = await game.save();

        // TODO: This is a bit more complicated as we need to update the history
        // for the very first tick when players join the game. The galaxy masking
        // should only be applied for stars and carriers if its the very first tick.
        // await this.historyService.log(gameObject);
        // ^ Maybe fire an event for the historyService to capture?
        
        return gameObject;
    }

    _setGalaxyCenter(game) {
        const starLocations = game.galaxy.stars.map(s => s.location);

        game.constants.distances.galaxyCenterLocation = this.mapService.getGalaxyCenter(starLocations);
    }

    _calculateStarsForVictory(game) {
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

    _setupTutorialPlayers(game) {
        // Dump the player who created the game straight into the first slot and set the other slots to AI.
        this.gameService.assignPlayerToUser(game, game.galaxy.players[0], game.settings.general.createdByUserId, `Player`, 0);
        
        for (let i = 1; i < game.galaxy.players.length; i++) {
            const ai = game.galaxy.players[i];

            this.gameService.assignPlayerToUser(game, ai, null, `Opponent ${i}`, i);
        }
    }
}
