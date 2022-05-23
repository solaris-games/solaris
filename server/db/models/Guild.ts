const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/guild';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('guild', schema);

export default model;
