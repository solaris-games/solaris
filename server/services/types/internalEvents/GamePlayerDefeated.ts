import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalGamePlayerDefeatedEvent extends InternalGameEvent {
    playerAlias: string;
    openSlot: boolean;
};
