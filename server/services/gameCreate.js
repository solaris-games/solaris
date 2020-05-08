module.exports = class GameCreateService {
    
    constructor(gameModel, mapService, playerService) {
        this.gameModel = gameModel;
        this.mapService = mapService;
        this.playerService = playerService;
    }

    async create(settings) {
        let game = new this.gameModel({
            settings
        });

        // Calculate how many stars we need.
        let desiredStarCount = game.settings.galaxy.starsPerPlayer * game.settings.general.playerLimit;
        
        // Create all of the stars required.
        game.galaxy.stars = this.mapService.generateStars(
            game,
            desiredStarCount,
            game.settings.general.playerLimit,
            game.settings.specialGalaxy.randomGates);
        
        // Setup players and assign to their starting positions.
        game.galaxy.players = this.playerService.createEmptyPlayers(game, game.galaxy.stars);
        game.galaxy.carriers = this.playerService.createEmptyPlayerCarriers(game.galaxy.stars, game.galaxy.players);

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = Math.ceil((game.state.stars / 100) * game.settings.general.starVictoryPercentage);

        return await game.save();
    }
}