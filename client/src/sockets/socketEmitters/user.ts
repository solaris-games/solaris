import {ClientSocketEmitter} from "@/sockets/socketEmitters/clientSocketEmitter";
import type {UserSocketEventType} from "@solaris-common";
import type { InjectionKey } from "vue";
import {UserSocketEventNames} from "@solaris-common";
import type { Socket } from "socket.io-client";

export const userClientSocketEmitterInjectionKey: InjectionKey<UserClientSocketEmitter> = Symbol('UserClientSocketEmitter');

export class UserClientSocketEmitter extends ClientSocketEmitter<UserSocketEventType> {
  constructor(socket: Socket) {
    super(socket);
  }

  public emitJoined() {
    this.emit(UserSocketEventNames.UserJoined, {});
  }

  public emitLeft() {
    this.emit(UserSocketEventNames.UserLeft, {});
  }
}
