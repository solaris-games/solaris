import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    badge: { type: Types.String, required: true },
    awardedBy: { type: Types.ObjectId, default: null },
    awardedByName: { type: Types.String, default: null },
    awardedInGame: { type: Types.ObjectId, default: null },
    awardedInGameName: { type: Types.String, default: null },
    playerAwarded: { type: Types.Boolean, default: false, required: true },
    time: { type: Types.Date, required: false, default: null },
});

export default schema;