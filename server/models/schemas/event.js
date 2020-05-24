const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true, index: true },
    playerId: { type: Types.ObjectId, required: false },
    tick: { type: Types.Number, required: true },
    type: { type: Types.String, required: true },
    data: { type: Types.Mixed, required: true }
});

module.exports = schema;
