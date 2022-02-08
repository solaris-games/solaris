import { ObjectId } from "mongoose";

export interface GameEvent {
    _id: ObjectId;
    gameId: ObjectId;
    playerId: ObjectId | null;
    tick: number;
    type: string;
    data: any;
    read: boolean;
};
