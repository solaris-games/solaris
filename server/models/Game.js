const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/game');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('game', schema);

module.exports = model;
