import type { Socket } from "socket.io-client";
import { type SocketEventName } from "solaris-common/src/sockets/socketEventNames/socketEventName";
import { SocketHandler } from "solaris-common/src/sockets/socketHandler";

export abstract class ClientSocketHandler<TSocketEventType> extends SocketHandler<TSocketEventType> {

  constructor(private socket: Socket) {
    super();
    this.socketEventType;
  }

  protected override on<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData>(event: TSocketEventName, listener: (e: TData) => void) {
    this.socket.on(event as string, listener);
  }
}