import { DBObjectId } from "../../types/DBObjectId";

export interface BaseEvent {
    gameId: DBObjectId;
    gameTick: number;
    playerId?: DBObjectId;
};
