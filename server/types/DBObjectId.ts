import { ObjectId } from "mongoose";

export interface DBObjectId extends ObjectId {
    equals(id: DBObjectId): boolean;
    getTimestamp(): Date;
};
