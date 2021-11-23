const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/payment';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('payment', schema);

export default model;
