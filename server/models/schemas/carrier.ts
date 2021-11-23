const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const waypointSchema = require('./waypoint');

const schema = new Schema({
    ownedByPlayerId: { type: Types.ObjectId, required: true },
    orbiting: { type: Types.ObjectId, required: false },
    waypointsLooped: { type: Types.Boolean, required: true, default: false },
    name: { type: Types.String, required: true },
    ships: { type: Types.Number, required: true },
    specialistId: { type: Types.Number, required: false, default: null },
    isGift: { type: Types.Boolean, required: false, default: false },
    location: {
        x: { type: Types.Number, required: true },
        y: { type: Types.Number, required: true }
    },
    waypoints: [waypointSchema]
});

export default schema;
