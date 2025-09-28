import {createGameRoutes, type Statistics, type GameSettingsSpec} from "@solaris-common";
import {doGet, doPost, type ResponseResult} from "./index";
import { type Axios } from "axios";

const routes = createGameRoutes<string>();

export const getGameStatistics = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<Statistics>> => {
  return doGet(axios)(routes.getStatistics, { gameId, playerId }, {}, { withCredentials: true });
}

export const createGame = (axios: Axios) => async (settings: GameSettingsSpec): Promise<ResponseResult<{ gameId: string }>> => {
  return doPost(axios)(routes.create, {}, {}, settings, { withCredentials: true });
}
