import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalGamePlayerJoinedEvent extends InternalGameEvent {
    playerAlias: string;
}