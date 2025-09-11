import {GetRoute, PostRoute} from "./index";
import type {Statistics} from "../types/common/stats";
import type {GameSettings, GameSettingsGalaxy, GameSettingsGeneralBase} from "../types/common/game";

type GameSettingsGalaxySpec = GameSettingsGalaxy & {
    customGalaxy?: string,
}

type GameSettingsSpec = GameSettings<string> & {
    general: GameSettingsGeneralBase,
    galaxy: GameSettingsGalaxySpec,
}

export const createGameRoutes = <ID>() => ({
    getStatistics: new GetRoute<{ gameId: string, playerId: string }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
    create: new PostRoute<{}, {}, GameSettingsSpec, null>("/api/game/"),
});