import { type SocketEventName } from "solaris-common";
import { SocketHandler } from "solaris-common";
import { ServerHandler } from "./serverHandler";

export abstract class ServerSocketHandler<TSocketEventType> extends SocketHandler<TSocketEventType> {
    constructor(private serverHandler: ServerHandler) {
        super();
        this.socketEventType;
    }

    protected override on<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(event: TSocketEventName, listener: (e: TData) => void) {
        const eventName = event as string;

        this.serverHandler.register(eventName, listener);
    }
}
