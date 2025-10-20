import WaypointSchema from "./waypoint";

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true },
    galaxy: {
        players: [{
            playerId: { type: Types.ObjectId, required: true },
            researchingNow: { type: Types.String, required: true },
            researchingNext: { type: Types.String, required: true },
            credits: { type: Types.Number, required: true },
            creditsSpecialists: { type: Types.Number, required: true },
            research: {
                scanning: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                hyperspace: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                terraforming: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                experimentation: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                weapons: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                banking: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                manufacturing: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                },
                specialists: {
                    level: {type: Types.Number, required: true, default: 1},
                    progress: {type: Types.Number, required: true, default: 0},
                }
            },
            diplomacy: [
                {
                    playerId: {type: Types.ObjectId, required: true},
                    status: {type: Types.String, required: true}
                }
            ],
        }],
        stars: [{
            starId: { type: Types.ObjectId, required: true },
            name: { type: Types.String, required: true },
            naturalResources: {
                economy: { type: Types.Number, required: true },
                industry: { type: Types.Number, required: true },
                science: { type: Types.Number, required: true }
            },
            infrastructure: {
                economy: { type: Types.Number, required: true, default: 0 },
                industry: { type: Types.Number, required: true, default: 0 },
                science: { type: Types.Number, required: true, default: 0 }
            },
            ships: { type: Types.Number, required: true, default: 0 },
            ownedByPlayerId: { type: Types.ObjectId, required: false, default: null },
            warpGate: { type: Types.Boolean, required: true, default: false },
            isNebula: { type: Types.Boolean, required: true, default: false },
            isAsteroidField: { type: Types.Boolean, required: true, default: false },
            isBinaryStar: { type: Types.Boolean, required: true, default: false },
            isBlackHole: { type: Types.Boolean, required: true, default: false },
            isPulsar: { type: Types.Boolean, required: true, default: false },
            wormHoleToStarId: { type: Types.ObjectId, required: false, default: null },
            specialistId: { type: Types.Number, required: false, default: null },
        }],
        carriers: [{
            carrierId: { type: Types.ObjectId, required: true },
            orbiting: { type: Types.ObjectId, required: false, default: null },
            name: { type: Types.String, required: true },
            ownedByPlayerId: { type: Types.ObjectId, required: true },
            ships: { type: Types.Number, required: true, default: 0 },
            specialistId: { type: Types.Number, required: false, default: null },
            specialistExpireTick: { type: Types.Number, required: false, default: null },
            isGift: { type: Types.Boolean, required: false, default: false },
            location: {
                x: { type: Types.Number, required: true },
                y: { type: Types.Number, required: true }
            },
            waypoints: [WaypointSchema],
        }],
    },
});

schema.index({ gameId: 1 }, { unique: true });

export default schema;
