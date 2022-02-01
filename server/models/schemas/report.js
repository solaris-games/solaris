const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true },
    reportedPlayerId: { type: Types.ObjectId, required: true },
    reportedUserId: { type: Types.ObjectId, required: true },
    reportedPlayerAlias: { type: Types.String, required: true },
    reportedByPlayerId: { type: Types.ObjectId, required: true },
    reportedByUserId: { type: Types.ObjectId, required: true },
    reportedByPlayerAlias: { type: Types.String, required: true },
    reasons: {
        abuse: { type: Types.Boolean, required: true },
        spamming: { type: Types.Boolean, required: true },
        multiboxing: { type: Types.Boolean, required: true },
        inappropriateAlias: { type: Types.Boolean, required: true }
    },
    actioned: { type: Types.Boolean, required: false, default: false }
});

module.exports = schema;
