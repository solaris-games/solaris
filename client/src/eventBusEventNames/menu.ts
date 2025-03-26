import { makeCastFunc } from "@solaris-common";
import MENU_STATES from '../services/data/menuStates.js';
import type { EventBusEventName } from "./eventBusEventName";

export type MenuEventBusEventType = { menuEventBusEventType: 'menuEventBusEventType' };
export type MenuEventBusEventName<TData> = EventBusEventName<MenuEventBusEventType, TData> & { menuEventBusEventName: 'menuEventBusEventName' }

const toEventName: <TData>(value: string) => MenuEventBusEventName<TData> = makeCastFunc();

export default class MenuEventBusEventNames {
  private constructor() { };

  public static readonly OnMenuRequested: MenuEventBusEventName<{ menuState: MENU_STATES | null, menuArguments: unknown | null }> = toEventName('onMenuRequested');

  public static readonly OnMenuChatSidebarRequested: MenuEventBusEventName<void> = toEventName('onMenuChatSidebarRequested');

  public static readonly OnCreateNewConversationRequested: MenuEventBusEventName<{ participantIds?: string[] }> = toEventName('onCreateNewConversationRequested');
  public static readonly OnViewConversationRequested: MenuEventBusEventName<{ conversationId: string, participantIds: string[] }> = toEventName('onViewConversationRequested');
  public static readonly OnOpenInboxRequested: MenuEventBusEventName<void> = toEventName('onOpenInboxRequested');
}
