import { ObjectId } from "mongoose";

export type PlayerShape = 'circle'|'square'|'diamond'|'hexagon';
export type ResearchType = 'scanning'|'hyperspace'|'terraforming'|'experimentation'|'weapons'|'banking'|'manufacturing'|'specialists';

export interface PlayerLedger {
    playerId: ObjectId;
    debt: number;
};

export interface PlayerReputation {
    playerId: ObjectId;
    score: number;
};

export interface ResearchProgress {
    level: number;
    progress: number;
};

export interface Player {
    _id?: ObjectId;
    userId: string | null; // TODO: Should be an ObjectId
    homeStarId: ObjectId;
    alias: string | null;
    avatar: string | null;
    notes: string;
    colour: {
        alias: string;
        value: string;
    },
    shape: PlayerShape;
    lastSeen: Date | null;
    lastSeenIP: string | null;
    researchingNow: ResearchType;
    researchingNext: ResearchType;
    credits: number;
    creditsSpecialists: number;
    defeated: boolean;
    defeatedDate: Date | null;
    afk: boolean;
    renownToGive: number;
    ready: boolean;
    readyToQuit: boolean;
    missedTurns: number;
    hasSentTurnReminder: boolean;
    hasFilledAfkSlot: boolean;
    research: {
        scanning: ResearchProgress,
        hyperspace: ResearchProgress,
        terraforming: ResearchProgress,
        experimentation: ResearchProgress,
        weapons: ResearchProgress,
        banking: ResearchProgress,
        manufacturing: ResearchProgress,
        specialists: ResearchProgress
    },
    ledger: PlayerLedger[],
    reputations: PlayerReputation[],
    diplomacy: {
        allies: ObjectId[]
    }
};
