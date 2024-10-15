import { DBObjectId } from "./DBObjectId";

export const CarrierWaypointActionTypes = ['nothing', 'collectAll', 'dropAll', 'collect', 'drop', 'collectAllBut', 'dropAllBut', 'dropPercentage', 'collectPercentage', 'garrison'] as const;

export type CarrierWaypointActionType = typeof CarrierWaypointActionTypes[number];

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
