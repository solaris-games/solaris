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
        game._doc.state.stars = game._doc.settings.galaxy.starsPerPlayer * 2 * game._doc.settings.general.playerLimit;
        game._doc.state.starsForVictory = (game._doc.state.stars / 100) * game._doc.settings.general.starVictoryPercentage;

        // Create all of the stars required.
        game._doc.galaxy.stars = this.mapService.generateStars(game._doc.state.stars);
        
        // If warp gates are enabled, assign random stars to start as warp gates.
        if (game._doc.settings.specialGalaxy.randomGates !== 'none') {
            this.mapService.generateGates(game._doc.galaxy.stars, game._doc.settings.specialGalaxy.randomGates, game._doc.settings.general.playerLimit);
        }

        // Setup players and assign to their starting positions.
        game._doc.galaxy.players = this.playerService.createEmptyPlayers(game._doc.settings, game._doc.galaxy.stars);

        return await game.save();
    }
}