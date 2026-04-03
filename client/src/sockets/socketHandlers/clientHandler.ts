import { Emitter, type DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
import type {EventName} from 'solaris-common';
import GameHelper from '../../services/gameHelper';
import type { PlayerClientSocketEmitter } from '../socketEmitters/player';
import ClientSocketEventNames, { type ClientSocketEventType } from "../socketEventNames/client";
import type {UserClientSocketEmitter} from "@/sockets/socketEmitters/user";
import type {GameStore} from "@/stores/game";

export class ClientHandler {

  constructor(socket: Socket,
              store: GameStore,
              playerClientSocketEmitter: PlayerClientSocketEmitter,
              userClientSocketEmitter: UserClientSocketEmitter) {

    this.socketOn(socket, ClientSocketEventNames.Connect, async () => {
      console.log('Socket connection established.');
      userClientSocketEmitter.emitJoined();
    });

    this.socketOn(socket.io, ClientSocketEventNames.Error, (err: Error) => {
      console.error('Socket.io error.');
      console.error(err);
    });

    this.socketOn(socket.io, ClientSocketEventNames.Reconnect, (attemptCount: number) => {
      userClientSocketEmitter.emitJoined();

      const gameId = store.game?._id;

      if (gameId) {
        const player = GameHelper.getUserPlayer(store.game!);

        console.log('Rejoining game room.');

        playerClientSocketEmitter.emitGameRoomJoined({
          gameId: gameId,
          playerId: player?._id
        });
      }
    });
  }

  protected socketOn<TSocketEventName extends EventName<ClientSocketEventType, TData>, TData extends unknown>(emitter: Emitter<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, event: TSocketEventName, listener: (e: TData) => void): void {
    emitter.on(event as string, listener);
  }
}
