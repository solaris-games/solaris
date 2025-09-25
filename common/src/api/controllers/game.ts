import {GetRoute, PostRoute, SimpleGetRoute} from "./index";
import type {Statistics} from "../types/common/stats";
import { type Flux } from "../types/common/flux";
import type {GameConstants, GameSettings, GameSettingsGalaxyBase, GameSettingsGeneralBase, GameSettingsInvariable,
    GameSettingsSpecialGalaxyBase,
    GameState
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

export type GameInfoState<ID> = Omit<GameState<ID>, 'leaderboard' | 'teamLeaderboard'>

export type GameDetailInfo<ID> = {
    settings: GameSettings<ID>,
    state: GameInfoState<ID>,
    constants: GameConstants,
}

export const createGameRoutes = <ID>() => ({
    getDefaultSettings: new SimpleGetRoute<GameSettingsSpec>("/api/game/defaultSettings"),
    getStatistics: new GetRoute<{ gameId: ID, playerId: ID }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
    getCurrentFlux: new GetRoute<{}, {}, Flux | null>("/api/game/flux"),
    create: new PostRoute<{}, {}, GameSettingsSpec, { gameId: ID }>("/api/game/"),
    createTutorial: new PostRoute<{ tutorialKey?: string }, {}, {}, { gameId: ID }>("/api/game/tutorial/:tutorialKey?"),
    detailInfo: new GetRoute<{ gameId: string }, {}, GameDetailInfo<ID>>("/api/game/:gameId/info"),
});