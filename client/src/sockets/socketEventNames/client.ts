import { type EventName } from "@solaris-common";
import { makeCastFunc } from "@solaris-common";

export type ClientSocketEventType = { clientSocketEventType: 'clientSocketEventType' };
export type ClientSocketEventName<TData> = EventName<ClientSocketEventType, TData> & { clientSocketEventName: 'clientSocketEventName' };

const toEventName: <TData>(value: string) => ClientSocketEventName<TData> = makeCastFunc();

export default class ClientSocketEventNames {
  private constructor() { };

  public static readonly Connect: ClientSocketEventName<void> = toEventName('connect');
  public static readonly Reconnect: ClientSocketEventName<number> = toEventName('reconnect');
  public static readonly Error: ClientSocketEventName<Error> = toEventName('error');
}
