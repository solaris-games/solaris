import mongoose from "mongoose";
import schema from './schemas/event';

import mongooseLeanDefaults from "mongoose-lean-defaults";

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('gameEvent', schema);

export default model;
