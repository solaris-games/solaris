import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true },
    tick: { type: Types.Number, required: true },
    productionTick: { type: Types.Number, required: true },
    players: [
        {
            userId: { type: Types.ObjectId, required: false, default: null },
            playerId: { type: Types.ObjectId, required: true },
            statistics: {
                totalStars: { type: Types.Number, required: true, default: 0 },
                totalHomeStars: { type: Types.Number, required: true, default: 0 },
                totalEconomy: { type: Types.Number, required: true, default: 0 },
                totalIndustry: { type: Types.Number, required: true, default: 0 },
                totalScience: { type: Types.Number, required: true, default: 0 },
                totalShips: { type: Types.Number, required: true, default: 0 },
                totalCarriers: { type: Types.Number, required: true, default: 0 },
                totalSpecialists: { type: Types.Number, required: true, default: 0 },
                totalStarSpecialists: { type: Types.Number, required: true, default: 0 },
                totalCarrierSpecialists: { type: Types.Number, required: true, default: 0 },
                newShips: { type: Types.Number, required: true, default: 0 },
                warpgates: { type: Types.Number, required: true, default: 0 }
            },
            alias: { type: Types.String, required: true },
            avatar: { type: Types.String, required: false, default: null },
            researchingNow: { type: Types.String, required: true },
            researchingNext: { type: Types.String, required: true },
            credits: { type: Types.Number, required: true },
            creditsSpecialists: { type: Types.Number, required: true },
            isOpenSlot: { type: Types.Boolean, required: false, default: false },
            defeated: { type: Types.Boolean, required: true },
            defeatedDate: { type: Types.Date, required: false, default: null },
            afk: { type: Types.Boolean, required: true },
            ready: { type: Types.Boolean, required: false, default: false },
            readyToQuit: { type: Types.Boolean, required: false, default: false },
            research: {
                scanning: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                hyperspace: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                terraforming: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                experimentation: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                weapons: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                banking: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                manufacturing: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                },
                specialists: {
                    level: { type: Types.Number, required: true, default: 1  },
                    progress: { type: Types.Number, required: true, default: 0  },
                }
            }
        }
    ],
    stars: [
        {
            starId: { type: Types.ObjectId, required: true },
            ownedByPlayerId: { type: Types.ObjectId, required: false, default: null},
            naturalResources: {
                economy: { type: Types.Number, required: true },
                industry: { type: Types.Number, required: true },
                science: { type: Types.Number, required: true }
            },
            ships: { type: Types.Number, required: true },
            shipsActual: { type: Types.Number, required: true },
            specialistId: { type: Types.Number, required: false, default: null },
            homeStar: { type: Types.Boolean, required: false, default: false },
            warpGate: { type: Types.Boolean, required: true },
            ignoreBulkUpgrade: {
                economy: { type: Types.Boolean, required: false, default: false },
                industry: { type: Types.Boolean, required: false, default: false },
                science: { type: Types.Boolean, required: false, default: false }
            },
            infrastructure: {
                economy: { type: Types.Number, required: true },
                industry: { type: Types.Number, required: true },
                science: { type: Types.Number, required: true }
            },
            location: {
                x: { type: Types.Number, required: true },
                y: { type: Types.Number, required: true }
            },
            wormHoleToStarId: { type: Types.ObjectId, required: false, default: null },
        }
    ],
    carriers: [
        {
            carrierId: { type: Types.ObjectId, required: true },
            ownedByPlayerId: { type: Types.ObjectId, required: true },
            name: { type: Types.String, required: true },
            orbiting: { type: Types.ObjectId, required: false, default: null },
            ships: { type: Types.Number, required: true },
            specialistId: { type: Types.Number, required: false, default: null },
            isGift: { type: Types.Boolean, required: true },
            location: {
                x: { type: Types.Number, required: true },
                y: { type: Types.Number, required: true }
            },
            waypoints: [
                {
                    source: { type: Types.ObjectId, required: true },
                    destination: { type: Types.ObjectId, required: true }
                }
            ]
        }
    ]
});

schema.index({gameId: 1, tick: 1}, {unique: true});

export default schema;
