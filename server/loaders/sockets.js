const http = require('http');
const socketio = require('socket.io');
const config = require('../config')

module.exports = (server) => {
    const io = socketio(server);

    io.on('connection', (socket) => {
        console.log('a user connected');
    });

    return io;
};
