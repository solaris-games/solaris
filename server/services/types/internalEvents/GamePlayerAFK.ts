import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface InternalGamePlayerAFKEvent extends InternalGameEvent {
    playerId: DBObjectId;
    playerAlias: string;
};
