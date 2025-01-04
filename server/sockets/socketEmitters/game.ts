import { Server } from "socket.io";
import { GameState } from "solaris-common/src";
import GameSocketEventNames, { GameSocketEventType } from "solaris-common/src/sockets/socketEventNames/game";
import { ServerSocketEmitter } from "./serverSocketEmitter";

export class GameServerSocketEmitter extends ServerSocketEmitter<GameSocketEventType> {
  constructor(server: Server) {
    super(server);
  }

  public emitGameStarted(room: string | string[], data: { state: GameState<string> }) {
    this.emit(room, GameSocketEventNames.GameStarted, data);
  }
}
