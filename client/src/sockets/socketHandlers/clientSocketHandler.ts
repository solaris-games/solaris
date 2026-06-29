import type { Socket } from "socket.io-client";
import { type EventName, Handler } from "@solaris/common";
import { convertDates } from "@/util/http";

export abstract class ClientSocketHandler<
  TEventType,
> extends Handler<TEventType> {
  private readonly _listeners: Array<{
    event: string;
    listener: (data: any) => void;
  }> = [];

  constructor(private socket: Socket) {
    super();
    this.eventType;
  }

  protected override on<TEventName extends EventName<TEventType, TData>, TData>(
    event: TEventName,
    listener: (e: TData) => void,
  ) {
    const wrapped = (data: any) => listener(convertDates(data));
    this._listeners.push({ event: event as string, listener: wrapped });
    this.socket.on(event as string, wrapped);
  }

  destroy() {
    for (const { event, listener } of this._listeners) {
      this.socket.off(event, listener);
    }
    this._listeners.length = 0;
  }
}
