import {DBObjectId} from "./DBObjectId";
import {Star} from "./Star";
import {Player} from "./Player";
import {Carrier} from "./Carrier";

export type InitialGameState = {
    _id: DBObjectId;
    gameId: DBObjectId;
    galaxy: {
        stars: Star[],
        players: Player[],
        carriers: Carrier[],
    },
};
