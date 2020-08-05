const ValidationError = require('../errors/validation');

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

module.exports = class GameCreateService {
    
    constructor(gameModel, nameService, mapService, playerService) {
        this.gameModel = gameModel;
        this.nameService = nameService;
        this.mapService = mapService;
        this.playerService = playerService;
    }

    async create(settings) {
        // TODO: Prevent players from being able to create loads of games?
        
        if (settings.general.name.trim().length < 3 || settings.general.name.trim().length > 24) {
            throw new ValidationError('Game name must be between 3 and 24 characters.');
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
        game.galaxy.stars = this.mapService.generateStars(
            game,
            desiredStarCount,
            game.settings.general.playerLimit,
            game.settings.specialGalaxy.randomGates);
        
        // Setup players and assign to their starting positions.
        game.galaxy.players = this.playerService.createEmptyPlayers(game);
        game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = Math.ceil((game.state.stars / 100) * game.settings.general.starVictoryPercentage);

        return await game.save();
    }
}