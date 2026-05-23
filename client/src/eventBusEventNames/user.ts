import {type ConversationMessageSentResult, makeCastFunc} from "@solaris/common";
import type {EventBusEventName} from "@solaris/map-rendering";

export type UserEventBusEventType = { playerEventBusEventType: 'playerEventBusEventType' };
export type UserEventBusEventName<TData> = EventBusEventName<UserEventBusEventType, TData> & { playerEventBusEventName: 'playerEventBusEventName' }

const toEventName: <TData>(value: string) => UserEventBusEventName<TData> = makeCastFunc();

export default class UserEventBusEventNames {
  public static readonly GameMessageSent: UserEventBusEventName<ConversationMessageSentResult<string>> = toEventName('gameMessageSent');
}
