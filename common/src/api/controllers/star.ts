import { PutRoute } from "."
import type { InfrastructureUpgradeReport, BulkUpgradeReport } from '../types/common/infrastructureUpgrade';
import type { InfrastructureType } from '../types/common/star';
import type { PlayerScheduledActions } from '../types/common/player';
import type { Carrier } from '../types/common/carrier';

export type StarUpgradeReq<ID> = {
    starId: ID,
};

export type BuildCarrierReq<ID> = StarUpgradeReq<ID> & {
    ships: number,
};

export type BulkUpgradeReq = {
    upgradeStrategy: string;
    infrastructure: InfrastructureType;
    amount: number;
};

export type ScheduleBulkUpgradeReq = {
    infrastructureType: InfrastructureType;
    buyType: string;
    amount: number;
    repeat: boolean;
    tick: number;
};

export type WarpgateBuildReport<ID> = {
    starId: ID,
    cost: number,
};

export type CarrierBuildReport<ID> = {
    carrier: Carrier<ID>,
    starShips: number,
};

export type ShipTransferReport<ID> = {
    star: {
        _id: ID,
        ships: number,
    },
    carriers: {
        _id: ID,
        ships: number,
    }[],
};

export type ToggleBulkIgnoreReq<ID> = {
    starId: ID,
    infrastructureType: InfrastructureType,
};

export type ToggleBulkIgnoreAllReq<ID> = {
    starId: ID,
    ignoreStatus: boolean,
};

export const createStarRoutes = <ID>() => ({
    upgradeEconomy: new PutRoute<{ gameId: ID }, {}, StarUpgradeReq<ID>, InfrastructureUpgradeReport<ID>>("/api/game/:gameId/star/upgrade/economy"),
    upgradeIndustry: new PutRoute<{ gameId: ID }, {}, StarUpgradeReq<ID>, InfrastructureUpgradeReport<ID>>("/api/game/:gameId/star/upgrade/industry"),
    upgradeScience: new PutRoute<{ gameId: ID }, {}, StarUpgradeReq<ID>, InfrastructureUpgradeReport<ID>>("/api/game/:gameId/star/upgrade/science"),
    upgradeBulk: new PutRoute<{ gameId: ID }, {}, BulkUpgradeReq, BulkUpgradeReport<ID>>("/api/game/:gameId/star/upgrade/bulk"),
    upgradeBulkCheck: new PutRoute<{ gameId: ID }, {}, BulkUpgradeReq, BulkUpgradeReport<ID>>('/api/game/:gameId/star/upgrade/bulkCheck'),
    scheduleBulk: new PutRoute<{ gameId: ID }, {}, ScheduleBulkUpgradeReq, PlayerScheduledActions<ID>>('/api/game/:gameId/star/upgrade/scheduleBulk'),
    toggleScheduledBulk: new PutRoute<{ gameId: ID }, {}, { actionId: ID }, PlayerScheduledActions<ID>>('/api/game/:gameId/star/upgrade/toggleBulkRepeat'),
    trashBulk: new PutRoute<{ gameId: ID }, {}, { actionId: ID }, null>('/api/game/:gameId/star/upgrade/trashBulk'),
    buildWarpGate: new PutRoute<{ gameId: ID }, {}, StarUpgradeReq<ID>, WarpgateBuildReport<ID>>('/api/game/:gameId/star/build/warpgate'),
    destroyWarpGate: new PutRoute<{ gameId: ID }, {}, StarUpgradeReq<ID>, null>('/api/game/:gameId/star/destroy/warpgate'),
    buildCarrier: new PutRoute<{ gameId: ID }, {}, BuildCarrierReq<ID>, CarrierBuildReport<ID>>('/api/game/:gameId/star/build/carrier'),
    garrisonAllShips: new PutRoute<{ gameId: ID, starId: ID }, {}, {}, ShipTransferReport<ID>>('/api/game/:gameId/star/:starId/transferall'),
    distributeAllShips: new PutRoute<{ gameId: ID, starId: ID }, {}, {}, ShipTransferReport<ID>>('/api/game/:gameId/star/:starId/distributeall'),
    abandon: new PutRoute<{ gameId: ID }, {}, { starId: ID }, null>('/api/game/:gameId/star/abandon'),
    toggleBulkIgnore: new PutRoute<{ gameId: ID }, {}, ToggleBulkIgnoreReq<ID>, null>('/api/game/:gameId/star/toggleignorebulkupgrade'),
    toggleBulkIgnoreAll: new PutRoute<{ gameId: ID }, {}, ToggleBulkIgnoreAllReq<ID>, null>('/api/game/:gameId/star/toggleignorebulkupgradeall'),
});
