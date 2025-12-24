import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface InternalGamePlayerDefeatedEvent extends InternalGameEvent {
    playerId: DBObjectId;
    playerAlias: string;
    openSlot: boolean;
};
