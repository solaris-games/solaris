import { type EventName } from "./index";

export abstract class Emitter<TEventType> {
    protected eventType?: TEventType;

    constructor() {
        this.eventType;
    }

    // TData extends unknown is used to mitigate a known issue: https://github.com/microsoft/TypeScript/issues/30071
    protected abstract emit<TEventName extends EventName<TEventType, TData>, TData extends unknown>(event: TEventName, data: TData): void;
}
