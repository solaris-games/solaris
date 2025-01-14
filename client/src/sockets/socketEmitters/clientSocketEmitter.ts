import type { Socket } from "socket.io-client";
import { SocketEmitter } from "@solaris-common";
import { type SocketEventName } from "@solaris-common";

export abstract class ClientSocketEmitter<TSocketEventType> extends SocketEmitter<TSocketEventType> {

  constructor(private socket: Socket) {
    super();
    this.socketEventType;
  }

  protected override emit<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(event: TSocketEventName, data: TData): void {
    this.socket.emit(event, data);
  }
}
