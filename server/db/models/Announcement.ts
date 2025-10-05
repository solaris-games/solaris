import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/announcement';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('announcement', schema);

export default model;
