import { DBObjectId } from "./DBObjectId";

export type DiplomaticState = 'enemies' | 'neutral' | 'allies';

export interface DiplomaticStatus {
    playerIdFrom: DBObjectId;
    playerIdTo: DBObjectId;
    playerFromAlias: string;
    playerToAlias: string;
    statusFrom: DiplomaticState;
    statusTo: DiplomaticState;
    actualStatus: DiplomaticState;
};
