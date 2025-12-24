import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface InternalGamePlayerQuitEvent extends InternalGameEvent {
    playerId: DBObjectId;
    playerAlias: string;
};
