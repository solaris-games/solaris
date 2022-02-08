import { Player } from "./Player";

export interface PlayerStatistics {
    totalStars: number;
    totalHomeStars: number;
    totalCarriers: number;
    totalShips: number;
    totalEconomy: number;
    totalIndustry: number;
    totalScience: number;
    newShips: number;
    warpgates: number;
    totalStarSpecialists: number;
    totalCarrierSpecialists: number;
    totalSpecialists: number;
};

export interface LeaderboardPlayer {
    player: Player;
    stats: PlayerStatistics;
};

export interface Leaderboard {
    leaderboard: LeaderboardPlayer[];
    fullKey: string;
};
