import { Emitter, type DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";
import type { EventName } from "@solaris/common";
import ClientSocketEventNames, {
  type ClientSocketEventType,
} from "../socketEventNames/client";
import type { UserClientSocketEmitter } from "@/sockets/socketEmitters/user";

export class ClientHandler {
  constructor(
    socket: Socket,
    userClientSocketEmitter: UserClientSocketEmitter,
  ) {
    this.socketOn(socket, ClientSocketEventNames.Connect, async () => {
      console.log("Socket connection established.");
      userClientSocketEmitter.emitJoined();
    });

    this.socketOn(socket.io, ClientSocketEventNames.Error, (err: Error) => {
      console.error("Socket.io error.");
      console.error(err);
    });

    this.socketOn(
      socket.io,
      ClientSocketEventNames.Reconnect,
      (_attemptCount: number) => {
        userClientSocketEmitter.emitJoined();
      },
    );
  }

  protected socketOn<
    TSocketEventName extends EventName<ClientSocketEventType, TData>,
    TData extends unknown,
  >(
    emitter: Emitter<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    event: TSocketEventName,
    listener: (e: TData) => void,
  ): void {
    emitter.on(event as string, listener);
  }
}
