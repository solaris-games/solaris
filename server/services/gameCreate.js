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
        game._doc.galaxy.stars = this.mapService.generateStars(
            game._doc.state.stars,
            game._doc.settings.general.playerLimit,
            game._doc.settings.specialGalaxy.randomGates);
        
        // Setup players and assign to their starting positions.
        game._doc.galaxy.players = this.playerService.createEmptyPlayers(game._doc.settings, game._doc.galaxy.stars);
        game._doc.galaxy.carriers = this.playerService.createEmptyPlayerCarriers(game._doc.galaxy.stars, game._doc.galaxy.players);

        return await game.save();
    }
}