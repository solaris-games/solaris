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
        let desiredStarCount = game._doc.settings.galaxy.starsPerPlayer * game._doc.settings.general.playerLimit;
        
        // Create all of the stars required.
        game._doc.galaxy.stars = this.mapService.generateStars(
            desiredStarCount,
            game._doc.settings.general.playerLimit,
            game._doc.settings.specialGalaxy.randomGates);
        
        // Setup players and assign to their starting positions.
        game._doc.galaxy.players = this.playerService.createEmptyPlayers(game._doc.settings, game._doc.galaxy.stars);
        game._doc.galaxy.carriers = this.playerService.createEmptyPlayerCarriers(game._doc.galaxy.stars, game._doc.galaxy.players);

        // Calculate how many stars we have and how many are required for victory.
        game._doc.state.stars = game._doc.galaxy.stars.length;
        game._doc.state.starsForVictory = Math.ceil((game._doc.state.stars / 100) * game._doc.settings.general.starVictoryPercentage);

        return await game.save();
    }
}