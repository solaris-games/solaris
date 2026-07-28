import type { Socket } from "socket.io-client";
import type { GameState } from "@solaris/common";
import {
  GameSocketEventNames,
  type GameSocketEventType,
} from "@solaris/common";
import { useToast } from "vue-toast-notification";
import type { EventBus } from "../../eventBus";
import GameEventBusEventNames from "../../eventBusEventNames/game";
import AudioService from "../../services/audio";
import GameMutationNames from "../../mutationNames/gameMutationNames";
import { ClientSocketHandler } from "./clientSocketHandler";
import type { GameStore } from "@/stores/game";

export class GameClientSocketHandler extends ClientSocketHandler<GameSocketEventType> {
  constructor(socket: Socket, store: GameStore, eventBus: EventBus) {
    super(socket);

    const toast = useToast();

    this.on(
      GameSocketEventNames.GameStarted,
      (e: { state: GameState<string> }) => {
        store.socketMutations[GameMutationNames.GameStarted](e);

        eventBus.emit(GameEventBusEventNames.GameStarted, e);

        toast.info(
          `The game is full and will start soon. Reload the game now to view the galaxy.`,
          {
            duration: 10000,
            onClick: () => {
              window.location.reload();
            },
          },
        );

        AudioService.download();
      },
    );
  }
}
