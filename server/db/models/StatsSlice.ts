const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/statsSlice';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('statsSlice', schema);

export default model;
