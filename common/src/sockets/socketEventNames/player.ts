import { type ConversationMessageSentResult } from "../../api/types/common/conversationMessage";
import { LedgerType } from "../../api/types/common/ledger";
import { makeCastFunc } from "../../utilities/cast";
import { type TradeEventTechnology } from "../../api/types/common/trade";
import { type SocketEventName } from "./socketEventName";

export type PlayerSocketEventType = { playerSocketEventType: 'playerSocketEventType' };
export type PlayerSocketEventName<TData> = SocketEventName<PlayerSocketEventType, TData> & { playerSocketEventName: 'playerSocketEventName' }

const toEventName: <TData>(value: string) => PlayerSocketEventName<TData> = makeCastFunc();

export class PlayerSocketEventNames {
    private constructor() { };

    public static readonly GamePlayerJoined: PlayerSocketEventName<{ playerId: string, alias: string, avatar: string }> = toEventName('gamePlayerJoined');
    public static readonly GamePlayerQuit: PlayerSocketEventName<{ playerId: string }> = toEventName('gamePlayerQuit');

    public static readonly GameRoomJoined: PlayerSocketEventName<{ gameId: string, playerId?: string }> = toEventName('gameRoomJoined');
    public static readonly GameRoomLeft: PlayerSocketEventName<{ gameId: string, playerId?: string }> = toEventName('gameRoomLeft');

    public static readonly GamePlayerRoomJoined: PlayerSocketEventName<{ playerId: string }> = toEventName('gamePlayerRoomJoined');
    public static readonly GamePlayerRoomLeft: PlayerSocketEventName<{ playerId: string }> = toEventName('gamePlayerRoomLeft');

    public static readonly GamePlayerReady: PlayerSocketEventName<{ playerId: string }> = toEventName('gamePlayerReady');
    public static readonly GamePlayerNotReady: PlayerSocketEventName<{ playerId: string }> = toEventName('gamePlayerNotReady');

    public static readonly GamePlayerReadyToQuit: PlayerSocketEventName<{ playerId?: string }> = toEventName('gamePlayerReadyToQuit');
    public static readonly GamePlayerNotReadyToQuit: PlayerSocketEventName<{ playerId?: string }> = toEventName('gamePlayerNotReadyToQuit');

    public static readonly GameConversationRead: PlayerSocketEventName<{ conversationId: string, readByPlayerId: string }> = toEventName('gameConversationRead');

    public static readonly GameConversationLeft: PlayerSocketEventName<{ conversationId: string, playerId: string }> = toEventName('gameConversationLeft');
    public static readonly GameConversationMessagePinned: PlayerSocketEventName<{ conversationId: string, messageId: string }> = toEventName('gameConversationMessagePinned');
    public static readonly GameConversationMessageUnpinned: PlayerSocketEventName<{ conversationId: string, messageId: string }> = toEventName('gameConversationMessageUnpinned');

    public static readonly PlayerEventRead: PlayerSocketEventName<{ eventId: string }> = toEventName('playerEventRead');
    public static readonly PlayerAllEventsRead: PlayerSocketEventName<{}> = toEventName('playerAllEventsRead');

    public static readonly PlayerCreditsReceived: PlayerSocketEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, credits: number } }> = toEventName('playerCreditsReceived');
    public static readonly PlayerCreditsSpecialistsReceived: PlayerSocketEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, creditsSpecialists: number } }> = toEventName('playerCreditsSpecialistsReceived');
    public static readonly PlayerTechnologyReceived: PlayerSocketEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, technology: TradeEventTechnology } }> = toEventName('playerTechnologyReceived');
    public static readonly PlayerRenownReceived: PlayerSocketEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, renown: number } }> = toEventName('playerRenownReceived');

    public static readonly PlayerDebtAdded: PlayerSocketEventName<{ debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }> = toEventName('playerDebtAdded');
    public static readonly PlayerDebtForgiven: PlayerSocketEventName<{ debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }> = toEventName('playerDebtForgiven');
    public static readonly PlayerDebtSettled: PlayerSocketEventName<{ debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }> = toEventName('playerDebtSettled');
}