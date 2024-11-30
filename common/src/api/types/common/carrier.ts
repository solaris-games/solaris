import type { Location } from "./location";
import type { CarrierWaypoint } from "./carrierWaypoint";
import type { MapObject } from "./map";
import type { Specialist } from "./specialist";
import type { PlayerTechnologyLevels } from "./player";

export interface Carrier<ID> extends MapObject<ID> {
    orbiting: ID | null;
    waypointsLooped: boolean;
    name: string;
    ships: number | null;
    specialistId: number | null;
    specialistExpireTick: number | null;
    specialist: Specialist | null;
    isGift: boolean;
    waypoints: CarrierWaypoint<ID>[];
    ticksEta?: number | null;
    ticksEtaTotal?: number | null;
    locationNext: Location | null;
    distanceToDestination?: number;
    effectiveTechs?: PlayerTechnologyLevels;
};

export interface CarrierPosition<ID> {
    carrier: Carrier<ID>;
    source: ID;
    destination: ID;
    locationCurrent: Location;
    locationNext: Location;
    distanceToSourceCurrent: number;
    distanceToDestinationCurrent: number;
    distanceToSourceNext: number;
    distanceToDestinationNext: number;
};
