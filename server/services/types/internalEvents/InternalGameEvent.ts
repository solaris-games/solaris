import { DBObjectId } from "../DBObjectId";

export interface InternalGameEvent {
    gameId: DBObjectId;
    gameTick: number;
    playerId?: DBObjectId;
};
