import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/guild';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('guild', schema);

export default model;
