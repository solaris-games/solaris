import { Schema } from "mongoose";

const Types = Schema.Types;
const schema = new Schema({
    sessionId: { type: Types.String, required: true },
    userId: { type: Types.ObjectId, required: true },
    username: { type: Types.String, required: true },
    roles: {
        administrator: { type: Types.Boolean, default: false },
        contributor: { type: Types.Boolean, default: false },
        developer: { type: Types.Boolean, default: false },
        communityManager: { type: Types.Boolean, default: false },
        gameMaster: { type: Types.Boolean, default: false },
    },
    isImpersonating: { type: Types.Boolean, required: true, default: false },
    originalUserId: { type: Types.ObjectId, required: false, default: null },
    expires: { type: Types.Date, required: true },
    lastModified: { type: Types.Date, required: true },
});

schema.index(
    {
        sessionId: 1,
    },
    {
        unique: true,
    },
);

schema.index({
    userId: 1,
});

schema.index(
    {
        expires: 1,
    },
    { expireAfterSeconds: 0 },
);

export default schema;
