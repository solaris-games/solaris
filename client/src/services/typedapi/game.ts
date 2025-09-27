import {createGameRoutes, type Statistics, type GameSettingsSpec, type Flux, type GameDetailInfo, type Tutorial, type GameInfoState } from "@solaris-common";
import {doGet, doPost, type ResponseResult} from "./index";
import { type Axios } from "axios";

const routes = createGameRoutes<string>();

export const getGameStatistics = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<Statistics>> => {
  return doGet(axios)(routes.getStatistics, { gameId, playerId }, {}, { withCredentials: true });
}

export const createGame = (axios: Axios) => async (settings: GameSettingsSpec): Promise<ResponseResult<{ gameId: string }>> => {
  return doPost(axios)(routes.create, {}, {}, settings, { withCredentials: true });
}

export const getCurrentFlux = (axios: Axios) => async (): Promise<ResponseResult<Flux | null>> => {
  return doGet(axios)(routes.getCurrentFlux, {}, {});
}

export const getDefaultSettings = (axios: Axios) => async (): Promise<ResponseResult<GameSettingsSpec>> => {
  return doGet(axios)(routes.getDefaultSettings, {}, {});
}

export const createTutorial = (axios: Axios) => async (tutorialKey?: string): Promise<ResponseResult<{ gameId: string }>> => {
  return doPost(axios)(routes.createTutorial, { tutorialKey }, {}, { withCredentials: true });
}

export const listTutorials = (axios: Axios) => async (): Promise<ResponseResult<Tutorial>> => {
  return doGet(axios)(routes.listTutorials, {}, {}, { withCredentials: true });
}

export const detailInfo = (axios: Axios) => async (gameId: string): Promise<ResponseResult<GameDetailInfo<string>>> => {
  return doGet(axios)(routes.detailInfo, { gameId }, {}, { withCredentials: true });
}

export const detailState = (axios: Axios) => async (gameId: string): Promise<ResponseResult<GameInfoState<string>>> => {
  return doGet(axios)(routes.detailState, { gameId }, {}, { withCredentials: true });
}
