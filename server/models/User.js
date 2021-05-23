const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/user');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('user', schema);

module.exports = model;
