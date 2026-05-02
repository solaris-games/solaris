import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const achievementSchema = new Schema({
    icon: { type: Types.String, required: true, enum: ['victory'] },
    description: { type: Types.String, required: true }
}, { _id: false });

const schema = new Schema({
    name: { type: Types.String, required: true, minlength: 4, maxlength: 64 },
    tag: { type: Types.String, required: true, minlength: 2, maxlength: 4 },
    leader: { type: Types.ObjectId, required: true },
    officers: [{ type: Types.ObjectId }],
    members: [{ type: Types.ObjectId }],
    invitees: [{ type: Types.ObjectId }],
    applicants: [{ type: Types.ObjectId }],
    achievements: { type: [achievementSchema], default: [] }
});

export default schema;
