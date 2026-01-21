import { InternalGameEvent } from "./InternalGameEvent";
import {GameRankingResult} from "solaris-common";
import {DBObjectId} from "../DBObjectId";

export default interface InternalGameEndedEvent extends InternalGameEvent {
    rankingResult: GameRankingResult<DBObjectId> | null;
};
