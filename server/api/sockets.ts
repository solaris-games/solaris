import { Config } from "../config/types/Config";
import {logger} from "../utils/logging";

const socketio = require('socket.io');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const log = logger('sockets');

export default (config: Config, server, sessionStore) => {

    const io = socketio(server);

    const getUserId = async (socket, data) => {
        return new Promise((resolve, reject) => {
            const cookieString = socket.request.headers.cookie;
    
            if (cookieString) {
                const cookieParsed = cookie.parse(cookieString);
                const sid = cookieParsed['connect.sid'];
                
                if (sid) {
                    const sidParsed = cookieParser.signedCookie(sid, config.sessionSecret);
    
                    sessionStore.get(sidParsed, (err, session) => {
                        if (err) return reject(err);
    
                        if (session?.userId) {
                            resolve(session.userId.toString())
                        } else {
                            resolve(null);
                        }
                    });
                }
            } else {
                resolve(null);
            }
        })
    }
    

    io.on('connection', async (socket) => {

        // When the user opens a game, they will be put
        // into that room to receive web sockets scoped to the game room.
        socket.on('gameRoomJoined', async (data) => {
            const userId = await getUserId(socket, data);

            if (userId) {
                socket.join(userId); // Join a private room to receive user/player specific messages.
            }

            socket.join(data.gameId); // Join the game room to receive game-wide messages.

            if (data.playerId) {
                socket.join(data.playerId);

                // Broadcast to all other players that the player joined the room.
                socket.to(data.gameId).emit('gamePlayerRoomJoined', {
                    playerId: data.playerId
                });
            }
        });

        socket.on('gameRoomLeft', async (data) => {
            const userId = await getUserId(socket, data);

            if (userId) {
                socket.leave(userId)
            }

            socket.leave(data.gameId)

            if (data.playerId) {
                socket.leave(data.playerId)

                // Broadcast to all other players that the player left the room.
                socket.to(data.gameId).emit('gamePlayerRoomLeft', {
                    playerId: data.playerId
                });
            }
        });
    });

    log.info('Sockets initialized.');
    
    return io;
};
