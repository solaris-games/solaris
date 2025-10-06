import {createSpecialistRoutes, type MonthlyBans, type Specialist} from "@solaris-common";
import type { Axios } from "axios";
import { doGet, type ResponseResult } from ".";

const routes = createSpecialistRoutes<string>();

export const listBans = (axios: Axios) => async (): Promise<ResponseResult<MonthlyBans>> => {
  return doGet(axios)(routes.listBans, {}, {}, {});
}

export const listCarrier = (axios: Axios) => async (): Promise<ResponseResult<Specialist[]>> => {
  return doGet(axios)(routes.listCarrier, {}, {}, {});
}

export const listStar = (axios: Axios) => async (): Promise<ResponseResult<Specialist[]>> => {
  return doGet(axios)(routes.listStar, {}, {}, {});
}

export const listCarrierForGame = (axios: Axios) => async (gameId: string): Promise<ResponseResult<Specialist[]>> => {
  return doGet(axios)(routes.listCarrierForGame, { gameId }, {}, {});
}

export const listStarForGame = (axios: Axios) => async (gameId: string): Promise<ResponseResult<Specialist[]>> => {
  return doGet(axios)(routes.listStarForGame, { gameId }, {}, {});
}

export const hireStar = (axios: Axios) => async (gameId: string, starId: string, specialistId: number): Promise<ResponseResult<{}>> => {
  return doGet(axios)(routes.hireStar, { gameId, starId, specialistId }, {}, {});
}

export const hireCarrier = (axios: Axios) => async (gameId: string, carrierId: string, specialistId: number): Promise<ResponseResult<{}>> => {
  return doGet(axios)(routes.hireCarrier, { gameId, carrierId, specialistId }, {}, {});
}
