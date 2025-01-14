import { Logger } from "pino";
import type { Server, Socket } from "socket.io";
import { SocketEventName } from "solaris-common";
import { EventEmitter } from "stream";
import ServerSocketEventNames, { ServerSocketEventType } from "../socketEventNames/server";

export const ServerHandlerEvents = {
    onConnection: 'onConnection'
}

export class ServerHandler extends EventEmitter {
    constructor(server: Server,
                logger: Logger) {
        super();

        this.socketOn(server, ServerSocketEventNames.Connection, async (socket: Socket) => {
            this.emit(ServerHandlerEvents.onConnection, socket);
        });

        this.socketOn(server.engine, ServerSocketEventNames.ConnectionError, (err: Error) => {
            if (err) {
                logger.error(err);
            }
        });
    }

    protected socketOn<TSocketEventName extends SocketEventName<ServerSocketEventType, TData>, TData extends unknown>(emitter: EventEmitter, event: TSocketEventName, listener: (e: TData) => void): void {
        emitter.on(event as string, listener);
    }
}
