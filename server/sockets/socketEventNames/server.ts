import { makeCastFunc, type SocketEventName } from "@solaris-common";
import { Socket } from "socket.io";

export type ServerSocketEventType = { serverSocketEventType: 'serverSocketEventType' };
export type ServerSocketEventName<TData> = SocketEventName<ServerSocketEventType, TData> & { serverSocketEventName: 'serverSocketEventName' };

const toEventName: <TData>(value: string) => ServerSocketEventName<TData> = makeCastFunc();

export default class ServerSocketEventNames {
    private constructor() { };

    public static readonly Connection: ServerSocketEventName<Socket> = toEventName('connection');
    public static readonly ConnectionError: ServerSocketEventName<Error> = toEventName('connection_error');
}