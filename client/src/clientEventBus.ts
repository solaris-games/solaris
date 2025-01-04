import mitt, { type EventType, type Handler } from 'mitt';
import type { EventBus } from './eventBus';
import { type EventBusEventName } from './eventBusEventNames/eventBusEventName';

type Events<T> = Record<EventType, T>;

const emitter = mitt<Record<EventType, unknown>>();

export class ClientEventBus implements EventBus {
  public on<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
            TEventBusEventType,
            TData>(type: TEventBusEventName, handler: (e: TData) => void): void {
    emitter.on(type as TEventBusEventName, handler as Handler<Events<unknown>[TEventBusEventName]>);
  }

  public off<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
             TEventBusEventType,
             TData>(type: TEventBusEventName, handler?: (e: TData) => void): void {
    emitter.off(type as TEventBusEventName, handler as Handler<Events<unknown>[TEventBusEventName]>);
  }

  public emit<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
              TEventBusEventType,
              TData>(type: TEventBusEventName, e: TData): void;
  public emit<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
              TEventBusEventType,
              TData>(type: TEventBusEventName): void;
  public emit<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
              TEventBusEventType,
              TData>(type: TEventBusEventName, e?: TData): void {
    emitter.emit(type, e);
  }
}
