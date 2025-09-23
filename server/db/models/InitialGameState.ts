const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/initialGameState';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('initialGameState', schema);

export default model;
