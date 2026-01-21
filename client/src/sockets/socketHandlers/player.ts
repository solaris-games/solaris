import moment from "moment";
import type { Socket } from "socket.io-client";
import type { Player } from "@solaris-common";
import type { LedgerType } from "@solaris-common";
import type { TradeEventTechnology } from "@solaris-common";
import { PlayerSocketEventNames, type PlayerSocketEventType } from '@solaris-common';
import type { Store } from "vuex/types/index.js";
import type { EventBus } from "../../eventBus";
import PlayerEventBusEventNames from "../../eventBusEventNames/player";
import PlayerMutationNames from "../../mutationNames/playerMutationNames";
import gameHelper from "../../services/gameHelper";
import type { State } from "../../store";
import { ClientSocketHandler } from "./clientSocketHandler";

export class PlayerClientSocketHandler extends ClientSocketHandler<PlayerSocketEventType> {
  constructor(socket: Socket,
              store: Store<State>,
              eventBus: EventBus) {
    super(socket);

    this.on(PlayerSocketEventNames.GamePlayerJoined, (e: { playerId: string, alias: string, avatar: string }) => store.commit(PlayerMutationNames.GamePlayerJoined, e));
    this.on(PlayerSocketEventNames.GamePlayerQuit, (e: { playerId: string }) => store.commit(PlayerMutationNames.GamePlayerQuit, e));
    this.on(PlayerSocketEventNames.GamePlayerConcededDefeat, (e: { playerId: string }) => store.commit(PlayerMutationNames.GamePlayerConcededDefeat, e));

    // Only the server handles these.
    //socket.on(PlayerSocketEventNames.GameRoomJoined, (e: { playerId: string, alias: string, avatar: string }) => store.commit(PlayerMutationNames.GameRoomJoined, e));
    //socket.on(PlayerSocketEventNames.GameRoomLeft, (e: { playerId: string, alias: string, avatar: string }) => store.commit(PlayerMutationNames.GameRoomLeft, e));

    // We don't need to do this as we should just subscribe to all events "forever" (until the browser tab/app is closed)".  The room should determine what events we receive.'
    //if (!gameHelper.isHiddenPlayerOnlineStatus(store.state.game))

    this.on(PlayerSocketEventNames.GamePlayerRoomJoined, (e: { playerId: string }) => {
      let player: Player<string> = gameHelper.getPlayerById(store.state.game!, e.playerId)!;

      player.lastSeen = moment().utc().toDate();
      player.isOnline = true;
    });

    this.on(PlayerSocketEventNames.GamePlayerRoomLeft, (e: { playerId: string }) => {
      let player: Player<string> = gameHelper.getPlayerById(store.state.game!, e.playerId)!;

      player.lastSeen = moment().utc().toDate();
      player.isOnline = false;
    });

    this.on(PlayerSocketEventNames.GamePlayerReady, (e: { playerId: string }) => store.commit(PlayerMutationNames.GamePlayerReady, e));
    this.on(PlayerSocketEventNames.GamePlayerNotReady, (e: { playerId: string }) => store.commit(PlayerMutationNames.GamePlayerNotReady, e));

    this.on(PlayerSocketEventNames.GamePlayerReadyToQuit, (e: { playerId?: string }) => store.commit(PlayerMutationNames.GamePlayerReadyToQuit, e));
    this.on(PlayerSocketEventNames.GamePlayerNotReadyToQuit, (e: { playerId?: string }) => store.commit(PlayerMutationNames.GamePlayerNotReadyToQuit, e));

    this.on(PlayerSocketEventNames.GameConversationRead, (e: { conversationId: string, readByPlayerId: string }) => eventBus.emit(PlayerEventBusEventNames.GameConversationRead, e));

    this.on(PlayerSocketEventNames.GameConversationLeft, (e: { conversationId: string, playerId: string }) => eventBus.emit(PlayerEventBusEventNames.GameConversationLeft, e));
    this.on(PlayerSocketEventNames.GameConversationMessagePinned, (e: { conversationId: string, messageId: string }) => eventBus.emit(PlayerEventBusEventNames.GameConversationMessagePinned, e));
    this.on(PlayerSocketEventNames.GameConversationMessageUnpinned, (e: { conversationId: string, messageId: string }) => eventBus.emit(PlayerEventBusEventNames.GameConversationMessageUnpinned, e));

    this.on(PlayerSocketEventNames.PlayerEventRead, (e: { eventId: string }) => eventBus.emit(PlayerEventBusEventNames.PlayerEventRead, e));
    this.on(PlayerSocketEventNames.PlayerAllEventsRead, (e: {}) => eventBus.emit(PlayerEventBusEventNames.PlayerAllEventsRead, e));

    this.on(PlayerSocketEventNames.PlayerCreditsReceived, (e: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, credits: number } }) => eventBus.emit(PlayerEventBusEventNames.PlayerCreditsReceived, e));
    this.on(PlayerSocketEventNames.PlayerCreditsSpecialistsReceived, (e: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, creditsSpecialists: number } }) => eventBus.emit(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, e));
    this.on(PlayerSocketEventNames.PlayerTechnologyReceived, (e: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, technology: TradeEventTechnology } }) => eventBus.emit(PlayerEventBusEventNames.PlayerTechnologyReceived, e));
    this.on(PlayerSocketEventNames.PlayerRenownReceived, (e: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, renown: number } }) => eventBus.emit(PlayerEventBusEventNames.PlayerRenownReceived, e));

    this.on(PlayerSocketEventNames.PlayerDebtAdded, (e: { debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }) => eventBus.emit(PlayerEventBusEventNames.PlayerDebtAdded, e));
    this.on(PlayerSocketEventNames.PlayerDebtForgiven, (e: { debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }) => eventBus.emit(PlayerEventBusEventNames.PlayerDebtForgiven, e));
    this.on(PlayerSocketEventNames.PlayerDebtSettled, (e: { debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }) => {
      store.commit(PlayerMutationNames.PlayerDebtSettled, e);
      eventBus.emit(PlayerEventBusEventNames.PlayerDebtSettled, e);
    });
  }
}
