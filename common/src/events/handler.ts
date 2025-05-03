import { type EventName } from "./index";

export abstract class Handler<TEventType> {
    protected eventType?: TEventType;

    constructor() {
        this.eventType;
    }

    // TData extends unknown is used to mitigate a known issue: https://github.com/microsoft/TypeScript/issues/30071
    protected abstract on<TEventName extends EventName<TEventType, TData>, TData extends unknown>(event: TEventName, listener: (e: TData) => void): void;
}
