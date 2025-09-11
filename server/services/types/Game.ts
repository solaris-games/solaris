import { Carrier } from "./Carrier";
import { Conversation } from "./Conversation";
import { DBObjectId } from "./DBObjectId";
import { Location } from "./Location";
import { Player } from "./Player";
import { Star } from "./Star";
import {GameSettings} from "@solaris-common";

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
    settings: GameSettings<DBObjectId>;
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
