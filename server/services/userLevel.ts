import { UserLevel } from "./types/UserLevel";

const ranks = require('../config/game/levels.json') as UserLevel[];

export default class UserLevelService {

    getByRankPoints(rankPoints: number): UserLevel {
        const sortedRanks = ranks.sort((a, b) => a.rankPoints - b.rankPoints);

        for (let i = sortedRanks.length - 1; i > 0; i--) {
            let rank = sortedRanks[i];

            if (rankPoints >= rank.rankPoints) {
                let next = sortedRanks[i + 1] || null;
                let rankPointsNext = next?.rankPoints || null;
                let rankPointsProgress: number | null = null;

                if (rankPointsNext != null) {
                    rankPointsProgress = rankPointsNext - rankPoints - rank.rankPoints
                }

                return {
                    ...rank,
                    rankPointsNext,
                    rankPointsProgress
                };
            }
        }

        return sortedRanks[0];
    }

};
