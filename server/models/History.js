const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/history');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('gameHistory', schema);

model.syncIndexes();

module.exports = model;
