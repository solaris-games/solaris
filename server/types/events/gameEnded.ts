import { GameRankingResult } from "../Rating";
import { BaseGameEvent } from "./baseGameEvent";

export default interface GameEndedEvent extends BaseGameEvent {
    rankingResult: GameRankingResult | null;
};
