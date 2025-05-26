import type { Socket } from "socket.io-client";
import {Emitter, type EventName} from "@solaris-common";

export abstract class ClientSocketEmitter<TEventType> extends Emitter<TEventType> {
  constructor(private socket: Socket) {
    super();
    this.eventType;
  }

  protected override emit<TEventName extends EventName<TEventType, TData>, TData>(event: TEventName, data: TData): void {
    this.socket.emit(event, data);
  }
}
