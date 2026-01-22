import type { Socket } from "socket.io-client";
import {type EventName, Handler} from "@solaris-common";
import {convertDates} from "@/util/http";

export abstract class ClientSocketHandler<TEventType> extends Handler<TEventType> {
  constructor(private socket: Socket) {
    super();
    this.eventType;
  }

  protected override on<TEventName extends EventName<TEventType, TData>, TData>(event: TEventName, listener: (e: TData) => void) {
    this.socket.on(event as string, (data) => listener(convertDates(data)));
  }
}
