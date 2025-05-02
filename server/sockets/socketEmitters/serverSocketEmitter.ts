import type { DefaultEventsMap, Server } from "socket.io";
import type { Room } from "socket.io-adapter";
import {Emitter, type EventName} from "solaris-common";
import { TypedEventBroadcaster } from "../../../node_modules/socket.io/dist/typed-events";

export abstract class ServerSocketEmitter<TEventType> extends Emitter<TEventType> {
    constructor(private server: Server) {
        super();
        this.eventType;
    }

    protected override emit<TEventName extends EventName<TEventType, TData>, TData>(event: TEventName, data: TData): void;
    protected emit<TEventName extends EventName<TEventType, TData>, TData>(room: Room | Room[], event: TEventName, data: TData): void;
    protected emit<TEventName extends EventName<TEventType, TData>, TData>(room?: Room | Room[], event?: TEventName, data?: TData) {
        let broadcaster: TypedEventBroadcaster<DefaultEventsMap>;

        if (room != null) {
            broadcaster = this.server.to(room);
        }
        else {
            broadcaster = this.server;
        }

        broadcaster.emit(event!, data);
    }
}
