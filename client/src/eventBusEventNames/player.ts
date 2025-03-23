import { type ConversationMessageSentResult } from "@solaris-common";
import type { LedgerType } from "@solaris-common";
import type { TradeEventTechnology } from "@solaris-common";
import { makeCastFunc } from "@solaris-common";
import { type EventBusEventName } from "./eventBusEventName";

export type PlayerEventBusEventType = { playerEventBusEventType: 'playerEventBusEventType' };
export type PlayerEventBusEventName<TData> = EventBusEventName<PlayerEventBusEventType, TData> & { playerEventBusEventName: 'playerEventBusEventName' }

const toEventName: <TData>(value: string) => PlayerEventBusEventName<TData> = makeCastFunc();

export default class PlayerEventBusEventNames {
  private constructor() { };

  public static readonly GameConversationRead: PlayerEventBusEventName<{ conversationId: string, readByPlayerId: string }> = toEventName('gameConversationRead');

  public static readonly GameConversationLeft: PlayerEventBusEventName<{ conversationId: string, playerId: string }> = toEventName('gameConversationLeft');
  public static readonly GameConversationMessagePinned: PlayerEventBusEventName<{ conversationId: string, messageId: string }> = toEventName('gameConversationMessagePinned');
  public static readonly GameConversationMessageUnpinned: PlayerEventBusEventName<{ conversationId: string, messageId: string }> = toEventName('gameConversationMessageUnpinned');

  public static readonly PlayerEventRead: PlayerEventBusEventName<{ eventId: string }> = toEventName('playerEventRead');
  public static readonly PlayerAllEventsRead: PlayerEventBusEventName<{}> = toEventName('playerAllEventsRead');

  public static readonly PlayerCreditsReceived: PlayerEventBusEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, credits: number } }> = toEventName('playerCreditsReceived');
  public static readonly PlayerCreditsSpecialistsReceived: PlayerEventBusEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, creditsSpecialists: number } }> = toEventName('playerCreditsSpecialistsReceived');
  public static readonly PlayerTechnologyReceived: PlayerEventBusEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, technology: TradeEventTechnology } }> = toEventName('playerTechnologyReceived');
  public static readonly PlayerRenownReceived: PlayerEventBusEventName<{ playerId: string, type: string, date: Date, data: { fromPlayerId: string, toPlayerId: string, renown: number } }> = toEventName('playerRenownReceived');

  public static readonly PlayerDebtAdded: PlayerEventBusEventName<{ debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }> = toEventName('playerDebtAdded');
  public static readonly PlayerDebtForgiven: PlayerEventBusEventName<{ debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }> = toEventName('playerDebtForgiven');
  public static readonly PlayerDebtSettled: PlayerEventBusEventName<{ debtorPlayerId: string, creditorPlayerId: string, amount: number, ledgerType: LedgerType }> = toEventName('playerDebtSettled');
}
