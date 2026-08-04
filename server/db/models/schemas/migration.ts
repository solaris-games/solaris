import mongoose from "mongoose";
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    _id: { type: Types.ObjectId, required: true },
    name: { type: Types.String, required: true, unique: true },
    appliedAt: { type: Types.Date, required: true, default: () => new Date() },
});

export default schema;
