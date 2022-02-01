const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

import ConversationMessageSchema from './conversationMessage';

const schema = new Schema({
    participants: [{ type: Types.ObjectId, required: true }],
    createdBy: { type: Types.ObjectId, required: false },
    name: { type: Types.String, required: true },
    messages: [ConversationMessageSchema]
});

export default schema;
