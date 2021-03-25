const ValidationError = require('../errors/validation');

module.exports = class HistoryService {

    constructor(historyModel, playerService) {
        this.historyModel = historyModel;
        this.playerService = playerService;
    }

    async listStatistics(gameId, startTick = 0) {
        return await this.historyModel.find({
            gameId,
            tick: { $gte: startTick }
        }, {
            gameId: 1,
            tick: 1,
            'players.playerId': 1,
            'players.statistics': 1
        })
        .sort({ tick: 1 })
        .lean({ defaults: true })
        .exec();
    }

    async log(game) {
        let history = new this.historyModel({
            gameId: game._id,
            tick: game.state.tick,
            productionTick: game.state.productionTick,
            players: [],
            stars: [],
            carriers: []
        });

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let stats = this.playerService.getStats(game, player);

            history.players.push({
                userId: player.userId,
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
                    newShips: stats.newShips,
                    warpgates: stats.warpgates,
                    weapons: player.research.weapons.level,
                    banking: player.research.banking.level,
                    manufacturing: player.research.manufacturing.level,
                    hyperspace: player.research.hyperspace.level,
                    scanning: player.research.scanning.level,
                    experimentation: player.research.experimentation.level,
                    terraforming: player.research.terraforming.level,
                },
                alias: player.alias,
                avatar: player.avatar,
                researchingNow: player.researchingNow,
                researchingNext: player.researchingNext,
                credits: player.credits,
                defeated: player.defeated,
                afk: player.afk,
                ready: player.ready,
                research: player.research
            });
        }

        history.stars = game.galaxy.stars.map(s => {
            return {
                starId: s._id,
                ownedByPlayerId: s.ownedByPlayerId,
                naturalResources: s.naturalResources,
                garrison: s.garrison,
                garrisonActual: s.garrisonActual,
                specialistId: s.specialistId,
                warpGate: s.warpGate,
                ignoreBulkUpgrade: s.ignoreBulkUpgrade,
                infrastructure: s.infrastructure
            };
        });

        history.carriers = game.galaxy.carriers.map(c => {
            let x = {
                carrierId: c._id,
                ownedByPlayerId: c.ownedByPlayerId,
                orbiting: c.orbiting,
                ships: c.ships,
                specialistId: c.specialistId,
                isGift: c.isGift,
                location: c.location,
                waypoints: []
            };

            if (c.waypoints.length && !c.orbiting) {
                x.waypoints = [c.waypoints[0]]; // Only need the waypoint in transit.
            }

            return x;
        });

        await history.save();
    }

    async getHistoryByTick(gameId, tick) {
        return await this.historyModel.findOne({
            gameId,
            tick
        })
        .lean({defaults: true})
        .exec();
    }

};
