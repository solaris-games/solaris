import {GetRoute, PostRoute} from "./index";
import type {Statistics} from "../types/common/stats";
import type {GameSettings, GameSettingsGalaxy, GameSettingsGeneralSpec} from "../types/common/game";

type GameSettingsGalaxySpec = GameSettingsGalaxy & {
    customJSON?: string,
}

type GameSettingsSpec = GameSettings<string> & {
    general: GameSettingsGeneralSpec,
    galaxy: GameSettingsGalaxySpec,
}

export const createGameRoutes = <ID>() => ({
    getStatistics: new GetRoute<{ gameId: string, playerId: string }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
    create: new PostRoute<{}, {}, GameSettingsSpec, null>("/api/game/"),
});