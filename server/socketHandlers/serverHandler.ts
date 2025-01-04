import { Logger } from "pino";
import type { Server, Socket } from "socket.io";
import { EventEmitter } from "stream";
import ServerSocketEventNames from "../socketEventNames/server";

export const ServerHandlerEvents = {
    onConnection: 'onConnection'
}

export class ServerHandler extends EventEmitter {
    constructor(server: Server,
                logger: Logger) {
        super();

        server.on(ServerSocketEventNames.Connection, async (socket: Socket) => {
            this.emit(ServerHandlerEvents.onConnection, socket);
        });

        server.engine.on(ServerSocketEventNames.ConnectionError, (err: Error) => {
            if (err) {
                logger.error(err);
            }
        });
    }
}
