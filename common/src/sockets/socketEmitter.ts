import { type SocketEventName } from "./socketEventNames/socketEventName";

export abstract class SocketEmitter<TSocketEventType> {
    protected socketEventType?: TSocketEventType;

    constructor() {
        this.socketEventType;
    }

    // TData extends unknown is used to mitigate a known issue: https://github.com/microsoft/TypeScript/issues/30071
    protected abstract emit<TSocketEventName extends SocketEventName<TSocketEventType, TData>, TData extends unknown>(event: TSocketEventName, data: TData): void;
}
