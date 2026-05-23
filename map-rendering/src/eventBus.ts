import type { EventBusEventName } from './eventBusEventNames/eventBusEventName';

export interface EventBus {
    on<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
       TEventBusEventType,
       TData>(type: TEventBusEventName, handler: (e: TData) => void): void;

    off<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
        TEventBusEventType,
        TData>(type: TEventBusEventName, handler?: (e: TData) => void): void;

    emit<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
         TEventBusEventType,
         TData>(type: TEventBusEventName): void;

    emit<TEventBusEventName extends EventBusEventName<TEventBusEventType, TData>,
         TEventBusEventType,
         TData>(type: TEventBusEventName, e: TData): void;
}
