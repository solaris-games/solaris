import { Logger } from "pino";
import type { Server, Socket } from "socket.io";
import { EventName } from "solaris-common";
import { EventEmitter } from "stream";
import ServerSocketEventNames, { ServerSocketEventType } from "../socketEventNames/server";

export class ServerHandler extends EventEmitter {
    private registeredHandlers: Map<string, (...args: any[]) => void> = new Map<string, (...args: any[]) => void>;

    constructor(server: Server,
                logger: Logger) {
        super();

        this.socketOn(server, ServerSocketEventNames.Connection, async (socket: Socket) => {
            for (let registeredHandler of this.registeredHandlers) {
                let newHandler: (e: unknown) => void = (e: unknown) => {

                    //// This little morsel of horror ensures that we pass in the socket we're using as part of the event data.
                    (e as unknown & { socket: Socket }).socket = socket;

                    registeredHandler[1](e);

                }

                socket.on(registeredHandler[0], newHandler);
            }
        });

        this.socketOn(server.engine, ServerSocketEventNames.ConnectionError, (err: Error) => {
            if (err) {
                logger.error(`Socket error: ${err.message}`);
            }
        });
    }

    register(event: string, handler: (...args: any[]) => void): void {
        if (this.registeredHandlers.has(event)) {
            throw new Error(`Handler for event ${event} already registered.`);
        }

        this.registeredHandlers.set(event, handler);
    }

    protected socketOn<TSocketEventName extends EventName<ServerSocketEventType, TData>, TData extends unknown>(emitter: EventEmitter, event: TSocketEventName, listener: (e: TData) => void): void {
        emitter.on(event as string, listener);
    }
}
