import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalGamePlayerAFKEvent extends InternalGameEvent {
    playerAlias: string;
};
