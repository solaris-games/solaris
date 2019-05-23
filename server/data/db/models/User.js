const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = require('./schemas/user');

const model = mongoose.model('user', schema);

module.exports = model;
