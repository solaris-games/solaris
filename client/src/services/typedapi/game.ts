import {createGameRoutes, type Statistics, type GameSettingsSpec, type Flux, type Tutorial, type UserActiveListGame, type GameListSummary, type ListGame, type Intel, type InGameUser, type GameInfoDetail, type GameStateDetail, type GameGalaxyDetail } from "@solaris-common";
import {doDelete, doGet, doPatch, doPost, doPut, type ResponseResult} from "./index";
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

export const listTutorials = (axios: Axios) => async (): Promise<ResponseResult<Tutorial[]>> => {
  return doGet(axios)(routes.listTutorials, {}, {}, { withCredentials: true });
}

export const detailInfo = (axios: Axios) => async (gameId: string): Promise<ResponseResult<GameInfoDetail<string>>> => {
  return doGet(axios)(routes.detailInfo, { gameId }, {}, { withCredentials: true });
}

export const detailState = (axios: Axios) => async (gameId: string): Promise<ResponseResult<GameStateDetail<string>>> => {
  return doGet(axios)(routes.detailState, { gameId }, {}, { withCredentials: true });
}

export const detailGalaxy = (axios: Axios) => async (gameId: string, tick?: number): Promise<ResponseResult<GameGalaxyDetail<string>>> => {
  return doGet(axios)(routes.detailGalaxy, { gameId }, { tick }, { withCredentials: true });
}

export const listSummary = (axios: Axios) => async (): Promise<ResponseResult<GameListSummary<string>>> => {
  return doGet(axios)(routes.listSummary, {}, {}, { withCredentials: true });
}

export const listOfficial = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>[]>> => {
  return doGet(axios)(routes.listOfficial, {}, {}, { withCredentials: true });
}

export const listCustom = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>[]>> => {
  return doGet(axios)(routes.listCustom, {}, {}, { withCredentials: true });
}

export const listInProgress = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>[]>> => {
  return doGet(axios)(routes.listInProgress, {}, {}, { withCredentials: true });
}

export const listRecentlyCompleted = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>[]>> => {
  return doGet(axios)(routes.listRecentlyCompleted, {}, {}, { withCredentials: true });
}

export const listMyCompleted = (axios: Axios) => async (): Promise<ResponseResult<UserActiveListGame<string>[]>> => {
  return doGet(axios)(routes.listMyCompleted, {}, {}, { withCredentials: true });
}

export const listActive = (axios: Axios) => async (): Promise<ResponseResult<UserActiveListGame<string>[]>> => {
  return doGet(axios)(routes.listActive, {}, {}, { withCredentials: true });
}

export const listMyOpen = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>[]>> => {
  return doGet(axios)(routes.listMyOpen, {}, {}, { withCredentials: true });
}

export const listSpectating = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>[]>> => {
  return doGet(axios)(routes.listSpectating, {}, {}, { withCredentials: true });
}

export const getIntel = (axios: Axios) => async (gameId: string): Promise<ResponseResult<Intel<string>>> => {
  return doGet(axios)(routes.getIntel, { gameId }, {}, { withCredentials: true });
}

export const join = (axios: Axios) => async (gameId: string, playerId: string, alias: string, avatar: number, password: string | undefined): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.join, { gameId }, {}, { playerId, alias, avatar, password }, { withCredentials: true });
}

export const quit = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.quit, { gameId }, {}, {}, { withCredentials: true });
}

export const concedeDefeat = (axios: Axios) => async (gameId: string, openSlot: boolean): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.concedeDefeat, { gameId }, {}, { openSlot }, { withCredentials: true });
}

export const ready = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.ready, { gameId }, {}, {}, { withCredentials: true });
}

export const notReady = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.notReady, { gameId }, {}, {}, { withCredentials: true });
}

export const readyToCycle = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.readyToCycle, { gameId }, {}, {}, { withCredentials: true });
}

export const readyToQuit = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.readyToQuit, { gameId }, {}, {}, { withCredentials: true });
}

export const notReadyToQuit = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.notReadyToQuit, { gameId }, {}, {}, { withCredentials: true });
}

export const getNotes = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{ notes: string | undefined }>> => {
  return doGet(axios)(routes.getNotes, { gameId }, {}, { withCredentials: true });
}

export const writeNotes = (axios: Axios) => async (gameId: string, notes: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.writeNotes, { gameId }, {}, { notes }, { withCredentials: true });
}

export const pause = (axios: Axios) => async (gameId: string, pause: boolean): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.pause, { gameId }, {}, { pause }, { withCredentials: true });
}

export const forceStart = (axios: Axios) => async (gameId: string, withOpenSlots: boolean): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.forceStart, { gameId }, { withOpenSlots }, {}, { withCredentials: true });
}

export const fastForward = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.fastForward, { gameId }, {}, {}, { withCredentials: true });
}

export const kick = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.kick, { gameId }, {}, { playerId }, { withCredentials: true });
}

export const getPlayerUser = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<InGameUser<string> | null>> => {
  return doGet(axios)(routes.getPlayerUser, { gameId, playerId }, {}, { withCredentials: true });
}

export const touch = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.touch, { gameId }, {}, {}, { withCredentials: true });
}

export const deleteGame = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doDelete(axios)(routes.delete, { gameId }, {}, {}, { withCredentials: true });
}
