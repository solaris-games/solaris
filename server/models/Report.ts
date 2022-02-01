const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/report';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('report', schema);

export default model;
