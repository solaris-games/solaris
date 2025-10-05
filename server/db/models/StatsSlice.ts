import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/statsSlice';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('statsSlice', schema);

export default model;
