import {createSpectatorRoutes, type GameSpectator} from "@solaris-common";
import {doGet, doPut, doDelete, type ResponseResult} from "./index";
import { type Axios } from "axios";

const routes = createSpectatorRoutes<string>();

export const listSpectators = (axios: Axios) => async (gameId: string): Promise<ResponseResult<GameSpectator<string>[] | null>> => {
  return doGet(axios)(routes.listSpectators, { gameId }, {}, { withCredentials: true });
}

export const inviteSpectators = (axios: Axios) => async (gameId: string, usernames: string[]): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.inviteSpectators, { gameId }, {}, { usernames }, { withCredentials: true });
}

export const uninviteSpectator = (axios: Axios) => async (gameId: string, userId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.uninviteSpectator, { gameId }, {}, {}, { withCredentials: true });
}

export const clearSpectators = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{}>> => {
  return doDelete(axios)(routes.clearSpectators, { gameId }, {}, {}, { withCredentials: true });
}
