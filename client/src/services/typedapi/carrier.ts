import {
  type CarrierWaypointBase,
  type CombatResultShips,
  createCarrierRoutes,
  type SaveWaypointsResp
} from "@solaris-common";
import { type Axios } from "axios";
import {doDelete, doPost, doPatch, doPut, type ResponseResult} from "@/services/typedapi/index";

const routes = createCarrierRoutes<string>();

export const saveWaypoints = (axios: Axios) => async (gameId: string, carrierId: string, waypoints: CarrierWaypointBase<string>[], looped: boolean): Promise<ResponseResult<SaveWaypointsResp<string>>> => {
  return doPut(axios)(routes.saveWaypoints, { gameId, carrierId }, {}, { waypoints, looped }, { withCredentials: true });
}

export const loop = (axios: Axios) => async (gameId: string, carrierId: string, loop: boolean): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.loop, { gameId, carrierId }, {}, { loop }, { withCredentials: true });
}

export const transferShips = (axios: Axios) => async (gameId: string, carrierId: string, carrierShips: number, starId: string, starShips: number): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.transferShips, { gameId, carrierId }, {}, { carrierShips, starId, starShips }, { withCredentials: true });
}

export const gift = (axios: Axios) => async (gameId: string, carrierId: string): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.gift, { gameId, carrierId }, {}, {}, { withCredentials: true });
}

export const rename = (axios: Axios) => async (gameId: string, carrierId: string, name: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.rename, { gameId, carrierId }, {}, { name }, { withCredentials: true });
}

export const scuttle = (axios: Axios) => async (gameId: string, carrierId: string): Promise<ResponseResult<{}>> => {
  return doDelete(axios)(routes.scuttle, { gameId, carrierId }, {}, { withCredentials: true });
}

export const calculateCombat = (axios: Axios) => async (gameId: string, defender: { ships: number; weaponsLevel: number }, attacker: { ships: number; weaponsLevel: number }, isTurnBased: boolean): Promise<ResponseResult<CombatResultShips>> => {
  return doPost(axios)(routes.calculateCombat, { gameId }, {}, { defender, attacker, isTurnBased }, { withCredentials: true });
}
