const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/event');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('gameEvent', schema);

model.syncIndexes();

module.exports = model;
