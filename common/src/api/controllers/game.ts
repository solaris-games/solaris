import {DeleteRoute, GetRoute, PatchRoute, PostRoute, PutRoute, SimpleGetRoute} from "./index";
import type {Statistics} from "../../types/common/stats";
import { type Flux } from "../../types/common/flux";
import type {GameConstants, GameGalaxy, GameSettings, GameSettingsGalaxyBase, GameSettingsGeneral, GameSettingsGeneralBase, GameSettingsInvariable,
    GameSettingsSpecialGalaxyBase,
    GameState,
    GameUserNotification,
} from "../../types/common/game";
import { type Tutorial } from "../../types/common/tutorial";
import { type PlayerResearch } from "../../types/common/player";
import { type PlayerStatistics } from "../../types/common/leaderboard";
import { type UserRoles } from "../../types/common/user";

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

export type GameStateDetail<ID> = {
    _id: ID,
    state: GameInfoState<ID>,
}

export type GameInfoDetail<ID> = GameStateDetail<ID> & {
    settings: GameSettings<ID>,
    constants: GameConstants,
}

export type GameGalaxyDetail<ID> = GameInfoDetail<ID> & {
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

export type UserActiveListGame<ID> = ListGame<ID> & {
    userNotifications: GameUserNotification,
};

export type GameListSummary<ID> = {
    official: ListGame<ID>[],
    user: ListGame<ID>[],
    inProgress: ListGame<ID>[],
    completed: ListGame<ID>[],
}

export type IntelPlayer<ID> = {
    playerId: ID,
    statistics: PlayerStatistics,
    research: PlayerResearch,
}

export type Intel<ID> = {
    gameId: ID,
    tick: number,
    players: IntelPlayer<ID>[],
}

export type GameJoinGameRequest<ID> = {
    playerId?: ID,
    alias: string,
    avatar: number,
    password: string | undefined,
};

export type InGameUser<ID> = {
    _id: ID,
    achievements: {
        level: number,
        rank: number,
        renown: number,
        victories: number,
        eloRating: number,
    },
    roles: UserRoles,
}

export const createGameRoutes = <ID>() => ({
    getDefaultSettings: new SimpleGetRoute<GameSettingsSpec>("/api/game/defaultSettings"),
    getCurrentFlux: new GetRoute<{}, {}, Flux | null>("/api/game/flux"),
    create: new PostRoute<{}, {}, GameSettingsSpec, { gameId: ID }>("/api/game/"),
    createTutorial: new PostRoute<{ tutorialKey?: string }, {}, {}, { gameId: ID }>("/api/game/tutorial/:tutorialKey?"),
    listTutorials: new SimpleGetRoute<Tutorial[]>("/api/game/tutorial/list"),
    detailInfo: new GetRoute<{ gameId: ID }, {}, GameInfoDetail<ID>>("/api/game/:gameId/info"),
    detailState: new GetRoute<{ gameId: ID }, {}, GameStateDetail<ID>>("/api/game/:gameId/state"),
    detailGalaxy: new GetRoute<{ gameId: ID }, { tick?: number }, GameGalaxyDetail<ID>>("/api/game/:gameId/galaxy"),
    listSummary: new GetRoute<{}, {}, GameListSummary<ID>>("/api/game/list/summary"),
    listOfficial: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/official"),
    listCustom: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/custom"),
    listInProgress: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/inprogress"),
    listRecentlyCompleted: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/completed"),
    listMyCompleted: new GetRoute<{}, {}, UserActiveListGame<ID>[]>("/api/game/list/completed/user"),
    listActive: new GetRoute<{}, {}, UserActiveListGame<ID>[]>("/api/game/list/active"),
    listMyOpen: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/open"),
    listSpectating: new GetRoute<{}, {}, ListGame<ID>[]>("/api/game/list/spectating"),
    getIntel: new GetRoute<{ gameId: ID }, {}, Intel<ID>[]>("/api/game/:gameId/intel"),
    join: new PutRoute<{ gameId: ID }, {}, GameJoinGameRequest<ID>, {}>("/api/game/:gameId/join"),
    quit: new PutRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/quit"), 
    concedeDefeat: new PutRoute<{ gameId: ID }, {}, { openSlot: boolean }, {}>("/api/game/:gameId/concedeDefeat"),
    ready: new PutRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/ready"), 
    readyToCycle: new PutRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/readytocycle"), 
    notReady:  new PutRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/notready"), 
    readyToQuit:  new PutRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/readyToQuit"),    
    notReadyToQuit:  new PutRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/notReadyToQuit"), 
    getNotes: new GetRoute<{ gameId: ID }, {}, { notes: string | undefined }>("/api/game/:gameId/notes"),
    writeNotes: new PutRoute<{ gameId: ID }, {}, { notes: string }, {}>("/api/game/:gameId/notes"),
    pause: new PutRoute<{ gameId: ID }, {}, { pause: boolean }, {}>("/api/game/:gameId/pause"),
    forceStart: new PostRoute<{ gameId: ID }, { withOpenSlots: boolean }, {}, {}>("/api/game/:gameId/forcestart"),
    fastForward: new PostRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/fastforward"),
    kick: new PostRoute<{ gameId: ID}, {}, { playerId: ID }, {}>("/api/game/:gameId/kick"),
    getPlayerUser: new GetRoute<{ gameId: ID, playerId: ID }, {}, InGameUser<ID> | null>("/api/game/:gameId/player/:playerId"),
    touch: new PatchRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/player/touch"),
    getStatistics: new GetRoute<{ gameId: ID, playerId: ID }, {}, Statistics>("/api/game/:gameId/statistics/:playerId"),
    delete: new DeleteRoute<{ gameId: ID }, {}, {}>("/api/game/:gameId"),
});
