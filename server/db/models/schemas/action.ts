import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    _id: { type: Types.ObjectId, required: true }, // Actions are required to have an ObjectId so that we can refer to them via their ID instead of an array index, which may be unreliable.
    infrastructureType: { type: Types.String, required: true },
    buyType: {  type: Types.String, required: true },
    amount: { type: Types.Number, required: true, default: 0, min: 0 },
    repeat: { type: Types.Boolean, required: true, default: false },
    tick: { type: Types.Number, required: true, default: 0, min: 0 }
});

export default schema;