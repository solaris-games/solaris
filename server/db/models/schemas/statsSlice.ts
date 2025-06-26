import StatsSchema from "./stats";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    userId: { type: Types.ObjectId, required: true },
    gameId: { type: Types.ObjectId, required: false },
    processed: { type: Types.Boolean, required: true, default: false },
    stats: StatsSchema,
});

schema.index({gameId: 1, userId: 1}, {unique: false});

export default schema;
