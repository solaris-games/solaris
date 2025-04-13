import { DBObjectId } from "./DBObjectId";
import { UserLevel } from "./UserLevel";
import type { UserGameSettings } from "solaris-common";

export interface UserRoles {
    administrator: boolean;
    contributor: boolean;
    developer: boolean;
    communityManager: boolean;
    gameMaster: boolean;
};

export interface UserOAuth {
    discord?: {
        userId?: string;
        token?: {
            access_token: string;
            token_type: string;
            expires_in: string;
            refresh_token: string;
            scope: string;
        }
    }
};

export interface UserSubscriptions {
    settings: {
        notifyActiveGamesOnly: boolean;
    },
    inapp: {
        notificationsForOtherGames: boolean;
    },
    discord: {
        gameStarted: boolean;
        gameEnded: boolean;
        gameTurnEnded: boolean;
        playerGalacticCycleComplete: boolean;
        playerResearchComplete: boolean;
        playerTechnologyReceived: boolean;
        playerCreditsReceived: boolean;
        playerCreditsSpecialistsReceived: boolean;
        playerRenownReceived: boolean;
        conversationMessageSent: boolean;
    }
}

export interface UserWarning {
    text: string,
    date: Date,
}

export type AwardedBadge = {
    badge: string;
    awardedBy: DBObjectId | null;
    awardedByName: string | null;
    awardedInGame: DBObjectId | null;
    awardedInGameName: string | null;
    playerAwarded: boolean;
    time: Date | null;
}

export interface User {
    _id: DBObjectId;
    username: string;
    guildId: DBObjectId | null;
    email: string;
    emailEnabled: boolean;
    emailOtherEnabled: boolean;
    password: string | null;
    resetPasswordToken: string | null;
    credits: number;
    premiumEndDate: Date;
    banned: boolean;
    lastSeen: Date | null;
    lastSeenIP: string | null;
    isEstablishedPlayer: boolean;
    hasSentReviewReminder: boolean;
    roles: UserRoles,
    level?: UserLevel,
    warnings: UserWarning[];
    lastReadAnnouncement: DBObjectId | null;
    achievements: {
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
        combat: {
            kills: {
                ships: number;
                carriers: number;
                specialists: number;
            },
            losses: {
                ships: number;
                carriers: number;
                specialists: number;
            },
            stars: {
                captured: number;
                lost: number;
            },
            homeStars: {
                captured: number;
                lost: number;
            }
        },
        infrastructure: {
            economy: number;
            industry: number;
            science: number;
            warpGates: number;
            warpGatesDestroyed: number;
            carriers: number;
            specialistsHired: number;
        },
        research: {
            scanning: number;
            hyperspace: number;
            terraforming: number;
            experimentation: number;
            weapons: number;
            banking: number;
            manufacturing: number;
            specialists: number;
        },
        trade: {
            creditsSent: number;
            creditsReceived: number;
            creditsSpecialistsSent: number;
            creditsSpecialistsReceived: number;
            technologySent: number;
            technologyReceived: number;
            giftsSent: number;
            giftsReceived: number;
            renownSent: number;
        },
        badges: AwardedBadge[];
    },
    gameSettings: UserGameSettings,
    avatars: number[];
    oauth: UserOAuth;
    subscriptions: UserSubscriptions;
    tutorialsCompleted?: string[];
};