import { PutRoute } from ".";
import { type CarrierWaypointBase } from "../types/common/carrierWaypoint";

export type CarrierSaveWaypointsRequest<ID> = {
    waypoints: CarrierWaypointBase<ID>[];
    looped: boolean;
};

type SaveWaypointsResp<ID> = {
    waypoints: CarrierWaypointBase<ID>,
}

export const createCarrierRoutes = <ID>() => ({
    saveWaypoints: new PutRoute<{ gameId: ID, carrierId: ID }, {}, CarrierSaveWaypointsRequest<ID>, SaveWaypointsResp<ID>>('/api/game/:gameId/carrier/:carrierId/waypoints'),
});
