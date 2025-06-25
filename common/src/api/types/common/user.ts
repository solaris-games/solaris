import {type UserGameSettings} from "./settings";
import {type UserSubscriptions} from "./subscriptions";
import {Statistics} from "./stats";

export type UserWarning = {
    text: string,
    date: Date,
}

export type UserRoles = {
    administrator: boolean;
    contributor: boolean;
    developer: boolean;
    communityManager: boolean;
    gameMaster: boolean;
};

export type UserRoleKinds = keyof UserRoles;

export type AwardedBadge<ID> = {
    badge: string;
    awardedBy: ID | null;
    awardedByName: string | null;
    awardedInGame: ID | null;
    awardedInGameName: string | null;
    playerAwarded: boolean;
    time: Date | null;
}

export interface UserLevel {
    id: number;
    name: string;
    rankPoints: number;
    rankPointsNext?: number | null;
    rankPointsProgress?: number | null;
}

export type UserAchievements<ID> = {
    victories: number;
    victories1v1: number;
    level: number;
    rank: number;
    eloRating: number | null;
    renown: number;
    joined: number;
    completed: number;
    quit: number;
    defeated: number;
    defeated1v1: number;
    afk: number;
    stats: Statistics,
    badges: AwardedBadge<ID>[];
}

export type UserPublic<ID> = {
    _id: ID,
    username: string;
    guildId: ID | null;
    roles: UserRoles,
    level?: UserLevel,
    achievements: UserAchievements<ID>;
}

export type UserPrivate<ID> = UserPublic<ID> & {
    email: string;
    emailEnabled: boolean;
    emailOtherEnabled: boolean;
    credits: number;
    premiumEndDate: Date;
    banned: boolean;
    lastSeen: Date | null;
    lastSeenIP: string | null;
    isEstablishedPlayer: boolean;
    hasSentReviewReminder: boolean;
    warnings: UserWarning[];
    lastReadAnnouncement: ID | null;
    gameSettings: UserGameSettings,
    avatars: number[];
    oauth: {
        discord?: {
            userId?: string;
        }
    };
    subscriptions: UserSubscriptions;
    tutorialsCompleted?: string[];
}