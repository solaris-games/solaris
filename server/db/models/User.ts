const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/user';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('user', schema);

export default model;
