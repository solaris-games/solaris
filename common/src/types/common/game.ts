import type {Star} from "./star";
import type {Player} from "./player";
import type {Conversation} from "./conversation";
import type {Carrier} from "./carrier";
import type {Location} from "./location";
import type {CustomGalaxy} from "./customGalaxy";

export const GAME_TYPES  = [
    'tutorial',
    'custom',
    'standard_rt',
    'standard_tb',
    '1v1_rt',
    '1v1_tb',
    'new_player_rt',
    'new_player_tb',
    '32_player_rt',
    '16_player_relaxed',
    'special_dark',
    'special_fog',
    'special_ultraDark',
    'special_orbital',
    'special_battleRoyale',
    'special_homeStar',
    'special_homeStarElimination' ,
    'special_anonymous',
    'special_kingOfTheHill',
    'special_tinyGalaxy',
    'special_freeForAll',
    'special_arcade'
] as const;

export type GameType = typeof GAME_TYPES[number];

export const GAME_MODES = [
    'conquest',
    'battleRoyale',
    'kingOfTheHill',
    'teamConquest'
] as const;

export type GameMode = typeof GAME_MODES[number];
export type GamePlayerType = 'all'|'establishedPlayers';
export type GamePlayerAnonymity = 'normal'|'extra';
export type GamePlayerOnlineStatus = 'hidden'|'visible';
export type GameSettingEnabledDisabled = 'disabled'|'enabled';

export const GAME_AWARD_RANK_TO = [
    'all',
    'winner',
    'top_n',
    'teams'
] as const;

export type GameAwardRankTo = typeof GAME_AWARD_RANK_TO[number];

export const GAME_GALAXY_TYPE = [
    'circular',
    'spiral',
    'doughnut',
    'circular-balanced',
    'irregular',
    'custom',
] as const;

export type GameGalaxyType = typeof GAME_GALAXY_TYPE[number];

export const GAME_CARRIER_COST = [
    'cheap',
    'standard',
    'expensive'
] as const;

export type GameCarrierCost = typeof GAME_CARRIER_COST[number];

export const GAME_CARRIER_UPKEEP_COST = [
    'none',
    'cheap',
    'standard',
    'expensive'
] as const;

export type GameCarrierUpkeepCost = typeof GAME_CARRIER_UPKEEP_COST[number];

export const GAME_ALLIANCE_UPKEEP_COST = [
    'none',
    'cheap',
    'standard',
    'expensive'
] as const;

export type GameAllianceUpkeepCost = typeof GAME_ALLIANCE_UPKEEP_COST[number];

export const GAME_WARPGATE_COST = [
    'none',
    'cheap',
    'standard',
    'expensive'
] as const;

export type GameWarpgateCost = typeof GAME_WARPGATE_COST[number];

export const GAME_SPECIALIST_COST = [
    'none',
    'standard',
    'expensive',
    'veryExpensive',
    'crazyExpensive'
] as const;

export type GameSpecialistCost = typeof GAME_SPECIALIST_COST[number];

export const GAME_SPECIALIST_CURRENCY = [
    'credits',
    'creditsSpecialists'
] as const;

export type GameSpecialistCurrency = typeof GAME_SPECIALIST_CURRENCY[number];

export const GAME_DARK_GALAXY_MODES = [
    'disabled',
    'fog',
    'standard',
    'extra',
    'start'
] as const;

export type GameDarkGalaxyMode = typeof GAME_DARK_GALAXY_MODES[number];

export const GAME_RESOURCE_DISTRIBUTIONS = [
    'random',
    'weightedCenter'
] as const;

export type GameResourceDistribution = typeof GAME_RESOURCE_DISTRIBUTIONS[number];

export const GAME_PLAYER_DISTRIBUTIONS = [
    'circular',
    'random',
    'circularSequential'
] as const;

export type GamePlayerDistribution = typeof GAME_PLAYER_DISTRIBUTIONS[number];

export const GAME_VICTORY_CONDITIONS = [
    'starPercentage',
    'homeStarPercentage'
] as const;

export type GameVictoryCondition = typeof GAME_VICTORY_CONDITIONS[number];

export const GAME_VICTORY_PERCENTAGES = [25, 33, 50, 66, 75, 90, 100] as const;

export type GameVictoryPercentage = typeof GAME_VICTORY_PERCENTAGES[number];

export const GAME_INFRUSTRUCTURE_COSTS = [
    'none',
    'cheap',
    'standard',
    'expensive'
] as const;

export type GameInfrastructureCost = typeof GAME_INFRUSTRUCTURE_COSTS[number];

export const GAME_INFRASTRUCTURE_EXPENSE_MULTIPLIERS = [
    'none',
    'cheap',
    'standard',
    'expensive',
    'crazyExpensive'
] as const;

export type GameInfrastructureExpenseMultiplier = typeof GAME_INFRASTRUCTURE_EXPENSE_MULTIPLIERS[number];

export const GAME_TRADE_COSTS = [0, 5, 15, 25, 50, 100] as const;

export type GameTradeCost = typeof GAME_TRADE_COSTS[number];

export const GAME_TRADE_SCANNING = [
    'all',
    'scanned'
] as const;

export type GameTradeScanning = typeof GAME_TRADE_SCANNING[number];

export const GAME_RESEARCH_COSTS = [
    'none',
    'cheap',
    'standard',
    'expensive',
    'veryExpensive',
    'crazyExpensive'
] as const;

export type GameResearchCost = typeof GAME_RESEARCH_COSTS[number];

export const GAME_BANKING_REWARDS = [
    'standard',
    'legacy'
] as const;

export type GameBankingReward = typeof GAME_BANKING_REWARDS[number];

export const GAME_EXPERIMENTATION_DISTRIBUTIONS = [
    'random',
    'current_research'
] as const;

export type GameExperimentationDistribution = typeof GAME_EXPERIMENTATION_DISTRIBUTIONS[number];

export const GAME_EXPERIMENTATION_REWARDS = [
    'standard',
    'experimental'
] as const;

export type GameExperimentationReward = typeof GAME_EXPERIMENTATION_REWARDS[number];

export const GAME_SPECIALIST_TOKEN_REWARDS = [
    'standard',
    'experimental'
] as const;

export type GameSpecialistTokenReward = typeof GAME_SPECIALIST_TOKEN_REWARDS[number];

export const GAME_TIME_TYPES = [
    'realTime',
    'turnBased'
] as const;

export type GameTimeType = typeof GAME_TIME_TYPES[number];

export const GAME_TIME_SPEEDS = [30, 60, 300, 600, 1800, 3600, 7200] as const;

export type GameTimeSpeed = typeof GAME_TIME_SPEEDS[number];

export const GAME_TIME_START_DELAYS = [0, 1, 5, 10, 30, 60, 120, 240, 360, 480, 600, 720, 1440] as const;

export type GameTimeStartDelay = typeof GAME_TIME_START_DELAYS[number];

export const GAME_TIME_MAX_TURN_WAITS = [1,5,10,30,60,120,240,360,480,600,720,1080,1440,2880] as const;

export type GameTimeMaxTurnWait = typeof GAME_TIME_MAX_TURN_WAITS[number];

export const READY_TO_QUIT_FRACTIONS = [
    0.5, 0.66, 0.75, 0.9, 1.0
] as const;

export type ReadyToQuitFraction = typeof READY_TO_QUIT_FRACTIONS[number];

export const READY_TO_QUIT_TIMER_CYCLES = [0, 1, 2, 3] as const;

export type ReadyToQuitTimerCycles = typeof READY_TO_QUIT_TIMER_CYCLES[number];

export const READY_TO_QUIT_VISIBILITY = [
    'visible',
    'anonymous',
    'hidden'
] as const;

export type ReadyToQuitVisibility = typeof READY_TO_QUIT_VISIBILITY[number];
export type CombatResolutionMalusStrategy = 'largestCarrier' | 'anyCarrier';

export type GameResearchProgressionStandard = {
	progression: 'standard',
}

export type GameResearchProgressionExponential = {
	progression: 'exponential',
	growthFactor: 'soft'|'medium'|'hard',
}

export type GameResearchProgression = GameResearchProgressionStandard | GameResearchProgressionExponential;

export type GameFlux = {
	id: number;
	name: string;
	month: string;
	description: string;
};

export type GameSettingsGeneralBase = {
    name: string;
    description: string | null;
    type: GameType;
    mode: GameMode;
    password?: string | null;
    createdFromTemplate?: string | null;
    playerLimit: number;
    playerType: GamePlayerType;
    anonymity: GamePlayerAnonymity;
    playerOnlineStatus: GamePlayerOnlineStatus;
    playerIPWarning: GameSettingEnabledDisabled;
    awardRankTo: GameAwardRankTo;
    awardRankToTopN?: number;
    fluxEnabled: GameSettingEnabledDisabled;
    advancedAI: GameSettingEnabledDisabled;
    afkSlotsOpen: GameSettingEnabledDisabled;
    spectators: GameSettingEnabledDisabled;
    readyToQuit: GameSettingEnabledDisabled;
    readyToQuitFraction?: ReadyToQuitFraction;
    readyToQuitTimerCycles?: ReadyToQuitTimerCycles;
    readyToQuitVisibility: ReadyToQuitVisibility;
    joinRandomSlot: GameSettingEnabledDisabled;
}

export type GameSettingsGeneral<ID> = GameSettingsGeneralBase & {
    fluxId: number | null;
    passwordRequired: boolean;
    createdByUserId?: ID | null;
    featured: boolean;
    flux?: GameFlux | null;
    isGameAdmin?: boolean;
    timeMachine: GameSettingEnabledDisabled;
}

export type GameSettingsGalaxyBase = {
    galaxyType: GameGalaxyType;
    starsPerPlayer: number;
    productionTicks: number;
    advancedCustomGalaxyEnabled?: GameSettingEnabledDisabled;
}

export type GameSettingsGalaxy = GameSettingsGalaxyBase & {
    customGalaxy?: CustomGalaxy;
}

export type SpecialistBans = {
    star: number[];
    carrier: number[];
}

export type GameSettingsSpecialGalaxyBase = {
    carrierCost: GameCarrierCost;
    carrierUpkeepCost: GameCarrierUpkeepCost;
    warpgateCost: GameWarpgateCost;
    specialistCost: GameSpecialistCost;
    specialistsCurrency: GameSpecialistCurrency;
    randomWarpGates: number;
    randomWormHoles: number;
    randomNebulas: number;
    randomAsteroidFields: number;
    randomBlackHoles: number;
    randomBinaryStars: number;
    randomPulsars: number;
    darkGalaxy: GameDarkGalaxyMode;
    giftCarriers: GameSettingEnabledDisabled;
    defenderBonus: GameSettingEnabledDisabled;
    carrierToCarrierCombat: GameSettingEnabledDisabled;
    splitResources: GameSettingEnabledDisabled;
    resourceDistribution: GameResourceDistribution;
    playerDistribution: GamePlayerDistribution;
    carrierSpeed: number;
    starCaptureReward: GameSettingEnabledDisabled;
    specialistBans: SpecialistBans,
}

export type GameSettingsSpecialGalaxy = GameSettingsSpecialGalaxyBase & {
    combatResolutionMalusStrategy: CombatResolutionMalusStrategy;
}

export type GameSettingsPlayer = {
    startingStars: number;
    startingCredits: number;
    startingCreditsSpecialists: number;
    startingShips: number;
    startingInfrastructure: {
        economy: number;
        industry: number;
        science: number;
    },
    developmentCost: {
        economy: GameInfrastructureCost;
        industry: GameInfrastructureCost;
        science: GameInfrastructureCost;
    },
    tradeCredits: boolean;
    tradeCreditsSpecialists: boolean;
    tradeCost: GameTradeCost;
    tradeScanning: GameTradeScanning;
    populationCap: {
        enabled: GameSettingEnabledDisabled;
        shipsPerStar: number;
    },
    allowAbandonStars: GameSettingEnabledDisabled;
};

export type GameSettingsTechnology = {
    startingTechnologyLevel: {
        terraforming: number;
        experimentation: number;
        scanning: number;
        hyperspace: number;
        manufacturing: number;
        banking: number;
        weapons: number;
        specialists: number;
    },
    researchCosts: {
        terraforming: GameResearchCost;
        experimentation: GameResearchCost;
        scanning: GameResearchCost;
        hyperspace: GameResearchCost;
        manufacturing: GameResearchCost;
        banking: GameResearchCost;
        weapons: GameResearchCost;
        specialists: GameResearchCost;
    },
    researchCostProgression: GameResearchProgression;
    bankingReward: GameBankingReward;
    experimentationDistribution: GameExperimentationDistribution;
    experimentationReward: GameExperimentationReward;
    specialistTokenReward: GameSpecialistTokenReward;
};

export type GameSettingsGameTime = {
    gameType: GameTimeType;
    speed: GameTimeSpeed;
    isTickLimited: GameSettingEnabledDisabled;
    tickLimit: number | null;
    startDelay: GameTimeStartDelay;
    turnJumps: number;
    maxTurnWait: GameTimeMaxTurnWait;
    afk: {
        lastSeenTimeout: number;
        cycleTimeout: number;
        turnTimeout: number;
    }
};

export type GameSettingsInvariable = {
    conquest: {
        victoryCondition: GameVictoryCondition;
        victoryPercentage: GameVictoryPercentage;
        capitalStarElimination: GameSettingEnabledDisabled;
        teamsCount?: number;
    },
    kingOfTheHill?: {
        productionCycles: number;
    },
    orbitalMechanics: {
        enabled: GameSettingEnabledDisabled;
        orbitSpeed: number;
    },
    player: GameSettingsPlayer;
    diplomacy: {
        enabled: GameSettingEnabledDisabled;
        tradeRestricted: GameSettingEnabledDisabled;
        maxAlliances: number;
        upkeepCost: GameAllianceUpkeepCost;
        globalEvents: GameSettingEnabledDisabled;
        lockedAlliances: GameSettingEnabledDisabled;
    },
    technology: GameSettingsTechnology,
    gameTime: GameSettingsGameTime,
}

export type GameSettings<ID> = GameSettingsInvariable & {
	general: GameSettingsGeneral<ID>,
	galaxy: GameSettingsGalaxy,
    specialGalaxy: GameSettingsSpecialGalaxy,
};

export type GameUserNotification = {
	unreadConversations: number | null;
	unreadEvents: number | null;
	unread: number | null;
	turnWaiting: boolean | null;
	defeated: boolean | null;
	afk: boolean | null;
	position: number | null;
};

export type GameSpectator<ID> = {
	_id: ID;
	username: string;
	playerIds: ID[];
}

export type Team<ID> = {
	_id: ID;
	name: string;
	players: ID[];
}

export type GameConstants = {
    distances: {
        lightYear: number;
        minDistanceBetweenStars: number;
        maxDistanceBetweenStars: number;
        warpSpeedMultiplier: number;
        galaxyCenterLocation?: Location
    },
    research: {
        progressMultiplier: number;
        sciencePointMultiplier: number;
        experimentationMultiplier: number;
        exponentialGrowthFactors: {
            soft: number;
            medium: number;
            hard: number;
        }
    },
    star: {
        resources: {
            minNaturalResources: number;
            maxNaturalResources: number;
        },
        infrastructureCostMultipliers: {
            warpGate: number;
            economy: number;
            industry: number;
            science: number;
            carrier: number;
        },
        infrastructureExpenseMultipliers: {
            cheap: number;
            standard: number;
            expensive: number;
            veryExpensive: number;
            crazyExpensive: number;
        },
        specialistsExpenseMultipliers: {
            standard: number;
            expensive: number;
            veryExpensive: number;
            crazyExpensive: number;
        },
        captureRewardMultiplier: number;
        homeStarDefenderBonusMultiplier: number;
    },
    diplomacy: {
        upkeepExpenseMultipliers: {
            none: number;
            cheap: number;
            standard: number;
            expensive: number;
            crazyExpensive: number;
        }
    },
    player: {
        rankRewardMultiplier: number;
        bankingCycleRewardMultiplier: number;
    },
    specialists: {
        monthlyBanAmount: number;
    }
};

export type GameState<ID> = {
    readyToQuitCount: number | undefined;
    locked: boolean;
    tick: number;
    timeMachineMinimumTick?: number | null;
    paused: boolean;
    productionTick: number;
    startDate: Date | null;
    endDate: Date | null;
    lastTickDate: Date | null;
    ticksToEnd: number | null;
    forceTick: boolean;
    stars: number;
    starsForVictory: number;
    players: number;
    winner: ID | null;
    winningTeam: ID | null;
    leaderboard: ID[] | null;
    teamLeaderboard: ID[] | null;
    cleaned: boolean;
    openSlots?: number;
};

export type GameGalaxy<ID> = {
    players: Player<ID>[],
	stars: Star<ID>[],
	carriers: Carrier<ID>[],
	homeStars?: ID[],
	linkedStars: ID[][],
	teams?: Team<ID>[],
};

export type Game<ID> = {
    _id: ID;
    settings: GameSettings<ID>;
    galaxy: GameGalaxy<ID>,
	conversations: Conversation<ID>[]
	state: GameState<ID>,
	constants: GameConstants,
	quitters: ID[],
	afkers: ID[],
	userNotifications?: GameUserNotification;
};
