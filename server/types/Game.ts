import { ObjectId } from "mongoose";
import { Carrier } from "./Carrier";
import { Conversation } from "./Conversation";
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
'special_dark'|
'special_ultraDark'|
'special_orbital'|
'special_battleRoyale'|
'special_homeStar'|
'special_anonymous'|
'special_kingOfTheHill'|
'special_tinyGalaxy';

export type GameMode = 'conquest'|'battleRoyale'|'kingOfTheHill';
export type GamePlayerType = 'all'|'establishedPlayers';
export type GamePlayerAnonymity = 'normal'|'extra';
export type GamePlayerOnlineStatus = 'hidden'|'visible';
export type GameSettingEnabledDisabled = 'disabled'|'enabled';
export type GameAwardRankTo = 'all'|'winner';
export type GameGalaxyType = 'circular'|'spiral'|'doughnut'|'circular-balanced'|'irregular'|'custom';
export type GameCarrierCost = 'cheap'|'standard'|'expensive';
export type GameCarrierUpkeepCost = 'none'|'cheap'|'standard'|'expensive';
export type GameWarpgateCost = 'none'|'cheap'|'standard'|'expensive';
export type GameSpecialistCost = 'none'|'standard'|'expensive'|'veryExpensive'|'crazyExpensive';
export type GameSpecialistCurrency = 'credits'|'creditsSpecialists';
export type GameDarkGalaxyMode = 'disabled'|'standard'|'extra'|'start';
export type GameResourceDistribution = 'random'|'weightedCenter';
export type GamePlayerDistribution = 'circular'|'random';
export type GameVictoryCondition = 'starPercentage'|'homeStarPercentage';
export type GameVictoryPercentage = 25|33|50|66|75|90|100;
export type GameInfrastructureCost = 'cheap'|'standard'|'expensive';
export type GameTradeCost = 0|5|15|25|50|100;
export type GameTradeScanning = 'all'|'scanned';
export type GameResearchCost = 'none'|'cheap'|'standard'|'expensive'|'veryExpensive'|'crazyExpensive';
export type GameBankingReward = 'standard'|'legacy';
export type GameSpecialistTokenReward = 'standard'|'experimental';
export type GameTimeType = 'realTime'|'turnBased';
export type GameTimeSpeed = 30|60|300|600|1800|3600|7200;
export type GameTimeStartDelay = 0|1|5|10|30|60|120|240|360|480|600|720|1440;
export type GameTimeMaxTurnWait = 1|5|10|30|60|360|480|600|720|1080|1440|2880;

export interface Game {
    _id: ObjectId;
    settings: {
        general: {
            createdByUserId: ObjectId | null;
            name: string;
            description: string | null;
			type: GameType;
			mode: GameMode;
			featured: boolean;
			password: string | null;
			passwordRequired: boolean;
			playerLimit: number;
			playerType: GamePlayerType;
			anonymity: GamePlayerAnonymity;
			playerOnlineStatus: GamePlayerOnlineStatus;
			timeMachine: GameSettingEnabledDisabled;
			awardRankTo: GameAwardRankTo;
        },
        galaxy: {
			galaxyType: GameGalaxyType;
			starsPerPlayer: number;
			productionTicks: number;
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
			darkGalaxy: GameDarkGalaxyMode;
			giftCarriers: GameSettingEnabledDisabled;
			defenderBonus: GameSettingEnabledDisabled;
			carrierToCarrierCombat: GameSettingEnabledDisabled;
			splitResources: GameSettingEnabledDisabled;
			resourceDistribution: GameResourceDistribution;
			playerDistribution: GamePlayerDistribution;
			carrierSpeed: number;
			specialistBans: {
				star: number[];
				carrier: number[];
			},
        },
		conquest: {
			victoryCondition: GameVictoryCondition;
			victoryPercentage: GameVictoryPercentage;
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
			alliances: GameSettingEnabledDisabled;
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
			bankingReward: GameBankingReward;
			specialistTokenReward: GameSpecialistTokenReward;
		},
		gameTime: {
			gameType: GameTimeType;
			speed: GameTimeSpeed;
			startDelay: GameTimeStartDelay;
			turnJumps: number;
			maxTurnWait: GameTimeMaxTurnWait;
			afk: {
				lastSeenTimeout: number;
				cycleTimeout: number;
				turnTimeout: number;
			}
		}
    },
    galaxy: {
        players: Player[]
		stars: Star[],
		carriers: Carrier[]
	},
	conversations: Conversation[]
	state: {
		locked: boolean;
		tick: number;
		paused: boolean;
		productionTick: number;
		startDate: Date | null;
		endDate: Date | null;
		lastTickDate: Date | null;
		ticksToEnd: number | null;
		stars: number;
		starsForVictory: number;
		players: number;
		winner: ObjectId | null;
		cleaned: boolean;
	},
	constants: {
		distances: {
			lightYear: number;
			minDistanceBetweenStars: number;
			maxDistanceBetweenStars: number;
			warpSpeedMultiplier: number;
			galaxyCenterLocation: Location
		},
		research: {
			progressMultiplier: number;
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
			}
		}
	},
	quitters: ObjectId[],
	afkers: ObjectId[]
};
