const mongoose = require('mongoose');

const schema = require('./schemas/game');

const model = mongoose.model('game', schema);

module.exports = model;
