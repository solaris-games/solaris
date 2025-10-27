import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/report';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('report', schema);

export default model;
