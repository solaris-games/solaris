const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    badge: { type: Types.String, required: true },
    awardedBy: { type: Types.ObjectId, default: null },
    awardedInGame: { type: Types.ObjectId, default: null },
});

export default schema;