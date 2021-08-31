const ValidationError = require('../errors/validation');

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

module.exports = class GameCreateService {
    
    constructor(gameModel, gameListService, nameService, mapService, playerService, passwordService, conversationService, historyService, achievementService) {
        this.gameModel = gameModel;
        this.gameListService = gameListService;
        this.nameService = nameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.conversationService = conversationService;
        this.historyService = historyService;
        this.achievementService = achievementService;
    }

    async create(settings) {
        if (settings.general.createdByUserId) {
            settings.general.type = 'custom'; // All user games MUST be custom type.
            settings.general.timeMachine = 'disabled'; // Time machine is disabled for user created games.

            // Prevent players from being able to create more than 1 game.
            let openGames = await this.gameListService.listOpenGamesCreatedByUser(settings.general.createdByUserId);

            if (openGames.length) {
                throw new ValidationError('Cannot create game, you already have another game waiting for players.');
            }

            // Validate that the player cannot create large games.
            if (settings.general.playerLimit > 16) {
                throw new ValidationError(`Games larger than 16 players are reserved for official games only.`);
            }

            let userAchievements = await this.achievementService.getAchievements(settings.general.createdByUserId);

            // Disallow new players from creating games if they haven't completed a game yet.
            if (userAchievements.achievements.completed === 0) {
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
        
        // If the game name contains a special string, then replace it with a random name.
        if (game.settings.general.name.indexOf(RANDOM_NAME_STRING) > -1) {
            let randomGameName = this.nameService.getRandomGameName();

            game.settings.general.name = game.settings.general.name.replace(RANDOM_NAME_STRING, randomGameName);
        }

        // Create all of the stars required.
        game.galaxy.homeStars = [];
        game.galaxy.playerIndexes = [];
        game.galaxy.linkedStars = [];
        game.galaxy.stars = this.mapService.generateStars(
            game, settings,
            desiredStarCount,
            game.settings.general.playerLimit,
            game.settings.specialGalaxy.randomGates);

        
        // Setup players and assign to their starting positions.
        game.galaxy.players = this.playerService.createEmptyPlayers(game);
        game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = this._calculateStarsForVictory(game);

        this.conversationService.createConversationAllPlayers(game);

        this._setGalaxyCenter(game);

        let gameObject = await game.save();

        // TODO: This is a bit more complicated as we need to update the history
        // for the very first tick when players join the game. The galaxy masking
        // should only be applied for stars and carriers if its the very first tick.
        // await this.historyService.log(gameObject);
        
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
}
