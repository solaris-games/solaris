import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    gameId: { type: Types.ObjectId, required: true },
    playerId: { type: Types.ObjectId, required: false, default: null },
    tick: { type: Types.Number, required: true },
    type: { type: Types.String, required: true },
    data: { type: Types.Mixed, required: true },
    read: { type: Types.Boolean, required: false, default: false }
});

schema.index({gameId: 1, tick: 1}, {unique: false});
schema.index({gameId: 1, playerId: 1}, {unique: false});

export default schema;
