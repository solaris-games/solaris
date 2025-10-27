import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";

import schema from './schemas/user';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('user', schema);

export default model;
