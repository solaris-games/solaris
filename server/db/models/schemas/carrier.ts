import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

import WaypointSchema from './waypoint';

const schema = new Schema({
    ownedByPlayerId: { type: Types.ObjectId, required: true },
    orbiting: { type: Types.ObjectId, required: false, default: null },
    waypointsLooped: { type: Types.Boolean, required: true, default: false },
    name: { type: Types.String, required: true },
    ships: { type: Types.Number, required: true },
    specialistId: { type: Types.Number, required: false, default: null },
    specialistExpireTick: { type: Types.Number, required: false, default: null },
    isGift: { type: Types.Boolean, required: false, default: false },
    location: {
        x: { type: Types.Number, required: true },
        y: { type: Types.Number, required: true }
    },
    waypoints: [WaypointSchema]
});

export default schema;
