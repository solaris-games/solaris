import mongoose = require('mongoose');
import mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/game';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('game', schema);

export default model;
