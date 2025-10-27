import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/initialGameState';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('initialGameState', schema);

export default model;
