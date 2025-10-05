import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/payment';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('payment', schema);

export default model;
