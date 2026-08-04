import mongoose from "mongoose";
import mongooseLeanDefaults from "mongoose-lean-defaults";
import schema from "./schemas/migration";

schema.plugin(mongooseLeanDefaults);

const model = mongoose.model("migration", schema);

export default model;
