const mongoose = require('mongoose');

const schema = require('./schemas/history');

const model = mongoose.model('gameHistory', schema);

module.exports = model;
