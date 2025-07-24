import {GetRoute} from "./index";
import type {Statistics} from "../types/common/stats";
import { type GameSettings } from "../types/common/game";
import { type Flux } from "../types/common/flux";

export const createGameRoutes = <ID>() => ({
    getDefaultSettings: new GetRoute<{}, {}, GameSettings<ID>>("/api/game/defaultSettings"),
    getCurrentFlux: new GetRoute<{}, {}, Flux | null>("/api/game/flux"),
    getStatistics: new GetRoute<{ gameId: string, playerId: string }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
});