import type { Socket } from "socket.io-client";
import { PlayerSocketEventNames, type PlayerSocketEventType } from "@solaris-common";
import type { InjectionKey } from "vue";
import { ClientSocketEmitter } from "./clientSocketEmitter";

export const playerClientSocketEmitterInjectionKey: InjectionKey<PlayerClientSocketEmitter> = Symbol('PlayerClientSocketEmitter');

export class PlayerClientSocketEmitter extends ClientSocketEmitter<PlayerSocketEventType> {
  constructor(socket: Socket) {
    super(socket);
  }

  public emitGameRoomJoined(data: { gameId: string, playerId?: string }) {
    this.emit(PlayerSocketEventNames.GameRoomJoined, data);
  }

  public emitGameRoomLeft(data: { gameId: string, playerId?: string }) {
    this.emit(PlayerSocketEventNames.GameRoomLeft, data);
  }
}
