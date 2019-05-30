const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = require('./schemas/game');

const model = mongoose.model('game', schema);

module.exports = model;
