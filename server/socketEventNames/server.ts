import { Socket } from "socket.io";
import { type SocketEventName } from "solaris-common/src/sockets/socketEventNames/socketEventName";
import { makeCastFunc } from "solaris-common/src/utilities/cast";

export type ServerSocketEventType = { serverSocketEventType: 'serverSocketEventType' };
export type ServerSocketEventName<TData> = SocketEventName<ServerSocketEventType, TData> & { serverSocketEventName: 'serverSocketEventName' };

const toEventName: <TData>(value: string) => ServerSocketEventName<TData> = makeCastFunc();

export default class ServerSocketEventNames {
    private constructor() { };

    public static readonly Connection: ServerSocketEventName<Socket> = toEventName('connection');
    public static readonly ConnectionError: ServerSocketEventName<Error> = toEventName('connection_error');
}