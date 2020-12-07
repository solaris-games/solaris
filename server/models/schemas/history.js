const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true, index: true },
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
                weapons: { type: Types.Number, required: true, default: 0 },
                banking: { type: Types.Number, required: true, default: 0 },
                manufacturing: { type: Types.Number, required: true, default: 0 },
                hyperspace: { type: Types.Number, required: true, default: 0 },
                scanning: { type: Types.Number, required: true, default: 0 },
                experimentation: { type: Types.Number, required: true, default: 0 },
                terraforming: { type: Types.Number, required: true, default: 0 }
            }
        }
    ]
});

module.exports = schema;
