import { GameRankingResult } from "../Rating";
import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalGameEndedEvent extends InternalGameEvent {
    rankingResult: GameRankingResult | null;
};
