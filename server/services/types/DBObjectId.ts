import mongoose, { ObjectId } from "mongoose";

export interface DBObjectId extends mongoose.Types.ObjectId {
    // equals(id: DBObjectId): boolean; -- Note: We never use this as we cannot ensure that anything that comes through the API layer via params are mongo object IDs unless we explicitly cast them.
    getTimestamp(): Date;
    toString(): string;
};

export const objectId = (): DBObjectId => new mongoose.Types.ObjectId() as any;

export const objectIdFromString = (s: string): DBObjectId => new mongoose.Types.ObjectId(s) as any;