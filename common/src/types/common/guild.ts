import type {UserPublic} from "./user";
import type {SettingVisibility} from "./settings";

export type GuildDataForUser<ID> = {
    _id: ID;
    name: string;
    tag: string;
};

export type GuildAchievementIcon =
    | 'victory';

export type GuildAchievement = {
    icon: GuildAchievementIcon;
    description: string;
};

export interface Guild<ID> {
    _id: ID;
    name: string;
    tag: string;
    leader: ID;
    officers: ID[];
    members: ID[];
    invitees: ID[];
    applicants: ID[];
    achievements: GuildAchievement[];
};

export interface GuildRank<ID> extends Guild<ID> {
    totalRank: number;
};

export interface GuildLeaderboard<ID> extends GuildRank<ID> {
    memberCount: number;
    position?: number;
};

export interface GuildUserApplication {
    name: string;
    tag: string;
    hasApplied: boolean;
};

export interface GuildWithUsers<ID> {
    _id: ID;
    name: string;
    tag: string;
    achievements: GuildAchievement[];
    leader?: UserPublic<ID>;
    officers?: UserPublic<ID>[];
    members?: UserPublic<ID>[];
    invitees?: UserPublic<ID>[];
    applicants?: UserPublic<ID>[];
    totalRank?: number;
};

export interface GuildUserWithTag<ID> {
    _id: ID;
    username: string;
    displayGuildTag: SettingVisibility;
    guild: Guild<ID> | null;
};
