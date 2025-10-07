import StatsSchema from "./stats";

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    playerId: { type: Types.ObjectId, required: true },
    gameId: { type: Types.ObjectId, required: true },
    processed: { type: Types.Boolean, required: true, default: false },
    closed: { type: Types.Boolean, required: true, default: false },
    stats: StatsSchema,
});

schema.index({gameId: 1, playerId: 1}, {unique: true});

export default schema;
