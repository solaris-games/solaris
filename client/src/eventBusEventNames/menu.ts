import { makeCastFunc } from "@solaris-common";
import type { EventBusEventName } from "./eventBusEventName";

export type MenuEventBusEventType = { menuEventBusEventType: 'menuEventBusEventType' };
export type MenuEventBusEventName<TData> = EventBusEventName<MenuEventBusEventType, TData> & { menuEventBusEventName: 'menuEventBusEventName' }

const toEventName: <TData>(value: string) => MenuEventBusEventName<TData> = makeCastFunc();

export default class MenuEventBusEventNames {
  private constructor() { };

  public static readonly OnViewConversationRequested: MenuEventBusEventName<{ conversationId: string, participantIds: string[] }> = toEventName('onViewConversationRequested');
  public static readonly OnOpenInboxRequested: MenuEventBusEventName<void> = toEventName('onOpenInboxRequested');
}
