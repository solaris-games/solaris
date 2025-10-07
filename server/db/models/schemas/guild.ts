import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    name: { type: Types.String, required: true, minlength: 4, maxlength: 31 },
    tag: { type: Types.String, required: true, minlength: 2, maxlength: 4 },
    leader: { type: Types.ObjectId, required: true },
    officers: [{ type: Types.ObjectId }],
    members: [{ type: Types.ObjectId }],
    invitees: [{ type: Types.ObjectId }],
    applicants: [{ type: Types.ObjectId }]
});

export default schema;
