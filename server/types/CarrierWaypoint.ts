import { ObjectId } from "mongoose";

export type CarrierWaypointActionType = 'nothing'|'collectAll'|'dropAll'|'collect'|'drop'|'collectAllBut'|'dropAllBut'|'dropPercentage'|'collectPercentage'|'garrison';

export interface CarrierWaypoint {
    _id: ObjectId;
    source: ObjectId;
    destination: ObjectId;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;
};
