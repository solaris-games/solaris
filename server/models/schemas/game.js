const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const playerSchema = require('./player');
const starSchema = require('./star');
const carrierSchema = require('./carrier');
const historySchema = require('./history');

const schema = new Schema({
    settings: {
        general: {
            createdByUserId: { type: Types.ObjectId, required: false },
            name: { type: Types.String, required: true },
            description: { type: Types.String, required: false },
			password: { type: Types.String, required: false },
			starVictoryPercentage: { type: Types.Number, required: true, enum: [25, 33, 50, 75, 90, 100], default: 50 },
			playerLimit: { type: Types.Number, required: true, default: 8, min: 2, max: 16 },
			playerType: { type: Types.String, required: true, enum: ['all', 'premium'], default: 'all' }
        },
        specialGalaxy: {
			buildCarriers: { type: Types.String, required: true, enum: ['cheap', 'standard', 'expensive'], default: 'standard' },
			buildWarpgates: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive'], default: 'cheap' },
			randomGates: { type: Types.String, required: true, enum: ['none', 'rare', 'common'], default: 'none' },
			darkGalaxy: { type: Types.String, required: true, enum: ['disabled', 'enabled', 'start'], default: 'start' },
        },
        galaxy: {
			starsPerPlayer: { type: Types.Number, required: true, enum: [8, 16, 24, 32], default: 24 },
			productionTicks: { type: Types.Number, required: true, enum: [16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], default: 24 }
        },
        player: {
			startingStars: { type: Types.Number, required: true, min: 1, max: 10, default: 6 },
			startingCredits: { type: Types.Number, required: true, enum: [50, 100, 500, 1000, 1500, 2000, 2500, 3000], default: 500 },
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
			tradeCost: { type: Types.Number, required: true, enum: [5, 15, 25, 50], default: 15 },
			tradeScanning: { type: Types.String, required: true, enum: ['all', 'scanned'], default: 'all' }
        },
        technology: {
			startingTechnologyLevel: {
				terraforming: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				experimentation: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				scanning: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				hyperspace: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				manufacturing: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				banking: { type: Types.Number, required: true, min: 1, max: 16, default: 1 },
				weapons: { type: Types.Number, required: true, min: 1, max: 16, default: 1 }
			},
			researchCosts: {
				terraforming: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				experimentation: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				scanning: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				hyperspace: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				manufacturing: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				banking: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' },
				weapons: { type: Types.String, required: true, enum: ['none', 'cheap', 'standard', 'expensive', 'veryExpensive', 'crazyExpensive'], default: 'standard' }
			}
		},
		gameTime: {
			speed: { type: Types.Number, required: true, enum: [6, 12, 24, 48], default: 24 }
		}
    },
    galaxy: {
        players: [playerSchema],
		stars: [starSchema],
		carriers: [carrierSchema],
        history: [historySchema]
    },
	state: {
		tick: { type: Types.Number, required: true, default: 0 },
		paused: { type: Types.Boolean, required: true, default: true },
		productionTick: { type: Types.Number, required: true, default: 0 },
		startDate: { type: Types.Date, required: false },
		endDate: { type: Types.Date, required: false },
		lastTickDate: { type: Types.Date, required: false },
		nextTickDate: { type: Types.Date, required: false },
		stars: { type: Types.Number, required: true },
		starsForVictory: { type: Types.Number, required: true }
	}
});

module.exports = schema;
