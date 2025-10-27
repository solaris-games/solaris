import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    fromPlayerId: { type: Types.ObjectId, required: false },
    fromPlayerAlias: { type: Types.String, required: true },
    message: { type: Types.String, required: true },
    sentDate: { type: Types.Date, required: true },
    sentTick: { type: Types.Number, required: false, default: null },
    pinned: { type: Types.Boolean, required: false, default: false },
    readBy: [{ type: Types.ObjectId, required: true }]
});

export default schema;
