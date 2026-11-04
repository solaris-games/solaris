import type { EventBusEventName } from "@solaris/map-rendering";
import {
  type ConversationMessageSentResult,
  makeCastFunc,
} from "@solaris/common";

export type StateEventBusEventType = {
  stateEventBusEventType: "stateEventBusEventType";
};

export type StateEventBusEventName<TData> = EventBusEventName<
  StateEventBusEventType,
  TData
> &
  StateEventBusEventType;

const toEventName: <TData>(value: string) => StateEventBusEventName<TData> =
  makeCastFunc();

export default class StateEventBusEventNames {
  public static readonly BackendDownErrorReceived: StateEventBusEventName<{}> =
    toEventName("backendDownErrorReceived");
}
