import { DBObjectId } from "./DBObjectId";

export type CarrierWaypointActionType = 'nothing'|'collectAll'|'dropAll'|'collect'|'drop'|'collectAllBut'|'dropAllBut'|'dropPercentage'|'collectPercentage'|'garrison';

export interface CarrierWaypointBase {
    source: DBObjectId;
    destination: DBObjectId;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;
};

export interface CarrierWaypoint extends CarrierWaypointBase {
    _id: DBObjectId;
    ticks?: number;
    ticksEta?: number;
};
