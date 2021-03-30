const cache = require('memory-cache');

module.exports = class HistoryService {

    constructor(historyModel, playerService) {
        this.historyModel = historyModel;
        this.playerService = playerService;
    }

    async listIntel(gameId, startTick = 0) {
        let cacheKey = `intel_${gameId}_${startTick}`;
        let cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        let intel = await this.historyModel.find({
            gameId,
            tick: { $gte: startTick }
        }, {
            gameId: 1,
            tick: 1,
            'players.playerId': 1,
            'players.statistics.totalStars': 1,
            'players.statistics.totalEconomy': 1,
            'players.statistics.totalIndustry': 1,
            'players.statistics.totalScience': 1,
            'players.statistics.totalShips': 1,
            'players.statistics.totalCarriers': 1,
            'players.statistics.totalSpecialists': 1,
            'players.statistics.totalStarSpecialists': 1,
            'players.statistics.totalCarrierSpecialists': 1,
            'players.statistics.newShips': 1,
            'players.statistics.warpgates': 1,
            'players.research.weapons.level': 1,
            'players.research.banking.level': 1,
            'players.research.manufacturing.level': 1,
            'players.research.hyperspace.level': 1,
            'players.research.scanning.level': 1,
            'players.research.experimentation.level': 1,
            'players.research.terraforming.level': 1
        })
        .sort({ tick: 1 })
        .lean({ defaults: true })
        .exec();

        cache.put(cacheKey, intel, 3600000); // 1 hour

        return intel;
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
                    warpgates: stats.warpgates
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
                name: c.name,
                orbiting: c.orbiting,
                ships: c.ships,
                specialistId: c.specialistId,
                isGift: c.isGift,
                location: c.location,
                waypoints: []
            };

            // Trim off unwanted waypoints, we only care about the first one.
            if (c.waypoints.length) {
                x.waypoints = [c.waypoints[0]];
            }

            return x;
        });

        await history.save();

        await cleanupTimeMachineHistory(game);
    }

    async cleanupTimeMachineHistory(game) {
        // For games where the time machine is disabled, clear out the all previous tick
        // data to save space as we only need the current tick data for masking.
        if (game.settings.general.timeMachine === 'disabled') {
            await this.historyModel.updateMany({
                gameId: game._id,
                tick: {
                    $lt: game.state.tick
                },
                stars: {
                    $exists: true,
                    $not: { $size: 0 }
                }
            }, {
                $unset: {
                    'players.$[].alias': '',
                    'players.$[].avatar': '',
                    'players.$[].researchingNow': '',
                    'players.$[].researchingNext': '',
                    'players.$[].credits': '',
                    'players.$[].defeated': '',
                    'players.$[].afk': '',
                    'players.$[].ready': '',
                    'players.$[].alias': '',
                    'stars': '',
                    'carriers': ''
                }
            });
        }
    }

    async getHistoryByTick(gameId, tick) {
        return await this.historyModel.findOne({
            gameId,
            tick
        })
        .lean({defaults: true})
        .exec();
    }

    async deleteByGameId(gameId) {
        await this.historyModel.deleteMany({
            gameId
        })
        .exec();
    }

};
