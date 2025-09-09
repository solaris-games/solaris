import { Carrier } from "./Carrier";
import { Conversation } from "./Conversation";
import { CustomGalaxy } from "../../../common/src/api/types/common/customGalaxy";
import { DBObjectId } from "./DBObjectId";
import { Location } from "./Location";
import { Player } from "./Player";
import { Star } from "./Star";

export type GameType = 'tutorial'|
'custom'|
'standard_rt'| 
'standard_tb'| 
'1v1_rt'|
'1v1_tb'| 
'new_player_rt'|
'new_player_tb'|
'32_player_rt'|
'16_player_relaxed'|
'special_dark'|
'special_fog'|
'special_ultraDark'|
'special_orbital'|
'special_battleRoyale'|
'special_homeStar'|
'special_homeStarElimination' |
'special_anonymous'|
'special_kingOfTheHill'|
'special_tinyGalaxy'|
'special_freeForAll'|
'special_arcade';

export type GameMode = 'conquest'|'battleRoyale'|'kingOfTheHill'|'teamConquest';
export type GamePlayerType = 'all'|'establishedPlayers';
export type GamePlayerAnonymity = 'normal'|'extra';
export type GamePlayerOnlineStatus = 'hidden'|'visible';
export type GameSettingEnabledDisabled = 'disabled'|'enabled';
export type GameAwardRankTo = 'all'|'winner'|'top_n'|'teams';
export type GameGalaxyType = 'circular'|'spiral'|'doughnut'|'circular-balanced'|'irregular'|'custom';
export type GameCarrierCost = 'cheap'|'standard'|'expensive';
export type GameCarrierUpkeepCost = 'none'|'cheap'|'standard'|'expensive';
export type GameAllianceUpkeepCost = 'none'|'cheap'|'standard'|'expensive'; 
export type GameWarpgateCost = 'none'|'cheap'|'standard'|'expensive';
export type GameSpecialistCost = 'none'|'standard'|'expensive'|'veryExpensive'|'crazyExpensive';
export type GameSpecialistCurrency = 'credits'|'creditsSpecialists';
export type GameDarkGalaxyMode = 'disabled'|'fog'|'standard'|'extra'|'start';
export type GameResourceDistribution = 'random'|'weightedCenter';
export type GamePlayerDistribution = 'circular'|'random'|'circularSequential';
export type GameVictoryCondition = 'starPercentage'|'homeStarPercentage';
export type GameVictoryPercentage = 25|33|50|66|75|90|100;
export type GameInfrastructureCost = 'none'|'cheap'|'standard'|'expensive';
export type GameInfrastructureExpenseMultiplier = 'none'|'cheap'|'standard'|'expensive'|'crazyExpensive';
export type GameTradeCost = 0|5|15|25|50|100;
export type GameTradeScanning = 'all'|'scanned';
export type GameResearchCost = 'none'|'cheap'|'standard'|'expensive'|'veryExpensive'|'crazyExpensive';
export type GameBankingReward = 'standard'|'legacy';
export type GameExperimentationDistribution = 'random'|'current_research';
export type GameExperimentationReward = 'standard'|'experimental';
export type GameSpecialistTokenReward = 'standard'|'experimental';
export type GameTimeType = 'realTime'|'turnBased';
export type GameTimeSpeed = 30|60|300|600|1800|3600|7200;
export type GameTimeStartDelay = 0|1|5|10|30|60|120|240|360|480|600|720|1440;
export type GameTimeMaxTurnWait = 1|5|10|30|60|120|240|360|480|600|720|1080|1440|2880;
export type ReadyToQuitFraction = 0.5|0.66|0.75|0.9|1.0;
export type ReadyToQuitTimerCycles = 0|1|2|3;
export type ReadyToQuitVisibility = 'visible'|'anonymous'|'hidden';
export type CombatResolutionMalusStrategy = 'largestCarrier' | 'anyCarrier';

export type GameResearchProgressionStandard = {
	progression: 'standard',
}

export type GameResearchProgressionExponential = {
	progression: 'exponential',
	growthFactor: 'soft'|'medium'|'hard',
}

export type GameResearchProgression = GameResearchProgressionStandard | GameResearchProgressionExponential;

export interface GameFlux {
	id: number;
	name: string;
	month: string;
	description: string;
};

export interface GameSettings {
	general: {
		fluxId: number | null;
		createdByUserId?: DBObjectId | null;
		createdFromTemplate?: string | null;
		name: string;
		description: string | null;
		type: GameType;
		mode: GameMode;
		featured: boolean;
		password?: string | null;
		passwordRequired: boolean;
		playerLimit: number;
		playerType: GamePlayerType;
		anonymity: GamePlayerAnonymity;
		playerOnlineStatus: GamePlayerOnlineStatus;
		playerIPWarning: GameSettingEnabledDisabled;
		timeMachine: GameSettingEnabledDisabled;
		awardRankTo: GameAwardRankTo;
		awardRankToTopN?: number;
		fluxEnabled: GameSettingEnabledDisabled;
		isGameAdmin?: boolean;
		advancedAI: GameSettingEnabledDisabled;
		afkSlotsOpen: GameSettingEnabledDisabled;
		spectators: GameSettingEnabledDisabled;
		flux?: GameFlux | null;
		readyToQuit: GameSettingEnabledDisabled;
		readyToQuitFraction?: ReadyToQuitFraction;
		readyToQuitTimerCycles?: ReadyToQuitTimerCycles;
		readyToQuitVisibility: ReadyToQuitVisibility;
	},
	galaxy: {
		galaxyType: GameGalaxyType;
		starsPerPlayer: number;
		productionTicks: number;
		customJSON?: string;
		customGalaxy?: CustomGalaxy;
		advancedCustomGalaxyEnabled?: GameSettingEnabledDisabled;
        customSeed?: string;
	},
	specialGalaxy: {
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
        combatResolutionMalusStrategy: CombatResolutionMalusStrategy;
		specialistBans: {
			star: number[];
			carrier: number[];
		},
	},
	conquest: {
		victoryCondition: GameVictoryCondition;
		victoryPercentage: GameVictoryPercentage;
		capitalStarElimination: GameSettingEnabledDisabled;
		teamsCount?: number;
	},
	kingOfTheHill: {
		productionCycles: number;
	},
	orbitalMechanics: {
		enabled: GameSettingEnabledDisabled;
		orbitSpeed: number;
	},
	player: {
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
  	},
	diplomacy: {
		enabled: GameSettingEnabledDisabled;
		tradeRestricted: GameSettingEnabledDisabled;
		maxAlliances: number;
		upkeepCost: GameAllianceUpkeepCost;
		globalEvents: GameSettingEnabledDisabled;
		lockedAlliances: GameSettingEnabledDisabled;
	},
	technology: {
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
	},
	gameTime: {
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
	}
};

export interface GameUserNotification {
	unreadConversations: number | null;
	unreadEvents: number | null;
	unread: number | null;
	turnWaiting: boolean | null;
	defeated: boolean | null;
	afk: boolean | null;
	position: number | null;
};

export interface GameSpectator {
	_id: DBObjectId;
	username: string;
	playerIds: DBObjectId[];
}

export interface Team {
	_id: DBObjectId;
	name: string;
	players: DBObjectId[];
}

export interface Game {
    _id: DBObjectId;
    settings: GameSettings;
    galaxy: {
        players: Player[],
		stars: Star[],
		carriers: Carrier[],
		homeStars?: DBObjectId[],
		linkedStars: DBObjectId[][],
		teams?: Team[],
	},
	conversations: Conversation[]
	state: {
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
		winner: DBObjectId | null;
		winningTeam: DBObjectId | null;
		leaderboard: DBObjectId[] | null;
		teamLeaderboard: DBObjectId[] | null;
		cleaned: boolean;
		openSlots?: number;
	},
	constants: {
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
            captureRewardLimitMultiplier: number;
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
	},
	quitters: DBObjectId[],
	afkers: DBObjectId[],
	userNotifications?: GameUserNotification;

	save(): Promise<Game>;
};
