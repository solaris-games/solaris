const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const waypointSchema = require('./waypoint');

const schema = new Schema({
    ownedByPlayerId: { type: Types.ObjectId, required: true },
    orbiting: { type: Types.ObjectId, required: true },
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
