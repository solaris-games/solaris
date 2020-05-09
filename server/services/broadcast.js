

module.exports = class BroadcastService {

    constructor(io) {
        this.io = io;
    }

    gameTick(game) {
        this.io.to(game.id).emit('tick');
    }

    gameJoined(game, playerId, alias) {
        this.io.to(game.id).emit('joined', {
            playerId,
            alias
        });
    }

    gamePlayerQuit(game, player) {
        this.io.to(game.id).emit('quit', {
            playerId: player.id
        });
    }

};
