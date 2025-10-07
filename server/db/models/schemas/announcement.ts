import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;


const schema = new Schema({
    _id: { type: Types.ObjectId, required: true },
    date: { type: Types.Date, required: true, default: () => new Date() },
    title: { type: Types.String, required: true },
    content: { type: Types.String, required: true },
});

export default schema;