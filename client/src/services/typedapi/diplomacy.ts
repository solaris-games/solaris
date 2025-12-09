import { type Axios } from "axios";
import {createDiplomacyRoutes, type DiplomaticStatus} from "@solaris-common";
import {doGet, doPut, type ResponseResult} from "@/services/typedapi/index";

const routes = createDiplomacyRoutes<string>();

export const listDiplomacy = (axios: Axios) => async (gameId: string): Promise<ResponseResult<DiplomaticStatus<string>[]>> => {
  return doGet(axios)(routes.listDiplomacy, { gameId }, {}, { withCredentials: true });
}

export const detailDiplomacy = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<DiplomaticStatus<string>>> => {
  return doGet(axios)(routes.detailDiplomacy, { gameId, toPlayer: playerId }, {}, { withCredentials: true });
}

export const ally = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<DiplomaticStatus<string>>> => {
  return doPut(axios)(routes.ally, { gameId, playerId }, {}, {}, { withCredentials: true });
}

export const enemy = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<DiplomaticStatus<string>>> => {
  return doPut(axios)(routes.enemy, { gameId, playerId }, {}, {}, { withCredentials: true });
}

export const neutral = (axios: Axios) => async (gameId: string, playerId: string): Promise<ResponseResult<DiplomaticStatus<string>>> => {
  return doPut(axios)(routes.neutral, { gameId, playerId }, {}, {}, { withCredentials: true });
}
