const mongoose = require('mongoose');

const schema = require('./schemas/user');

const model = mongoose.model('user', schema);

module.exports = model;
