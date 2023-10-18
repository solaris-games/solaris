import {Team} from "../../../services/types/Game";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

import PlayerSchema from './player';
import StarSchema from './star';
import CarrierSchema from './carrier';
import ConversationSchema from './conversation';
import TeamSchema from './team';

const schema = new Schema({
    settings: {
        general: {
			fluxId: { type: Types.Number, required: false, default: null },
            createdByUserId: { type: Types.ObjectId, required: false, default: null },
            name: { type: Types.String, required: true },
            description: { type: Types.String, required: false, default: null },
			type: { type: Types.String, required: true, enum: [
				'tutorial',
				'custom',
				'standard_rt',
				'standard_tb',
				'1v1_rt',
				'1v1_tb',
				'new_player_rt',
				'new_player_tb',
				'32_player_rt',
				'special_dark',
				'special_fog',
				'special_ultraDark',
				'special_orbital',
				'special_battleRoyale',
				'special_homeStar',
				'special_homeStarElimination',
				'special_anonymous',
				'special_kingOfTheHill',
				'special_tinyGalaxy',
				'special_freeForAll',
				'special_arcade'
			], default: 'custom' },
			mode: { type: Types.String, required: true, enum: [
				'conquest', 'battleRoyale', 'kingOfTheHill', 'teamConquest'
			], default: 'conquest' },
			featured: { type: Types.Boolean, required: false, default: false },
			password: { type: Types.String, required: false, default: null },
			passwordRequired: { type: Types.Boolean, required: false, default: false },
			playerLimit: { type: Types.Number, required: true, default: 8, min: 2, max: 32 },
			playerType: { type: Types.String, required: true, enum: ['all', 'establishedPlayers'], default: 'all' },
			anonymity: { type: Types.String, required: true, enum: ['normal', 'extra'], default: 'normal' },
			playerOnlineStatus: { type: Types.String, required: true, enum: ['hidden', 'visible'], default: 'hidden' },
			timeMachine: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'disabled' },
			awardRankTo: { type: Types.String, required: false, enum: ['all', 'winner'], default: 'all' },
			fluxEnabled: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'disabled' },
			advancedAI: { type: Types.String, required: false, enum: ['disabled', 'enabled'], default: 'disabled' },
			spectators: { type: Types.String, required: false, enum: ['disabled', 'enabled'], default: 'disabled' },
			readyToQuit: { type: Types.String, required: false, enum: ['disabled', 'enabled'], default: 'enabled' }
        },
        galaxy: {
			galaxyType: { type: Types.String, required: true, enum: ['circular', 'spiral', 'doughnut','circular-balanced', 'irregular', 'custom'], default: 'circular' },
			starsPerPlayer: { type: Types.Number, required: true, min: 3, max: 50, default: 20 },
			productionTicks: { type: Types.Number, required: true, min: 6, max: 36, default: 24 }
        },
        specialGalaxy: {
			carrierCost: { type: Types.String, required: true, enum: ['cheap', 'standard', 'expensive'], default: 'standard' },
			carrierUpkeepCost: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'none' },
			warpgateCost: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'standard' },
			specialistCost: { type: Types.String, required: true, enum: ['none', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
			specialistsCurrency: { type: Types.String, required: true, enum: ['credits', 'creditsSpecialists'], default: 'credits' },
			randomWarpGates: { type: Types.Number, min: 0, max: 50, default: 0 },
			randomWormHoles: { type: Types.Number, min: 0, max: 50, default: 0 },
			randomNebulas: { type: Types.Number, min: 0, max: 50, default: 0 },
			randomAsteroidFields: { type: Types.Number, min: 0, max: 50, default: 0 },
			randomBinaryStars: { type: Types.Number, min: 0, max: 50, default: 0 },
			randomBlackHoles: { type: Types.Number, min: 0, max: 50, default: 0 },
			randomPulsars: { type: Types.Number, min: 0, max: 50, default: 0 },
			darkGalaxy: { type: Types.String, required: true, enum: ['disabled', 'fog', 'standard', 'extra', 'start'], default: 'start' },
			giftCarriers: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'enabled' },
			defenderBonus: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'enabled' },
			carrierToCarrierCombat: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'disabled' },
			splitResources: { type: Types.String, required: false, enum: ['disabled', 'enabled'], default: 'disabled' },
			resourceDistribution: { type: Types.String, required: true, enum: ['random','weightedCenter'], default: 'random' },
			playerDistribution: { type: Types.String, required: true, enum: ['circular','random'], default: 'circular' },
			carrierSpeed: { type: Types.Number, required: true, min: 1, max: 25, default: 5 },
			starCaptureReward: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'enabled' },
			specialistBans: {
				star: [{ type: Types.Number, required: false }],
				carrier: [{ type: Types.Number, required: false }]
			}
        },
		conquest: {
			victoryCondition: { type: Types.String, required: true, enum: ['starPercentage', 'homeStarPercentage'], default: 'starPercentage' },
			victoryPercentage: { type: Types.Number, required: true, enum: [25, 33, 50, 66, 75, 90, 100], default: 50 },
			capitalStarElimination: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'disabled' },
			teamsCount: { type: Types.Number, required: false, default: null }
		},
		kingOfTheHill: {
			productionCycles: { type: Types.Number, required: false, min: 1, max: 25, default: 10 }
		},
		orbitalMechanics: {
			enabled: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'disabled' },
			orbitSpeed: { type: Types.Number, required: false, min: 1, max: 5, default: 3 }
		},
        player: {
			startingStars: { type: Types.Number, required: true, min: 1, max: 30, default: 6 },
			startingCredits: { type: Types.Number, required: true, min: 25, max: 3000, default: 500 },
			startingCreditsSpecialists: { type: Types.Number, required: true, min: 0, max: 100, default: 5 },
			startingShips: { type: Types.Number, required: true, min: 0, max: 100, default: 10 },
			startingInfrastructure: {
				economy: { type: Types.Number, required: true, min: 0, max: 30, default: 5 },
				industry: { type: Types.Number, required: true, min: 0, max: 30, default: 5 },
				science: { type: Types.Number, required: true, min: 0, max: 5, default: 1 }
			},
			developmentCost: {
				// Note: 'none' means that players cannot build the infrastructure
				economy: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'standard' },
				industry: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'standard' },
				science: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'standard' }
			},
			tradeCredits: { type: Types.Boolean, required: false, default: true },
			tradeCreditsSpecialists: { type: Types.Boolean, required: false, default: true },
			tradeCost: { type: Types.Number, required: true, enum: [0, 5, 15, 25, 50, 100], default: 15 }, // TODO: This could be renamed.
			tradeScanning: { type: Types.String, required: true, enum: ['all', 'scanned'], default: 'all' },
			populationCap: {
				enabled: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'disabled' },
				shipsPerStar: { type: Types.Number, required: true, min: 50, max: 1000, default: 100 }
			},
			allowAbandonStars: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'enabled' }
		},
		diplomacy: {
			enabled: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'disabled' },
			tradeRestricted: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'disabled' },
			lockedAlliances: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'disabled' },
			maxAlliances: { type: Types.Number, required: true, min: 1, max: 31, default: 31 },
			upkeepCost: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'crazyExpensive'], default: 'none' },
			globalEvents: { type: Types.String, required: true, enum: ['enabled', 'disabled'], default: 'disabled' }
		},
		technology: {
			startingTechnologyLevel: {
				terraforming: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				experimentation: { type: Types.Number, required: true, min: 0, max: 16, default: 1 },
				scanning: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				hyperspace: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				manufacturing: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				banking: { type: Types.Number, required: true, min: 0, max: 16, default: 1 },
				weapons: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				specialists: { type: Types.Number, required: true, min: 0, max: 16, default: 1 }
			},
			researchCosts: {
				terraforming: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				experimentation: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				scanning: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				hyperspace: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				manufacturing: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				banking: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				weapons: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				specialists: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' }
			},
			bankingReward: { type: Types.String, required: true, enum: ['standard', 'legacy'], default: 'standard' },
			experimentationReward: { type: Types.String, required: true, enum: ['standard', 'experimental'], default: 'standard' },
			specialistTokenReward: { type: Types.String, required: true, enum: ['standard', 'experimental'], default: 'standard' }
		},
		gameTime: {
			gameType: { type: Types.String, required: true, enum: ['realTime', 'turnBased'], default: 'realTime' },
			speed: { type: Types.Number, required: true, enum: [30, 60, 300, 600, 1800, 3600, 7200], default: 1800 }, // Time in seconds
			startDelay: { type: Types.Number, required: true, enum: [0, 1, 5, 10, 30, 60, 120, 240, 360, 480, 600, 720, 1440], default: 240 },	// Time in minutes
			turnJumps: { type: Types.Number, required: true, min: 1, max: 24, default: 8 },
			maxTurnWait: { type: Types.Number, required: true, enum: [1, 5, 10, 30, 60, 360, 480, 600, 720, 1080, 1440, 2880], default: 1440 },	// Time in minutes
			isTickLimited: { type: Types.String, required: false, enum: ['enabled', 'disabled'], default: 'disabled' },
			tickLimit: { type: Types.Number, required: false, min: 200, max: 2000, default: null },
			afk: {
				lastSeenTimeout: { type: Types.Number, required: true, min: 1, max: 7, default: 2}, // Time in days, real time and turn based
				cycleTimeout: { type: Types.Number, required: true, min: 3, max: 25, default: 3}, // Real time games' production cycle limit
				turnTimeout: { type: Types.Number, required: true, min: 1, max: 60, default: 3 },	// Turn based games' missed turn limit
			}
		}
    },
    galaxy: {
        players: [PlayerSchema],
		stars: [StarSchema],
		carriers: [CarrierSchema],
		teams: [TeamSchema],
	},
	conversations: [ConversationSchema],
	state: {
		locked: { type: Types.Boolean, required: false, default: false },
		tick: { type: Types.Number, required: true, default: 0 },
		paused: { type: Types.Boolean, required: true, default: true },
		productionTick: { type: Types.Number, required: true, default: 0 },
		startDate: { type: Types.Date, required: false, default: null }, // Dates are in UTC
		endDate: { type: Types.Date, required: false, default: null },
		lastTickDate: { type: Types.Date, required: false, default: null },
		ticksToEnd: { type: Types.Number, required: false, default: null },
		stars: { type: Types.Number, required: true },
		starsForVictory: { type: Types.Number, required: true },
		players: { type: Types.Number, required: true, default: 0 },
		winner: { type: Types.ObjectId, required: false, default: null },
		winningTeam: { type: Types.ObjectId, required: false, default: null },
		cleaned: { type: Types.Boolean, required: false, default: false }, // Represents if the events and history have been deleted.
		leaderboard: [{ type: Types.ObjectId, required: false }]
	},
	constants: {
		distances: {
			lightYear: { type: Types.Number, required: true, default: 50 },
			minDistanceBetweenStars: { type: Types.Number, required: true, default: 50 },
			maxDistanceBetweenStars: { type: Types.Number, required: true, default: 500 },
			warpSpeedMultiplier: { type: Types.Number, required: true, default: 3 },
			galaxyCenterLocation: {
				x: { type: Types.Number, required: false, default: 0 },
				y: { type: Types.Number, required: false, default: 0 }
			}
		},
		research: {
			progressMultiplier: { type: Types.Number, required: true, default: 50 },
			sciencePointMultiplier: { type: Types.Number, required: true, default: 1 },
			experimentationMultiplier: { type: Types.Number, required: true, default: 1 }
		},
		star: {
			resources: {
				minNaturalResources: { type: Types.Number, required: true, default: 10 },
				maxNaturalResources: { type: Types.Number, required: true, default: 50 }
			},
			infrastructureCostMultipliers: {
				warpGate: { type: Types.Number, required: true, default: 50 },
				economy: { type: Types.Number, required: true, default: 2.5 },
				industry: { type: Types.Number, required: true, default: 5 },
				science: { type: Types.Number, required: true, default: 20 },
				carrier: { type: Types.Number, required: true, default: 10 }
			},
			infrastructureExpenseMultipliers: {
				cheap: { type: Types.Number, required: true, default: 1 },
				standard: { type: Types.Number, required: true, default: 2 },
				expensive: { type: Types.Number, required: true, default: 4 },
				veryExpensive: { type: Types.Number, required: true, default: 8 },
				crazyExpensive: { type: Types.Number, required: true, default: 16 }
			},
			specialistsExpenseMultipliers: {
				standard: { type: Types.Number, required: true, default: 1 },
				expensive: { type: Types.Number, required: true, default: 2 },
				veryExpensive: { type: Types.Number, required: true, default: 4 },
				crazyExpensive: { type: Types.Number, required: true, default: 8 }
			},
			captureRewardMultiplier: { type: Types.Number, required: true, default: 10 },
			homeStarDefenderBonusMultiplier: { type: Types.Number, required: true, default: 1 }
		},
		diplomacy: {
			upkeepExpenseMultipliers: {
				none: { type: Types.Number, required: true, default: 0 },
				cheap: { type: Types.Number, required: true, default: 0.05 },
				standard: { type: Types.Number, required: true, default: 0.10 },
				expensive: { type: Types.Number, required: true, default: 0.15 },
        		crazyExpensive: { type: Types.Number, required: true, default: 0.25 }
			}
		},
		player: {
			rankRewardMultiplier: { type: Types.Number, required: true, default: 1 },
			bankingCycleRewardMultiplier: { type: Types.Number, required: true, default: 75 }
		},
		specialists: {
			monthlyBanAmount: { type: Types.Number, required: true, default: 3 }
		}
	},
	quitters: [{ type: Types.ObjectId, required: false }],
	afkers: [{ type: Types.ObjectId, required: false }],
	spectators: [{ type: Types.ObjectId, required: false }]
});

schema.index({'state.endDate': 1}, {unique: false});

export default schema;
