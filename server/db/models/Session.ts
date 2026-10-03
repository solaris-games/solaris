import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from "./schemas/session";

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model("usersession", schema);

export default model;
