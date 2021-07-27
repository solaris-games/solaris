const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const playerSchema = require('./player');
const starSchema = require('./star');
const carrierSchema = require('./carrier');
const conversationSchema = require('./conversation');

const schema = new Schema({
    settings: {
        general: {
            createdByUserId: { type: Types.ObjectId, required: false },
            name: { type: Types.String, required: true },
            description: { type: Types.String, required: false },
			type: { type: Types.String, required: true, enum: [
				'custom', 'standard_rt', 'standard_tb', 'standard_dark_rt', 'standard_dark_tb', '1v1_rt', '1v1_tb', 'new_player_rt', 'new_player_tb', '32_player_rt'
			], default: 'custom' },
			mode: { type: Types.String, required: true, enum: [
				'conquest', 'battleRoyale'
			], default: 'conquest' },
			featured: { type: Types.Boolean, required: false, default: false },
			password: { type: Types.String, required: false },
			passwordRequired: { type: Types.Boolean, required: false },
			starVictoryPercentage: { type: Types.Number, required: true, enum: [25, 33, 50, 66, 75, 90, 100], default: 50 },
			playerLimit: { type: Types.Number, required: true, default: 8, min: 2, max: 32 },
			playerType: { type: Types.String, required: true, enum: ['all', 'establishedPlayers'], default: 'all' },
			anonymity: { type: Types.String, required: true, enum: ['normal', 'extra'], default: 'normal' },
			playerOnlineStatus: { type: Types.String, required: true, enum: ['hidden', 'visible'], default: 'hidden' },
			timeMachine: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'disabled' },
			awardRankTo: { type: Types.String, required: false, enum: ['all', 'winner'], default: 'all' },
        },
        galaxy: {
			galaxyType: { type: Types.String, required: true, enum: ['circular', 'spiral', 'doughnut','circular-balanced', 'irregular'], default: 'circular' },
			starsPerPlayer: { type: Types.Number, required: true, enum: [5, 10, 20, 30, 50], default: 20 },
			productionTicks: { type: Types.Number, required: true, enum: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], default: 24 }
        },
        specialGalaxy: {
			carrierCost: { type: Types.String, required: true, enum: ['cheap', 'standard', 'expensive'], default: 'standard' },
			carrierUpkeepCost: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'none' },
			warpgateCost: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'standard' },
			specialistCost: { type: Types.String, required: true, enum: ['none', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
			specialistsCurrency: { type: Types.String, required: true, enum: ['credits', 'creditsSpecialists'], default: 'credits' },
			randomGates: { type: Types.String, required: true, enum: ['none', 'rare', 'common'], default: 'none' },
			darkGalaxy: { type: Types.String, required: true, enum: ['disabled', 'standard', 'extra', 'start'], default: 'start' },
			giftCarriers: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'enabled' },
			defenderBonus: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'enabled' },
			carrierToCarrierCombat: { type: Types.String, required: true, enum: ['disabled', 'enabled'], default: 'disabled' },
			resourceDistribution: { type: Types.String, required: true, enum: ['random','weightedCenter'], default: 'random' },
			playerDistribution: { type: Types.String, required: true, enum: ['circular','random'], default: 'circular' },
			carrierSpeed: { type: Types.Number, required: true, min: 1, max: 25, default: 5 },
        },
        player: {
			startingStars: { type: Types.Number, required: true, min: 1, max: 10, default: 6 },
			startingCredits: { type: Types.Number, required: true, enum: [25, 50, 100, 500, 1000, 1500, 2000, 2500, 3000], default: 500 },
			startingCreditsSpecialists: { type: Types.Number, required: true, enum: [0, 1, 3, 5, 10, 25, 50, 100], default: 5 },
			startingShips: { type: Types.Number, required: true, enum: [0, 10, 50, 100], default: 10 },
			startingInfrastructure: {
				economy: { type: Types.Number, required: true, enum: [0, 5, 10, 20, 30], default: 5 },
				industry: { type: Types.Number, required: true, enum: [0, 5, 10, 20, 30], default: 5 },
				science: { type: Types.Number, required: true, min: 0, max: 5, default: 1 }
			},
			developmentCost: {
				economy: { type: Types.String, required: true, enum: ['cheap', 'standard', 'expensive'], default: 'standard' },
				industry: { type: Types.String, required: true, enum: ['cheap', 'standard', 'expensive'], default: 'standard' },
				science: { type: Types.String, required: true, enum: ['cheap', 'standard', 'expensive'], default: 'standard' }
			},
			tradeCredits: { type: Types.Boolean, required: false, default: true },
			tradeCreditsSpecialists: { type: Types.Boolean, required: false, default: true },
			tradeCost: { type: Types.Number, required: true, enum: [0, 5, 15, 25, 50, 100], default: 15 }, // TODO: This could be renamed.
			tradeScanning: { type: Types.String, required: true, enum: ['all', 'scanned'], default: 'all' }
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
				specialists: { type: Types.Number, required: true, min: 1, max: 16, default: 1 }
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
			bankingReward: { type: Types.String, required: true, enum: ['standard', 'legacy'], default: 'standard' }
		},
		gameTime: {
			gameType: { type: Types.String, required: true, enum: ['realTime', 'turnBased'], default: 'realTime' },
			speed: { type: Types.Number, required: true, enum: [30, 60, 300, 600, 1800, 3600], default: 1800 }, // Time in seconds
			startDelay: { type: Types.Number, required: true, enum: [1, 5, 10, 30, 60, 120, 240], default: 30 },	// Time in minutes
			turnJumps: { type: Types.Number, required: true, enum: [1, 6, 8, 12, 24], default: 8 },
			maxTurnWait: { type: Types.Number, required: true, enum: [1, 5, 10, 30, 60, 360, 480, 600, 720, 1080, 1440, 2880], default: 1440 },	// Time in minutes
			missedTurnLimit: { type: Types.Number, required: true, enum: [1, 2, 3, 4, 5, 10, 30, 60], default: 3 }
		}
    },
    galaxy: {
        players: [playerSchema],
		stars: [starSchema],
		carriers: [carrierSchema]
	},
	conversations: [conversationSchema],
	state: {
		locked: { type: Types.Boolean, required: false, default: false },
		tick: { type: Types.Number, required: true, default: 0 },
		paused: { type: Types.Boolean, required: true, default: true },
		productionTick: { type: Types.Number, required: true, default: 0 },
		startDate: { type: Types.Date, required: false }, // Dates are in UTC
		endDate: { type: Types.Date, required: false },
		lastTickDate: { type: Types.Date, required: false },
		stars: { type: Types.Number, required: true },
		starsForVictory: { type: Types.Number, required: true },
		players: { type: Types.Number, required: true, default: 0 },
		winner: { type: Types.ObjectId, required: false }
	},
	constants: {
		distances: {
			lightYear: { type: Types.Number, required: true, default: 50 },
			minDistanceBetweenStars: { type: Types.Number, required: true, default: 50 },
			maxDistanceBetweenStars: { type: Types.Number, required: true, default: 500 },
			warpSpeedMultiplier: { type: Types.Number, required: true, default: 3 }
		},
		research: {
			progressMultiplier: { type: Types.Number, required: true, default: 50 }
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
			}
		}
	},
	quitters: [{ type: Types.ObjectId, required: false }],
	afkers: [{ type: Types.ObjectId, required: false }]
});

module.exports = schema;
