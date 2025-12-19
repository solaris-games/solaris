import type { DiplomaticState } from "./diplomacy";
import type { PlayerStatistics } from "./leaderboard";
import type { InfrastructureType } from "./star";

export type PlayerShape = 'circle'|'square'|'diamond'|'hexagon';

export const RESEARCH_TYPES_NOT_RANDOM = [
    'scanning',
    'hyperspace',
    'terraforming',
    'experimentation',
    'weapons',
    'banking',
    'manufacturing',
    'specialists',
] as const;

export const RESEARCH_TYPES = [
    'scanning',
    'hyperspace',
    'terraforming',
    'experimentation',
    'weapons',
    'banking',
    'manufacturing',
    'specialists',
    'random',
] as const;

export type ResearchType = typeof RESEARCH_TYPES[number];
export type ResearchTypeNotRandom = typeof RESEARCH_TYPES_NOT_RANDOM[number];

export interface PlayerColour {
    alias: string;
    value: string;
};

export interface PlayerLedger<ID> {
    credits: PlayerLedgerDebt<ID>[];
    creditsSpecialists: PlayerLedgerDebt<ID>[];
}

export interface PlayerLedgerDebt<ID> {
    playerId: ID;
    debt: number;
};

export interface PlayerReputation<ID> {
    playerId: ID;
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

export interface PlayerDiplomaticState<ID> { 
    playerId: ID;
    status: DiplomaticState;
};

export interface PlayerScheduledActions<ID> {
    _id: ID;
    infrastructureType: InfrastructureType;
    buyType: string;
    amount: number;
    repeat: boolean;
    tick: number;
}

export type Player<ID> = {
    _id: ID;
    userId: ID | null;
    isRealUser?: boolean;
    isAIControlled?: boolean;
    homeStarId?: ID | null;
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
    ledger: PlayerLedger<ID>,
    reputations: PlayerReputation<ID>[],
    diplomacy: PlayerDiplomaticState<ID>[],
    scheduledActions: PlayerScheduledActions<ID>[],
    spectators: ID[];
    stats?: PlayerStatistics;
    isKingOfTheHill?: boolean;
    isInScanningRange?: boolean;
    currentResearchTicksEta?: number | null;
    nextResearchTicksEta?: number | null;
    hasPerspective?: boolean;
    colourMapping?: Map<String, PlayerColour>
};

export type PlayerColourShapeCombination = {
    colour: PlayerColour;
    shape: PlayerShape;
};
