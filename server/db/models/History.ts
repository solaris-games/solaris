import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/history';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('gameHistory', schema);

export default model;
