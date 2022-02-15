import { DBObjectId } from "./DBObjectId";

export interface GameEvent {
    _id: DBObjectId;
    gameId: DBObjectId;
    playerId: DBObjectId | null;
    tick: number;
    type: string;
    data: any;
    read: boolean;

    date?: Date;
};
