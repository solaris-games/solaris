

module.exports = class BroadcastService {

    constructor(io) {
        this.io = io;
    }

    gameTick(game) {
        this.io.to(game.id).emit('gameTicked');
    }

    gamePlayerJoined(game, playerId, alias) {
        this.io.to(game.id).emit('gamePlayerJoined', {
            playerId,
            alias
        });
    }

    gamePlayerQuit(game, player) {
        this.io.to(game.id).emit('gamePlayerQuit', {
            playerId: player.id
        });
    }

    // TODO: The infrastructure upgrades below will need
    // to be broadcasted to only the players who are in scanning range.
    // Otherwise anyone can listen to the socket traffic and be able
    // to work out when players upgrade their stars and what upgrades they have.
    gameStarEconomyUpgraded(game, starId, infrastructure) {
        this.io.to(game.id).emit('gameStarEconomyUpgraded', {
            starId,
            infrastructure
        });
    }

    gameStarIndustryUpgraded(game, starId, infrastructure) {
        this.io.to(game.id).emit('gameStarIndustryUpgraded', {
            starId,
            infrastructure
        });
    }

    gameStarScienceUpgraded(game, starId, infrastructure) {
        this.io.to(game.id).emit('gameStarScienceUpgraded', {
            starId,
            infrastructure
        });
    }

};
