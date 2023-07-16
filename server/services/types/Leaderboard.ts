import { DBObjectId } from "./DBObjectId";
import { Guild } from "./Guild";
import { Player } from "./Player";

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

export interface Leaderboard {
    leaderboard: LeaderboardPlayer[];
    fullKey: string;
};

export interface LeaderboardUser {
    _id: DBObjectId,
    username: string;
    position: number;
    guild: Guild | null;
};
