import {GetRoute} from "./index";
import type {Statistics} from "../types/common/stats";

export const createGameRoutes = <ID>() => ({
    getStatistics: new GetRoute<{ gameId: string, playerId: string }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
});