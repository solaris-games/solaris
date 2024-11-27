import { Player } from "./player";
import {Team} from "./game";

export interface PlayerStatistics {
    totalStars: number;
    totalHomeStars: number;
    totalCarriers: number;
    totalShips: number;
    totalShipsMax: number | null;
    totalEconomy: number;
    totalIndustry: number;
    totalScience: number;
    newShips: number;
    warpgates: number;
    totalStarSpecialists: number;
    totalCarrierSpecialists: number;
    totalSpecialists: number;
};

export interface LeaderboardPlayer<ID> {
    player: Player<ID>;
    stats: PlayerStatistics;
    isKingOfTheHill?: boolean;
};

export interface PlayerLeaderboard<ID>{
    leaderboard: LeaderboardPlayer<ID>[];
    fullKey: string;
};

export interface TeamLeaderboard<ID> {
    leaderboard: LeaderboardTeam<ID>[];
}

export interface LeaderboardTeam<ID> {
    team: Team<ID>;
    starCount: number;
    capitalCount: number;
}