const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults');

import schema from './schemas/announcement';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('announcement', schema);

export default model;
