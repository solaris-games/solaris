import { ObjectId } from "mongoose";

export interface Guild {
    _id?: ObjectId;
    name: string;
    tag: string;
    leader: ObjectId;
    officers: ObjectId[];
    members: ObjectId[];
    invitees: ObjectId[];
    applicants: ObjectId[];
};
