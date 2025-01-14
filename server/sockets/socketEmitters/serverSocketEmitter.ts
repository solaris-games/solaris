import type { DefaultEventsMap, Server } from "socket.io";
import type { Room } from "socket.io-adapter";
import { SocketEmitter } from "solaris-common";
import { type SocketEventName } from "solaris-common";
import { TypedEventBroadcaster } from "../../../node_modules/socket.io/dist/typed-events";

export abstract class ServerSocketEmitter<TSocketEventType> extends SocketEmitter<TSocketEventType> {

    constructor(private server: Server) {
        super();
        this.socketEventType;
    }

    protected override emit<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(event: TSocketEventName, data: TData): void;
    protected emit<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(room: Room | Room[], event: TSocketEventName, data: TData): void;
    protected emit<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(room?: Room | Room[], event?: TSocketEventName, data?: TData) {

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
