import { DBObjectId } from "./DBObjectId";
import {DiplomaticState, ResearchType, ResearchTypeNotRandom} from "solaris-common";
import { PlayerStatistics } from "./Leaderboard";
import { AiState } from "./Ai";
import { InfrastructureType } from "./Star";

export type PlayerShape = 'circle'|'square'|'diamond'|'hexagon';

export interface PlayerColour {
    alias: string;
    value: string;
};


export interface PlayerLedger {
    credits: PlayerLedgerDebt[];
    creditsSpecialists: PlayerLedgerDebt[];
}

export interface PlayerLedgerDebt {
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

export interface PlayerDiplomaticState { 
    playerId: DBObjectId;
    status: DiplomaticState;
};

export interface PlayerScheduledActions {
    _id: DBObjectId;
    infrastructureType: InfrastructureType;
    buyType: string;
    amount: number;
    repeat: boolean;
    tick: number;
}

export interface Player {
    _id: DBObjectId;
    userId: DBObjectId | null;
    isRealUser?: boolean;
    isAIControlled?: boolean;
    homeStarId?: DBObjectId | null;
    alias: string;
    avatar: string | null;
    notes?: string | null;
    colour: {
        alias: string;
        value: string;
    },
    shape: PlayerShape;
    lastSeen: Date | null;
    isOnline?: boolean | null;
    lastSeenIP?: string | null;
    hasDuplicateIP?: boolean;
    researchingNow: ResearchTypeNotRandom;
    researchingNext: ResearchType;
    credits: number;
    creditsSpecialists: number;
    isOpenSlot: boolean;
    defeated: boolean;
    defeatedDate: Date | null;
    afk: boolean;
    renownToGive: number;
    ready: boolean;
    readyToCycle: boolean;
    readyToQuit?: boolean;
    missedTurns: number;
    hasSentTurnReminder: boolean;
    hasFilledAfkSlot: boolean;
    research: PlayerResearch,
    ledger: PlayerLedger,
    reputations: PlayerReputation[],
    diplomacy: PlayerDiplomaticState[],
    scheduledActions: PlayerScheduledActions[],
    spectators: DBObjectId[];
    stats?: PlayerStatistics;
    isKingOfTheHill?: boolean;
    isInScanningRange?: boolean;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
    aiState?: AiState | null;
    hasPerspective?: boolean;
    colourMapping?: Map<String, PlayerColour>
};

export interface PlayerColourShapeCombination {
    colour: PlayerColour;
    shape: PlayerShape;
};
