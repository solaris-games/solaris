import { Socket } from "socket.io-client";
import GameHelper from "../../services/gameHelper";
import type { PlayerClientSocketEmitter } from "../socketEmitters/player";
import ClientSocketEventNames from "../socketEventNames/client";
import type { GameStore } from "@/stores/game";

export class GameRoomClientSocketHandler {
  private readonly _reconnectListener: (attemptCount: number) => void;

  constructor(
    private readonly socket: Socket,
    store: GameStore,
    playerClientSocketEmitter: PlayerClientSocketEmitter,
  ) {
    this._reconnectListener = (_attemptCount: number) => {
      const gameId = store.game?._id;

      if (gameId) {
        const player = GameHelper.getUserPlayer(store.game!);

        console.log("Rejoining game room.");

        playerClientSocketEmitter.emitGameRoomJoined({
          gameId,
          playerId: player?._id,
        });
      }
    };

    this.socket.io.on(
      ClientSocketEventNames.Reconnect as unknown as "reconnect",
      this._reconnectListener,
    );
  }

  destroy() {
    this.socket.io.off(
      ClientSocketEventNames.Reconnect as unknown as "reconnect",
      this._reconnectListener,
    );
  }
}
