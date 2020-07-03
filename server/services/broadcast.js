

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

    gameStarEconomyUpgraded(game, playerId, starId, infrastructure) {
        this.io.to(playerId.toString()).emit('gameStarEconomyUpgraded', {
            starId,
            infrastructure
        });
    }

    gameStarIndustryUpgraded(game, playerId, starId, infrastructure) {
        this.io.to(playerId.toString()).emit('gameStarIndustryUpgraded', {
            starId,
            infrastructure
        });
    }

    gameStarScienceUpgraded(game, playerId, starId, infrastructure) {
        this.io.to(playerId.toString()).emit('gameStarScienceUpgraded', {
            starId,
            infrastructure
        });
    }

    // TODO: Need to refactor this to take the player id to broadcast to
    // and only stars that are within their scanning range should be included in the summary.
    gameStarBulkUpgraded(game, summary) {
        this.io.to(game.id).emit('gameStarBulkUpgraded', summary);
    }

    gameStarWarpGateBuilt(game, starId) {
        this.io.to(game.id).emit('gameStarWarpGateBuilt', {
            starId
        });
    }

    gameStarWarpGateDestroyed(game, starId) {
        this.io.to(game.id).emit('gameStarWarpGateDestroyed', {
            starId
        });
    }

    gameStarCarrierBuilt(game, playerId, carrier) {
        this.io.to(playerId.toString()).emit('gameStarCarrierBuilt', carrier);
    }

    gameStarAbandoned(game, starId) {
        this.io.to(game.id).emit('gameStarAbandoned', {
            starId
        });
    }

    gameMessageSent(game, message, toPlayerId) {
        this.io.to(toPlayerId).emit('gameMessageSent', message);
    }

    gamePlayerCreditsReceived(game, toPlayerId, credits) {
        this.io.to(toPlayerId).emit('playerCreditsReceived', credits);
    }

};
