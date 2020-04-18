const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const waypointSchema = require('./waypoint');

const schema = new Schema({
    ownedByPlayerId: { type: Types.ObjectId, required: true },
    orbiting: { type: Types.ObjectId, required: false },
    inTransitFrom: { type: Types.ObjectId, required: false, default: null },
    inTransitTo: { type: Types.ObjectId, required: false, default: null },
    waypointsLooped: { type: Types.Boolean, required: true, default: false },
    name: { type: Types.String, required: true },
    ships: { type: Types.Number, required: true },
    speed: { type: Types.Number, required: true, default: 1 },
    location: {
        x: { type: Types.Number, required: true },
        y: { type: Types.Number, required: true }
    },
    waypoints: [waypointSchema]
});

module.exports = schema;
