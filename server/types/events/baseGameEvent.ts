import { DBObjectId } from "../DBObjectId";

export interface BaseGameEvent {
    gameId: DBObjectId;
    gameTick: number;
    playerId?: DBObjectId;
};
