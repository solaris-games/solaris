import { ObjectId } from "mongoose";

export interface EloRatingChange {
    _id: ObjectId;
    newRating: number;
    oldRating: number;
};

export interface EloRatingChangeResult {
    winner: EloRatingChange;
    loser: EloRatingChange;
};

export interface GameRanking {
    playerId: ObjectId;
    current: number;
    new: number;
};

export interface GameRankingResult {
    ranks: GameRanking[];
    eloRating: EloRatingChangeResult | null;
};
