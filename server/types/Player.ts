import { DBObjectId } from "./DBObjectId";
import { PlayerStatistics } from "./Leaderboard";

export type PlayerShape = 'circle'|'square'|'diamond'|'hexagon';
export type ResearchType = 'scanning'|'hyperspace'|'terraforming'|'experimentation'|'weapons'|'banking'|'manufacturing'|'specialists'|'random';

export interface PlayerColour {
    alias: string;
    value: string;
};

export interface PlayerLedger {
    playerId: DBObjectId;
    debt: number;
};

export interface PlayerReputation {
    playerId: DBObjectId;
    score: number;
};

export interface ResearchProgress {
    level: number;
    progress?: number;
};

export interface PlayerResearch {
    scanning: ResearchProgress,
    hyperspace: ResearchProgress,
    terraforming: ResearchProgress,
    experimentation: ResearchProgress,
    weapons: ResearchProgress,
    banking: ResearchProgress,
    manufacturing: ResearchProgress,
    specialists: ResearchProgress
};

export interface PlayerTechnologyLevels {
    scanning: number;
    hyperspace: number;
    terraforming: number;
    experimentation: number;
    weapons: number;
    banking: number;
    manufacturing: number;
    specialists: number;
};

export interface PlayerDiplomacy {
    allies: DBObjectId[];
};

export interface Player {
    _id: DBObjectId;
    userId: DBObjectId | null;
    homeStarId: DBObjectId;
    alias: string;
    avatar: string | null;
    notes?: string;
    colour: {
        alias: string;
        value: string;
    },
    shape: PlayerShape;
    lastSeen: Date | null;
    isOnline?: boolean | null;
    lastSeenIP?: string | null;
    hasDuplicateIP?: boolean;
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
    research: PlayerResearch,
    ledger: PlayerLedger[],
    reputations: PlayerReputation[],
    diplomacy: PlayerDiplomacy,
    stats?: PlayerStatistics;
    isKingOfTheHill?: boolean;
    isInScanningRange?: boolean;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
};

export interface PlayerColourShapeCombination {
    colour: PlayerColour;
    shape: PlayerShape;
};
