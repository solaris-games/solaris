import { Emitter, type DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
import type { SocketEventName } from 'solaris-common';
import type { Store } from 'vuex/types/index.js';
import GameHelper from '../../services/gameHelper';
import type { PlayerClientSocketEmitter } from '../socketEmitters/player';
import ClientSocketEventNames, { type ClientSocketEventType } from "../socketEventNames/client";
import type { State } from '../../store';
import type {UserClientSocketEmitter} from "@/sockets/socketEmitters/user";

export class ClientHandler {

  constructor(socket: Socket,
              store: Store<State>,
              playerClientSocketEmitter: PlayerClientSocketEmitter,
              userClientSocketEmitter: UserClientSocketEmitter) {

    this.socketOn(socket, ClientSocketEventNames.Connect, async () => {
      console.log('Socket connection established.');
    });

    this.socketOn(socket.io, ClientSocketEventNames.Error, (err: Error) => {
      console.error('Socket.io error.');
      console.error(err);
    });

    this.socketOn(socket.io, ClientSocketEventNames.Reconnect, (attemptCount: number) => {
      userClientSocketEmitter.emitJoined();

      const gameId = store.state.game?._id;

      if (gameId != null) {
        const player = GameHelper.getUserPlayer(store.state.game)

        console.log('Rejoining game room.');

        playerClientSocketEmitter.emitGameRoomJoined({
          gameId: gameId,
          playerId: player?._id
        });
      }
    });
  }

  protected socketOn<TSocketEventName extends SocketEventName<ClientSocketEventType, TData>, TData extends unknown>(emitter: Emitter<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, event: TSocketEventName, listener: (e: TData) => void): void {
    emitter.on(event as string, listener);
  }
}
