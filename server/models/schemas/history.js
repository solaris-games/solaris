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
                totalStars: { type: Types.Number, required: true },
                totalEconomy: { type: Types.Number, required: true },
                totalIndustry: { type: Types.Number, required: true },
                totalScience: { type: Types.Number, required: true },
                totalShips: { type: Types.Number, required: true },
                totalCarriers: { type: Types.Number, required: true },
                weapons: { type: Types.Number, required: true },
                banking: { type: Types.Number, required: true },
                manufacturing: { type: Types.Number, required: true },
                hyperspace: { type: Types.Number, required: true },
                scanning: { type: Types.Number, required: true },
                experimentation: { type: Types.Number, required: true },
                terraforming: { type: Types.Number, required: true }
            }
        }
    ]
});

module.exports = schema;
