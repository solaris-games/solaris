import { GameSocketEventNames, GameSocketEventType, GameState } from "@solaris-common";
import { Server } from "socket.io";
import { ServerSocketEmitter } from "./serverSocketEmitter";

export class GameServerSocketEmitter extends ServerSocketEmitter<GameSocketEventType> {
  constructor(server: Server) {
    super(server);
  }

  public emitGameStarted(room: string | string[], data: { state: GameState<string> }) {
    this.emit(room, GameSocketEventNames.GameStarted, data);
  }
}
