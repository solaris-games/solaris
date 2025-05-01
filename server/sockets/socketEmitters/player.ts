import { Server } from "socket.io";
import { ConversationMessageSentResult } from "solaris-common";
import { LedgerType } from "solaris-common";
import { TradeEventTechnology } from "solaris-common";
import { PlayerSocketEventNames, PlayerSocketEventType } from "solaris-common";
import { ServerSocketEmitter } from "./serverSocketEmitter";

export class PlayerServerSocketEmitter extends ServerSocketEmitter<PlayerSocketEventType> {
    constructor(server: Server) {
        super(server);
    }

    public emitGamePlayerJoined(room: string | string[], data: { playerId: string, alias: string, avatar: string }) {
        this.emit(room, PlayerSocketEventNames.GamePlayerJoined, data);
    }

    public emitGamePlayerQuit(room: string | string[], data: { playerId: string }) {
        this.emit(room, PlayerSocketEventNames.GamePlayerQuit, data);
    }

    public emitGamePlayerReady(room: string | string[], data: { playerId: string }) {
        this.emit(room, PlayerSocketEventNames.GamePlayerReady, data);
    }

    public emitGamePlayerNotReady(room: string | string[], data: { playerId: string }) {
        this.emit(room, PlayerSocketEventNames.GamePlayerNotReady, data);
    }

    public emitGamePlayerReadyToQuit(room: string | string[], data: { playerId?: string }) {
        this.emit(room, PlayerSocketEventNames.GamePlayerReadyToQuit, data);
    }

    public emitGamePlayerNotReadyToQuit(room: string | string[], data: { playerId?: string }) {
        this.emit(room, PlayerSocketEventNames.GamePlayerNotReadyToQuit, data);
    }

    public emitGameConversationRead(room: string | string[], data: { conversationId: string, readByPlayerId: string }) {
        this.emit(room, PlayerSocketEventNames.GameConversationRead, data);
    }

    public emitGameConversationLeft(room: string | string[], data: { conversationId: string, playerId: string }) {
        this.emit(room, PlayerSocketEventNames.GameConversationLeft, data);
    }

    public emitGameConversationMessagePinned(room: string | string[], data: { conversationId: string, messageId: string }) {
        this.emit(room, PlayerSocketEventNames.GameConversationMessagePinned, data);
    }

    public emitGameConversationMessageUnpinned(room: string | string[], data: { conversationId: string, messageId: string }) {
        this.emit(room, PlayerSocketEventNames.GameConversationMessageUnpinned, data);
    }

    public emitPlayerEventRead(room: string | string[], data: { eventId: string }) {
        this.emit(room, PlayerSocketEventNames.PlayerEventRead, data);
    }

    public emitPlayerAllEventsRead(room: string | string[], data: { }) {
        this.emit(room, PlayerSocketEventNames.PlayerAllEventsRead, data);
    }

    public emitPlayerCreditsReceived(room: string | string[], data: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, credits: number } }) {
        this.emit(room, PlayerSocketEventNames.PlayerCreditsReceived, data);
    }

    public emitPlayerCreditsSpecialistsReceived(room: string | string[], data: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, creditsSpecialists: number } }) {
        this.emit(room, PlayerSocketEventNames.PlayerCreditsSpecialistsReceived, data);
    }

    public emitPlayerRenownReceived(room: string | string[], data: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, renown: number } }) {
        this.emit(room, PlayerSocketEventNames.PlayerRenownReceived, data);
    }

    public emitPlayerTechnologyReceived(room: string | string[], data: { playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, technology: TradeEventTechnology } }) {
        this.emit(room, PlayerSocketEventNames.PlayerTechnologyReceived, data);
    }

    public emitPlayerDebtAdded(room: string | string[], data: { debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }) {
        this.emit(room, PlayerSocketEventNames.PlayerDebtAdded, data);
    }

    public emitPlayerDebtForgiven(room: string | string[], data: { debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }) {
        this.emit(room, PlayerSocketEventNames.PlayerDebtForgiven, data);
    }

    public emitPlayerDebtSettled(room: string | string[], data: { debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }) {
        this.emit(room, PlayerSocketEventNames.PlayerDebtSettled, data);
    }
}
