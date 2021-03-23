const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true },
    tick: { type: Types.Number, required: true },
    players: [
        {
            playerId: { type: Types.ObjectId, required: true },
            statistics: {
                totalStars: { type: Types.Number, required: true, default: 0 },
                totalEconomy: { type: Types.Number, required: true, default: 0 },
                totalIndustry: { type: Types.Number, required: true, default: 0 },
                totalScience: { type: Types.Number, required: true, default: 0 },
                totalShips: { type: Types.Number, required: true, default: 0 },
                totalCarriers: { type: Types.Number, required: true, default: 0 },
                totalSpecialists: { type: Types.Number, required: true, default: 0 },
                totalStarSpecialists: { type: Types.Number, required: true, default: 0 },
                totalCarrierSpecialists: { type: Types.Number, required: true, default: 0 },
                newShips: { type: Types.Number, required: true, default: 0 },
                weapons: { type: Types.Number, required: true, default: 0 },
                banking: { type: Types.Number, required: true, default: 0 },
                manufacturing: { type: Types.Number, required: true, default: 0 },
                hyperspace: { type: Types.Number, required: true, default: 0 },
                scanning: { type: Types.Number, required: true, default: 0 },
                experimentation: { type: Types.Number, required: true, default: 0 },
                terraforming: { type: Types.Number, required: true, default: 0 },
                warpgates: { type: Types.Number, required: true, default: 0 }
            }
        }
    ],
    stars: [
        {
            starId: { type: Types.ObjectId, required: true },
            ownedByPlayerId: { type: Types.ObjectId, required: false, default: null},
            naturalResources: { type: Types.Number, required: true },
            garrison: { type: Types.Number, required: true },
            specialistId: { type: Types.Number, required: false, default: null },
            warpGate: { type: Types.Boolean, required: true },
            infrastructure: {
                economy: { type: Types.Number, required: true },
                industry: { type: Types.Number, required: true },
                science: { type: Types.Number, required: true }
            }
        }
    ],
    carriers: [
        {
            carrierId: { type: Types.ObjectId, required: true },
            ownedByPlayerId: { type: Types.ObjectId, required: true },
            orbiting: { type: Types.ObjectId, required: false, default: null },
            inTransitFrom: { type: Types.ObjectId, required: false, default: null },
            inTransitTo: { type: Types.ObjectId, required: false },
            ships: { type: Types.Number, required: true },
            specialistId: { type: Types.Number, required: false, default: null },
            isGift: { type: Types.Boolean, required: true },
            location: {
                x: { type: Types.Number, required: true },
                y: { type: Types.Number, required: true }
            }
        }
    ]
});

schema.index({gameId: 1, tick: 1}, {unique: true});

module.exports = schema;
