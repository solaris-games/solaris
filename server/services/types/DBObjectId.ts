import mongoose from "mongoose";

export interface DBObjectId extends mongoose.Types.ObjectId {
}

export const objectId = (): DBObjectId => new mongoose.Types.ObjectId() as any;

export const objectIdFromString = (s: string): DBObjectId => new mongoose.Types.ObjectId(s) as any;