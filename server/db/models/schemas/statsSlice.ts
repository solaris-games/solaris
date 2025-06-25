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

export default schema;
