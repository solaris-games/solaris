export interface EloRatingChange<ID> {
    _id: ID;
    newRating: number;
    oldRating: number;
}

export interface EloRatingChangeResult<ID> {
    winner: EloRatingChange<ID>;
    loser: EloRatingChange<ID>;
}

export interface GameRanking<ID> {
    playerId: ID;
    current: number;
    new: number;
}

export interface GameRankingResult<ID> {
    ranks: GameRanking<ID>[];
    eloRating: EloRatingChangeResult<ID> | null;
}
