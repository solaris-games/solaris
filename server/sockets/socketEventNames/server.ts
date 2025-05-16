import { Socket } from "socket.io";
import { type EventName } from "solaris-common";
import { makeCastFunc } from "solaris-common";

export type ServerSocketEventType = { serverSocketEventType: 'serverSocketEventType' };
export type ServerSocketEventName<TData> = EventName<ServerSocketEventType, TData> & { serverSocketEventName: 'serverSocketEventName' };

const toEventName: <TData>(value: string) => ServerSocketEventName<TData> = makeCastFunc();

export default class ServerSocketEventNames {
    private constructor() { };

    public static readonly Connection: ServerSocketEventName<Socket> = toEventName('connection');
    public static readonly ConnectionError: ServerSocketEventName<Error> = toEventName('connection_error');
}