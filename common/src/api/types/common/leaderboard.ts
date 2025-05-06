import type { Player } from "./player";
import type { Team } from "./game";
import type {UserRoles} from "./user";

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

export interface LeaderboardUser<ID> {
    _id: ID,
    username: string;
    position: number;
    guildId: ID;
    roles: UserRoles;
    achievements: {
        victories: number,
        rank: number,
        renown: number,
        eloRating: number,
        level: number,
        victories1v1: number,
    };
    guild: {
        _id: ID;
        name: string;
        tag: string;
    }
};
