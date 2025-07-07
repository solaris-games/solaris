import {createGameRoutes, type Statistics} from "@solaris-common";
import {doGet, type ResponseResult} from "./index";
import { type Axios } from "axios";

const routes = createGameRoutes<string>();

export const getGameStatistics = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<Statistics>> => {
  return doGet(axios)(routes.getStatistics, { gameId, playerId }, {}, { withCredentials: true });
}
