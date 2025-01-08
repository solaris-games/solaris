import { MongoDBStore } from 'connect-mongodb-session';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { Config } from "../config/types/Config";
import { DBObjectId } from '../services/types/DBObjectId';
import { Game } from './types/Game';
import { Player } from './types/Player';

export default class SocketService {

    private sessionStorage?: MongoDBStore;

    constructor(private config: Config,
                private socketServer: Server) {
    }

    public setSessionStorage(sessionStorage: MongoDBStore) {
        this.sessionStorage = sessionStorage;
    }

    public async getUserId(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): Promise<string | null> {
        return new Promise((resolve, reject) => {
            if (socket == null) {
                return resolve(null);
            }

            const cookieString = socket.request.headers.cookie;

            if (cookieString) {
                const cookieParsed = cookie.parse(cookieString);
                const sid: string = cookieParsed['connect.sid'];

                if (sid != null && this.config.sessionSecret != null) {
                    const sidParsed = cookieParser.signedCookie(sid, this.config.sessionSecret);

                    if (sidParsed) {
                        return this.sessionStorage!.get(sidParsed, (err, session) => {
                            if (err) {
                                return reject(err);
                            }

                            if (session?.userId) {
                                resolve(session.userId.toString())
                            } else {
                                resolve(null);
                            }
                        });
                    }
                }
            }

            resolve(null);
        })
    }

    public roomExists(socketId: DBObjectId) {
        return this.socketServer && this.socketServer.sockets.adapter.rooms[socketId.toString()] != null;
    }

    public playerRoomExists(player: Player) {
        return this.socketServer && this.socketServer.sockets.adapter.rooms[player._id.toString()] != null;
    }

    public getOnlinePlayers(game: Game) {
        return game.galaxy.players.filter(p => this.playerRoomExists(p));
    }
}
