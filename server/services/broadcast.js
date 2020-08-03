

module.exports = class BroadcastService {

    constructor(io) {
        this.io = io;
    }

    gameRoomExists(game) {
        return this.io.sockets.adapter.rooms[roomId._id.toString()] != null;
    }

    playerRoomExists(player) {
        return this.io.sockets.adapter.rooms[player._id.toString()] != null
    }

    gameTick(game, playerId, report) {
        this.io.to(playerId.toString()).emit('gameTicked', {
            report
        });
    }

    gameStarted(game) {
        this.io.to(game.id).emit('gameStarted', {
            state: game.state
        });
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

    gameStarIndustryUpgraded(game, playerId, starId, infrastructure, manufacturing) {
        this.io.to(playerId.toString()).emit('gameStarIndustryUpgraded', {
            starId,
            infrastructure,
            manufacturing
        });
    }

    gameStarScienceUpgraded(game, playerId, starId, infrastructure) {
        this.io.to(playerId.toString()).emit('gameStarScienceUpgraded', {
            starId,
            infrastructure
        });
    }

    gameStarBulkUpgraded(game, playerId, summary) {
        this.io.to(playerId.toString()).emit('gameStarBulkUpgraded', summary);
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
    
    gameStarCarrierShipTransferred(game, playerId, starId, starShips, carrierId, carrierShips) {
        this.io.to(playerId.toString()).emit('gameStarCarrierShipTransferred', {
            starId,
            starShips,
            carrierId,
            carrierShips
        });
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

    // userRenownReceived(game, toUserId, renown) {
    //     this.io.to(toUserId).emit('playerRenownReceived', renown); // TODO: Do we have a socket for the user?
    // }

};
