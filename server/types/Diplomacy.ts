import { DBObjectId } from "./DBObjectId";

export type DiplomaticState = 'allies' | 'enemies';

export interface DiplomaticStatus {
    playerIdFrom: DBObjectId;
    playerIdTo: DBObjectId;
    statusFrom: DiplomaticState;
    statusTo: DiplomaticState;
    actualStatus: DiplomaticState;
};
