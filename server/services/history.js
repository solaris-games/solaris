const ValidationError = require('../errors/validation');

module.exports = class HistoryService {

    constructor(historyModel, playerService) {
        this.historyModel = historyModel;
        this.playerService = playerService;
    }

    async listByGameId(gameId) {
        return await this.historyModel.find({
            gameId
        })
        .lean({ defaults: true })
        .exec();
    }

    async log(game) {
        let history = new this.historyModel({
            gameId: game._id,
            tick: game.state.tick,
            players: []
        });

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let stats = this.playerService.getStats(game, player);

            history.players.push({
                playerId: player._id,
                statistics: {
                    totalStars: stats.totalStars,
                    totalEconomy: stats.totalEconomy,
                    totalIndustry: stats.totalIndustry,
                    totalScience: stats.totalScience,
                    totalShips: stats.totalShips,
                    totalCarriers: stats.totalCarriers,
                    totalSpecialists: stats.totalSpecialists,
                    totalStarSpecialists: stats.totalStarSpecialists,
                    totalCarrierSpecialists: stats.totalCarrierSpecialists,
                    weapons: player.research.weapons.level,
                    banking: player.research.banking.level,
                    manufacturing: player.research.manufacturing.level,
                    hyperspace: player.research.hyperspace.level,
                    scanning: player.research.scanning.level,
                    experimentation: player.research.experimentation.level,
                    terraforming: player.research.terraforming.level
                }
            })
        }

        await history.save();
    }

};
