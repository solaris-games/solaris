const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/guild');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('guild', schema);

module.exports = model;
