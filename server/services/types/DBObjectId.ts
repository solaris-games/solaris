import mongoose, { ObjectId } from "mongoose";
import { ObjectId as MongoObjectId } from "mongodb"

export interface DBObjectId extends ObjectId {
    // equals(id: DBObjectId): boolean; -- Note: We never use this as we cannot ensure that anything that comes through the API layer via params are mongo object IDs unless we explicitly cast them.
    getTimestamp(): Date;
    toString(): string;
};

export const objectId = (id?: string | number | MongoObjectId | undefined): DBObjectId => new MongoObjectId(id) as unknown as DBObjectId;