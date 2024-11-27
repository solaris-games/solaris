export const CarrierWaypointActionTypes = ['nothing', 'collectAll', 'dropAll', 'collect', 'drop', 'collectAllBut', 'dropAllBut', 'dropPercentage', 'collectPercentage', 'garrison'] as const;

export type CarrierWaypointActionType = typeof CarrierWaypointActionTypes[number];

export interface CarrierWaypointBase<ID> {
    source: ID;
    destination: ID;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;
};

export interface CarrierWaypoint<ID> extends CarrierWaypointBase<ID> {
    _id: ID;
    ticks?: number;
    ticksEta?: number;
};
