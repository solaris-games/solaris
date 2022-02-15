const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/history';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('gameHistory', schema);

export default model;
