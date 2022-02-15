import { DBObjectId } from "./DBObjectId";

export type CarrierWaypointActionType = 'nothing'|'collectAll'|'dropAll'|'collect'|'drop'|'collectAllBut'|'dropAllBut'|'dropPercentage'|'collectPercentage'|'garrison';

export interface CarrierWaypoint {
    _id: DBObjectId;
    source: DBObjectId;
    destination: DBObjectId;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;

    ticks?: number;
    ticksEta?: number;
};
