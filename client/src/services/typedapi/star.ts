import {doGet, doPost, doPut, doDelete, type ResponseResult} from "@/services/typedapi/index";
import { type Axios } from "axios";
import { createStarRoutes, type BulkUpgradeReport, type BulkUpgradeReq, type CarrierBuildReport, type InfrastructureType, type InfrastructureUpgradeReport, type PlayerScheduledActions, type ShipTransferReport, type WarpgateBuildReport } from "@solaris-common";

type PRR<A> = Promise<ResponseResult<A>>;

const routes = createStarRoutes<string>();

export const upgradeEconomy = (axios: Axios) => async (gameId: string, starId: string): PRR<InfrastructureUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeEconomy, { gameId }, {}, { starId });
};

export const upgradeIndustry = (axios: Axios) => async (gameId: string, starId: string): PRR<InfrastructureUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeIndustry, { gameId }, {}, { starId });
};

export const upgradeScience = (axios: Axios) => async (gameId: string, starId: string): PRR<InfrastructureUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeScience, { gameId }, {}, { starId });
};

export const upgradeBulk = (axios: Axios) => async (gameId: string, bulkUprade: BulkUpgradeReq): PRR<BulkUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeBulk, { gameId }, {}, bulkUprade);
};

export const upgradeBulkCheck = (axios: Axios) => async (gameId: string, bulkUprade: BulkUpgradeReq): PRR<BulkUpgradeReport<string>> => {
  return doPut(axios)(routes.upgradeBulkCheck, { gameId }, {}, bulkUprade);
};

export const scheduleBulk = (axios: Axios) => async (gameId: string, bulkUprade: BulkUpgradeReq): PRR<PlayerScheduledActions<string>> => {
  return doPut(axios)(routes.scheduleBulk, { gameId }, {}, bulkUprade);
};

export const toggleScheduledBulk = (axios: Axios) => async (gameId: string, actionId: string): PRR<PlayerScheduledActions<string>> => {
  return doPut(axios)(routes.toggleScheduledBulk, { gameId }, {}, { actionId });
};

export const trashBulk = (axios: Axios) => async (gameId: string, actionId: string): PRR<null> => {
  return doPut(axios)(routes.trashBulk, { gameId }, {}, { actionId });
};

export const buildWarpGate = (axios: Axios) => async (gameId: string, starId: string): PRR<WarpgateBuildReport<string>> => {
  return doPut(axios)(routes.buildWarpGate, { gameId }, {}, { starId });
};

export const destroyWarpGate = (axios: Axios) => async (gameId: string, starId: string): PRR<null> => {
  return doPut(axios)(routes.destroyWarpGate, { gameId }, {}, { starId });
};

export const buildCarrier = (axios: Axios) => async (gameId: string, starId: string, ships: number): PRR<CarrierBuildReport<string>> => {
  return doPut(axios)(routes.buildCarrier, { gameId }, {}, { starId, ships });
};

export const garrisonAllShips = (axios: Axios) => async (gameId: string, starId: string): PRR<ShipTransferReport<string>> => {
  return doPut(axios)(routes.garrisonAllShips, { gameId, starId }, {}, {});
};

export const distributeAllShips = (axios: Axios) => async (gameId: string, starId: string): PRR<ShipTransferReport<string>> => {
  return doPut(axios)(routes.distributeAllShips, { gameId, starId }, {}, {});
};

export const abandon = (axios: Axios) => async (gameId: string, starId: string): PRR<null> => {
  return doPut(axios)(routes.abandon, { gameId }, {}, { starId });
};

export const toggleBulkIgnore = (axios: Axios) => async (gameId: string, starId: string, infrastructureType: InfrastructureType) => {
  return doPut(axios)(routes.toggleBulkIgnore, { gameId }, {}, { starId, infrastructureType });
};

export const toggleBulkIgnoreAll = (axios: Axios) => async (gameId: string, starId: string, ignoreStatus: boolean) => {
  return doPut(axios)(routes.toggleBulkIgnoreAll, { gameId }, {}, { starId, ignoreStatus });
};
