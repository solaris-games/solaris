import { ObjectId } from "mongoose";

export interface DBObjectId extends ObjectId {
    equals(id: DBObjectId | string | null): boolean;
    getTimestamp(): Date;
};
