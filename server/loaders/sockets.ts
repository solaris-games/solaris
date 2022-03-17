const socketio = require('socket.io');

export default (config: any, server: any) => {

    const io = socketio(server);

    io.on('connection', (socket: any) => {
        // When the user opens a game, they will be put
        // into that room to receive web sockets scoped to the game room.
        socket.on('gameRoomJoined', (data: any) => {
            socket.join(data.gameId); // Join the game room to receive game-wide messages.
            socket.join(data.userId); // Join a private room to receive user/player specific messages.

            if (data.playerId) {
                socket.join(data.playerId);

                // Broadcast to all other players that the player joined the room.
                socket.to(data.gameId).emit('gamePlayerRoomJoined', {
                    playerId: data.playerId
                });
            }
        });

        socket.on('gameRoomLeft', (data: any) => {
            socket.leave(data.gameId)
            socket.leave(data.userId)

            if (data.playerId) {
                socket.leave(data.playerId)

                // Broadcast to all other players that the player left the room.
                socket.to(data.gameId).emit('gamePlayerRoomLeft', {
                    playerId: data.playerId
                });
            }
        });
    });

    console.log('Sockets Initialized');
    
    return io;
};
