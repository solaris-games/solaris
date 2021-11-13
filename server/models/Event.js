const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/event');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('gameEvent', schema);

module.exports = model;
