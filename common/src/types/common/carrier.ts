import { Location } from "./location";
import { CarrierWaypoint } from "./carrierWaypoint";
import { MapObject } from "./map";
import { Specialist } from "./specialist";
import { PlayerTechnologyLevels } from "./player";

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
