import {DeleteRoute, PatchRoute, PostRoute, PutRoute} from ".";
import { type CarrierWaypointBase } from "../types/common/carrierWaypoint";
import { type CombatResultShips } from "../types/common/combat";

export type CarrierSaveWaypointsRequest<ID> = {
    waypoints: CarrierWaypointBase<ID>[];
    looped: boolean;
};

export type SaveWaypointsResp<ID> = {
    waypoints: CarrierWaypointBase<ID>,
}

export type TransferShipsReq<ID> = {
    carrierShips: number;
    starShips: number;
    starId: ID;
}

export type CarrierCalculateCombatRequest = {
    defender: {
        ships: number,
        weaponsLevel: number,
    },
    attacker: {
        ships: number,
        weaponsLevel: number,
    },
    isTurnBased: boolean,
};

export const createCarrierRoutes = <ID>() => ({
    saveWaypoints: new PutRoute<{ gameId: ID, carrierId: ID }, {}, CarrierSaveWaypointsRequest<ID>, SaveWaypointsResp<ID>>('/api/game/:gameId/carrier/:carrierId/waypoints'),
    loop: new PutRoute<{ gameId: ID, carrierId: ID }, {}, { loop: boolean }, {}>('/api/game/:gameId/carrier/:carrierId/waypoints/loop'),
    transferShips: new PutRoute<{ gameId: ID, carrierId: ID }, {}, TransferShipsReq<ID>, {}>('/api/game/:gameId/carrier/:carrierId/transfer'),
    gift: new PutRoute<{ gameId: ID, carrierId: ID }, {}, {}, {}>('/api/game/:gameId/carrier/:carrierId/gift'),
    rename: new PatchRoute<{ gameId: ID, carrierId: ID }, {}, { name: string }, {}>('/api/game/:gameId/carrier/:carrierId/rename'),
    scuttle: new DeleteRoute<{ gameId: ID, carrierId: ID }, {}, {}>('/api/game/:gameId/carrier/:carrierId/scuttle'),
    calculateCombat: new PostRoute<{ gameId: ID }, {}, CarrierCalculateCombatRequest, CombatResultShips>('/api/game/:gameId/carrier/calculateCombat'),
});
