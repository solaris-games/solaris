const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

const schema = require('./schemas/report');

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('report', schema);

module.exports = model;
