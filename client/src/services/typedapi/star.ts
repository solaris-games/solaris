import { doPut, type ResponseResult} from "@/services/typedapi/index";
import { type Axios } from "axios";
import {
  createStarRoutes,
  type BulkUpgradeReport,
  type BulkUpgradeReq,
  type CarrierBuildReport,
  type InfrastructureType,
  type InfrastructureUpgradeReport,
  type PlayerScheduledActions,
  type ShipTransferReport,
  type WarpgateBuildReport,
  type ScheduleBulkUpgradeReq
} from "@solaris-common";

type PRR<A> = Promise<ResponseResult<A>>;

const routes = createStarRoutes<string>();

export const upgradeEconomy = (axios: Axios) => async (gameId: string, starId: string): PRR<InfrastructureUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeEconomy, { gameId }, {}, { starId }, { withCredentials: true});
};

export const upgradeIndustry = (axios: Axios) => async (gameId: string, starId: string): PRR<InfrastructureUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeIndustry, { gameId }, {}, { starId }, { withCredentials: true});
};

export const upgradeScience = (axios: Axios) => async (gameId: string, starId: string): PRR<InfrastructureUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeScience, { gameId }, {}, { starId }, { withCredentials: true});
};

export const upgradeBulk = (axios: Axios) => async (gameId: string, bulkUprade: BulkUpgradeReq): PRR<BulkUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeBulk, { gameId }, {}, bulkUprade, { withCredentials: true});
};

export const upgradeBulkCheck = (axios: Axios) => async (gameId: string, bulkUprade: BulkUpgradeReq): PRR<BulkUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeBulkCheck, { gameId }, {}, bulkUprade, { withCredentials: true});
};

export const scheduleBulk = (axios: Axios) => async (gameId: string, bulkUprade: ScheduleBulkUpgradeReq): PRR<PlayerScheduledActions<string>> => {
  return doPut(axios)(routes.scheduleBulk, { gameId }, {}, bulkUprade, { withCredentials: true});
};

export const toggleScheduledBulk = (axios: Axios) => async (gameId: string, actionId: string): PRR<PlayerScheduledActions<string>> => {
  return doPut(axios)(routes.toggleScheduledBulk, { gameId }, {}, { actionId }, { withCredentials: true});
};

export const trashBulk = (axios: Axios) => async (gameId: string, actionId: string): PRR<null> => {
  return doPut(axios)(routes.trashBulk, { gameId }, {}, { actionId }, { withCredentials: true});
};

export const buildWarpGate = (axios: Axios) => async (gameId: string, starId: string): PRR<WarpgateBuildReport<string>> => {
  return doPut(axios)(routes.buildWarpGate, { gameId }, {}, { starId }, { withCredentials: true});
};

export const destroyWarpGate = (axios: Axios) => async (gameId: string, starId: string): PRR<null> => {
  return doPut(axios)(routes.destroyWarpGate, { gameId }, {}, { starId }, { withCredentials: true});
};

export const buildCarrier = (axios: Axios) => async (gameId: string, starId: string, ships: number): PRR<CarrierBuildReport<string>> => {
  return doPut(axios)(routes.buildCarrier, { gameId }, {}, { starId, ships }, { withCredentials: true});
};

export const garrisonAllShips = (axios: Axios) => async (gameId: string, starId: string): PRR<ShipTransferReport<string>> => {
  return doPut(axios)(routes.garrisonAllShips, { gameId, starId }, {}, {}, { withCredentials: true});
};

export const distributeAllShips = (axios: Axios) => async (gameId: string, starId: string): PRR<ShipTransferReport<string>> => {
  return doPut(axios)(routes.distributeAllShips, { gameId, starId }, {}, {}, { withCredentials: true});
};

export const abandon = (axios: Axios) => async (gameId: string, starId: string): PRR<null> => {
  return doPut(axios)(routes.abandon, { gameId }, {}, { starId }, { withCredentials: true});
};

export const toggleBulkIgnore = (axios: Axios) => async (gameId: string, starId: string, infrastructureType: InfrastructureType) => {
  return doPut(axios)(routes.toggleBulkIgnore, { gameId }, {}, { starId, infrastructureType }, { withCredentials: true});
};

export const toggleBulkIgnoreAll = (axios: Axios) => async (gameId: string, starId: string, ignoreStatus: boolean) => {
  return doPut(axios)(routes.toggleBulkIgnoreAll, { gameId }, {}, { starId, ignoreStatus }, { withCredentials: true});
};
