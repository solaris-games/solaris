import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface InternalGamePlayerJoinedEvent extends InternalGameEvent {
    playerId: DBObjectId;
    playerAlias: string;
}