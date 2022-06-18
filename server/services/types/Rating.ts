import { DBObjectId } from "./DBObjectId";

export interface EloRatingChange {
    _id: DBObjectId;
    newRating: number;
    oldRating: number;
};

export interface EloRatingChangeResult {
    winner: EloRatingChange;
    loser: EloRatingChange;
};

export interface GameRanking {
    playerId: DBObjectId;
    current: number;
    new: number;
};

export interface GameRankingResult {
    ranks: GameRanking[];
    eloRating: EloRatingChangeResult | null;
};
