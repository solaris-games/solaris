import type { Socket } from "socket.io";
import { type SocketEventName } from "solaris-common";
import { SocketHandler } from "solaris-common";
import { ServerHandler, ServerHandlerEvents } from "./serverHandler";

export abstract class ServerSocketHandler<TSocketEventType> extends SocketHandler<TSocketEventType> {

    private registeredHandlers: Map<string, (...args: any[]) => void> = new Map<string, (...args: any[]) => void>;

    constructor(serverHandler: ServerHandler) {
        super();
        this.socketEventType;

        serverHandler.on(ServerHandlerEvents.onConnection, (socket: Socket) => {
            for (let registeredHandler of this.registeredHandlers) {
                let newHandler: (e: unknown) => void = (e: unknown) => {

                    //// This little morsel of horror ensures that we pass in the socket we're using as part of the event data.
                    (e as unknown & { socket: Socket }).socket = socket;

                    registeredHandler[1](e);

                }

                socket.on(registeredHandler[0], newHandler);
            }
        });
    }

    protected override on<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(event: TSocketEventName, listener: (e: TData) => void) {
        this.registeredHandlers.set(event as string, listener);
    }
}
