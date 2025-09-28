import {GetRoute, PostRoute, SimpleGetRoute} from "./index";
import type {Statistics} from "../types/common/stats";
import { type Flux } from "../types/common/flux";
import type {GameConstants, GameSettings, GameSettingsGalaxyBase, GameSettingsGeneral, GameSettingsGeneralBase, GameSettingsInvariable,
    GameSettingsSpecialGalaxyBase,
    GameState,
    GameType
} from "../types/common/game";
import { type Tutorial } from "../types/common/tutorial";

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

export type GameGalaxy<ID> = GameDetailInfo<ID> & {
    galaxy: GameGalaxy<ID>,
}

export type ListGameSettingsGeneral<ID> = Pick<GameSettingsGeneral<ID>, 'playerLimit' | 'type' | 'featured' | 'name' | 'playerType'>;

export type ListGame<ID> = {
    _id: ID,
    settings: {
        general: ListGameSettingsGeneral<ID>,
    },
    state: GameInfoState<ID>,
}

export type GameListSummary<ID> = {
    official: ListGame<ID>[],
    user: ListGame<ID>[],
    inProgress: ListGame<ID>[],
    completed: ListGame<ID>[],
}

export const createGameRoutes = <ID>() => ({
    getDefaultSettings: new SimpleGetRoute<GameSettingsSpec>("/api/game/defaultSettings"),
    getStatistics: new GetRoute<{ gameId: ID, playerId: ID }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
    getCurrentFlux: new GetRoute<{}, {}, Flux | null>("/api/game/flux"),
    create: new PostRoute<{}, {}, GameSettingsSpec, { gameId: ID }>("/api/game/"),
    createTutorial: new PostRoute<{ tutorialKey?: string }, {}, {}, { gameId: ID }>("/api/game/tutorial/:tutorialKey?"),
    listTutorials: new SimpleGetRoute<Tutorial[]>("/api/game/tutorial/list"),
    detailInfo: new GetRoute<{ gameId: ID }, {}, GameDetailInfo<ID>>("/api/game/:gameId/info"),
    detailState: new GetRoute<{ gameId: ID }, {}, GameInfoState<ID>>("/api/game/:gameId/state"),
    detailGalaxy: new GetRoute<{ gameId: ID }, {}, GameGalaxy<ID>>("/api/game/:gameId/galaxy"),
    listSummary: new GetRoute<{}, {}, GameListSummary<ID>>("/api/game/list/summary"),
    listOfficial: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/official"),
    listCustom: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/custom"),
    listInProgress: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/inprogress"),
    listRecentlyCompleted: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/completed"),
    listMyCompleted: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/completed/user"),
    listActive: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/active"),
    listMyOpen: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/open"),
    listSpectating: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/spectating"),
});