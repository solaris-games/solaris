import type { Socket } from "socket.io-client";
import type { GameState } from "solaris-common/src";
import GameSocketEventNames, { type GameSocketEventType } from 'solaris-common/src/sockets/socketEventNames/game';
import type { ToastPluginApi } from "vue-toast-notification";
import type { Store } from "vuex/types/index.js";
import type { EventBus } from "../../eventBus";
import GameEventBusEventNames from "../../eventBusEventNames/game";
import AudioService from '../../game/audio';
import GameMutationNames from "../../mutationNames/gameMutationNames";
import type { State } from "../../store";
import { ClientSocketHandler } from "./clientSocketHandler";

export class GameClientSocketHandler extends ClientSocketHandler<GameSocketEventType> {
  constructor(socket: Socket,
              store: Store<State>,
              toast: ToastPluginApi,
              eventBus: EventBus) {
    super(socket);

    this.on(GameSocketEventNames.GameStarted, (e: { state: GameState<string> }) => {
      store.commit(GameMutationNames.GameStarted, e);

      eventBus.emit(GameEventBusEventNames.GameStarted, e);

      toast.info(`The game is full and will start soon. Reload the game now to view the galaxy.`, {
        duration: 10000,
        onClick: () => {
          window.location.reload();
        }
      });

      AudioService.download();
    });
  }
}
