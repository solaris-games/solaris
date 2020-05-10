const http = require('http');
const socketio = require('socket.io');
const config = require('../config')

module.exports = (server) => {
    const io = socketio(server);

    io.on('connection', (socket) => {
        // When the user opens a game, they will be put
        // into that room to receive web sockets scoped to the game room.
        socket.on('gameRoomJoined', (data) => {
            socket.join(data.gameId); // Join the game room to receive game-wide messages.
            socket.join(data.userId); // Join a private room to receive user/player specific messages.
        });

        socket.on('gameRoomLeft', () => {
            socket.leaveAll()
        });
    });

    return io;
};
