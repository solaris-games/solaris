import { GameRankingResult } from "../Rating";
import { BaseGameEvent } from "./BaseGameEvent";

export default interface GameEndedEvent extends BaseGameEvent {
    rankingResult: GameRankingResult | null;
};
