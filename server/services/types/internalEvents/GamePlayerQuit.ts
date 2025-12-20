import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalGamePlayerQuitEvent extends InternalGameEvent {
    playerAlias: string;
};
