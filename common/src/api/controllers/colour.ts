import {PutRoute, SimpleGetRoute} from "./index";
import type {PlayerColour} from "../../types/common/player";

export type ColourOverrideRequest = {
    playerId: string;
    colour: {
        alias: string;
        value: string;
    }
}

export const createColourRoutes = () => ({
    listColours: new SimpleGetRoute<PlayerColour[]>("/api/colour/list"),
    addColour: new PutRoute<{ gameId: string }, {}, ColourOverrideRequest, {}>("/api/game/:gameId/colour/override")
});