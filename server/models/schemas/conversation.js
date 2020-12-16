const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const conversationMessageSchema = require('./conversationMessage');

const schema = new Schema({
    participants: [{ type: Types.ObjectId, required: true }],
    createdBy: { type: Types.ObjectId, required: false },
    name: { type: Types.String, required: true },
    messages: [conversationMessageSchema]
});

module.exports = schema;
