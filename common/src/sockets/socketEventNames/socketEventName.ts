export type SocketEventName<TSocketEventType, TData> = string & { socketEventType?: TSocketEventType, data?: TData, socketEventName?: 'socketEventName' }