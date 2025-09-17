import PlayerSchema from "./player";
import StarSchema from "./star";
import CarrierSchema from "./carrier";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true },
    galaxy: {
        players: [PlayerSchema],
        stars: [StarSchema],
        carriers: [CarrierSchema],
    },
});

schema.index({ gameId: 1 }, { unique: true });

export default schema;
