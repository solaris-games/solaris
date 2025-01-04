export type EventBusEventName<TEventBusEventType, TData> = string & { eventBusEventType?: TEventBusEventType, data?: TData, eventBusEventName: 'eventBusEventName' }
