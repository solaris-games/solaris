import { ObjectId } from "mongoose";

export type DiplomaticState = 'allies' | 'enemies';

export interface DiplomaticStatus {
    playerIdFrom: ObjectId;
    playerIdTo: ObjectId;
    statusFrom: DiplomaticState;
    statusTo: DiplomaticState;
    actualStatus: DiplomaticState;
};
