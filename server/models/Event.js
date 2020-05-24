const mongoose = require('mongoose');

const schema = require('./schemas/event');

const model = mongoose.model('gameEvent', schema);

module.exports = model;
