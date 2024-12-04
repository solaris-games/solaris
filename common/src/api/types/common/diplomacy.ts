export type DiplomaticState = 'enemies' | 'neutral' | 'allies';

export interface DiplomaticStatus<ID> {
    playerIdFrom: ID;
    playerIdTo: ID;
    playerFromAlias: string;
    playerToAlias: string;
    statusFrom: DiplomaticState;
    statusTo: DiplomaticState;
    actualStatus: DiplomaticState;
};

export interface DiplomacyEvent<ID> {
    playerId: ID;
    type: string;
    data: DiplomaticStatus<ID>;
    sentDate: Date;
    sentTick: number;
};
