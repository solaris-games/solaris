const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/payment');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('payment', schema);

module.exports = model;
