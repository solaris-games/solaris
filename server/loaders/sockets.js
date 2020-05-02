const http = require('http');
const socketio = require('socket.io');
const config = require('../config')

module.exports = (server) => {
    const io = socketio(server);

    io.on('connection', (socket) => {
        console.log('a user connected');

        // When the user opens a game, they will be put
        // into that room to receive web sockets scoped to the game room.
        socket.on('join', (data) => {
            socket.join(data);
        });

        socket.on('leave', () => {
            socket.leaveAll()
        });
    });

    return io;
};
