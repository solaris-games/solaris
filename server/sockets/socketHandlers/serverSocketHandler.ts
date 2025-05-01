import {type EventName, Handler} from "solaris-common";
import { ServerHandler } from "./serverHandler";

export abstract class ServerSocketHandler<TEventType> extends Handler<TEventType> {
    constructor(private serverHandler: ServerHandler) {
        super();
        this.eventType;
    }

    protected override on<TEventName extends EventName<TEventType, TData>, TData>(event: TEventName, listener: (e: TData) => void) {
        const eventName = event as string;

        this.serverHandler.register(eventName, listener);
    }
}
