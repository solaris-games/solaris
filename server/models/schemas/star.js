const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    ownedByPlayerId: { type: Types.ObjectId, required: false, default: null },
    name: { type: Types.String, required: true },
    naturalResources: { type: Types.Number, required: true },
    garrison: { type: Types.Number, required: true, default: 0 }, // TODO: garrison could be a computed field or instead returned to the client floored.
    garrisonActual: { type: Types.Number, required: true, default: 0 },
    specialistId: { type: Types.Number, required: false, default: null },
    warpGate: { type: Types.Boolean, required: true, default: false },
    ignoreBulkUpgrade: { type: Types.Boolean, required: false, default: false },
    infrastructure: {
        economy: { type: Types.Number, required: true, default: 0 },
        industry: { type: Types.Number, required: true, default: 0 },
        science: { type: Types.Number, required: true, default: 0 }
    },
    location: {
        x: { type: Types.Number, required: true, default: 0 },
        y: { type: Types.Number, required: true, default: 0 }
    }
});

module.exports = schema;
