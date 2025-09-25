import {GetRoute, PostRoute, SimpleGetRoute} from "./index";
import type {Statistics} from "../types/common/stats";
import { type Flux } from "../types/common/flux";
import type {GameSettingsGalaxyBase, GameSettingsGeneralBase, GameSettingsInvariable,
    GameSettingsSpecialGalaxyBase
} from "../types/common/game";

export type GameSettingsGalaxyUnparsed = GameSettingsGalaxyBase & {
    customGalaxy?: string,
    customSeed?: string;
}

export type GameSettingsSpec = GameSettingsInvariable & {
    general: GameSettingsGeneralBase,
    galaxy: GameSettingsGalaxyUnparsed,
    specialGalaxy: GameSettingsSpecialGalaxyBase,
}

export const createGameRoutes = <ID>() => ({
    getDefaultSettings: new SimpleGetRoute<GameSettingsSpec>("/api/game/defaultSettings"),
    getStatistics: new GetRoute<{ gameId: ID, playerId: ID }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
    getCurrentFlux: new GetRoute<{}, {}, Flux | null>("/api/game/flux"),
    create: new PostRoute<{}, {}, GameSettingsSpec, { gameId: ID }>("/api/game/"),
});