import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

import ConversationMessageSchema from './conversationMessage';

const schema = new Schema({
    participants: [{ type: Types.ObjectId, required: true }],
    createdBy: { type: Types.ObjectId, required: false, default: null },
    name: { type: Types.String, required: true },
    mutedBy: [{ type: Types.ObjectId, required: true }],
    messages: [ConversationMessageSchema]
});

export default schema;
