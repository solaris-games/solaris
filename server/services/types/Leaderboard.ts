import { DBObjectId } from "./DBObjectId";
import { Guild } from "./Guild";
import { Player } from "./Player";
import {Team} from "./Game";

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

export interface LeaderboardPlayer {
    player: Player;
    stats: PlayerStatistics;
    isKingOfTheHill?: boolean;
};

export interface PlayerLeaderboard {
    leaderboard: LeaderboardPlayer[];
    fullKey: string;
};

export interface TeamLeaderboard {
    leaderboard: LeaderboardTeam[];
}

export interface LeaderboardTeam {
    team: Team;
    starCount: number;
    capitalCount: number;
}

export interface LeaderboardUser {
    _id: DBObjectId,
    username: string;
    position: number;
    guild: Guild | null;
};
