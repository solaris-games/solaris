import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    name: { type: Types.String, required: true },
    players: [{ type: Types.ObjectId, required: true }],
});

export default schema;