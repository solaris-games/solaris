import { DBObjectId } from "./DBObjectId";

export type DiplomaticState = 'enemies' | 'neutral' | 'allies';

export interface DiplomaticStatus {
    playerIdFrom: DBObjectId;
    playerIdTo: DBObjectId;
    statusFrom: DiplomaticState;
    statusTo: DiplomaticState;
    actualStatus: DiplomaticState;
};
