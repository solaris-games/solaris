import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from './schemas/game';

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model('game', schema);

export default model;
