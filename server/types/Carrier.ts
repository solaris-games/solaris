import { Location } from "./Location";
import { CarrierWaypoint } from "./CarrierWaypoint";
import { MapObject } from "./Map";
import { DBObjectId } from "./DBObjectId";
import { Specialist } from "./Specialist";

export interface Carrier extends MapObject {
    orbiting: DBObjectId | null;
    waypointsLooped: boolean;
    name: string;
    ships: number | null;
    specialistId: number | null;
    specialist?: Specialist;
    isGift: boolean;
    waypoints: CarrierWaypoint[];
    ticksEta?: number | null;
    ticksEtaTotal?: number | null;
    locationNext: Location;
    distanceToDestination?: number;

    toObject(): Carrier;
};

export interface CarrierPosition {
    carrier: Carrier;
    source: DBObjectId;
    destination: DBObjectId;
    locationCurrent: Location;
    locationNext: Location;
    distanceToSourceCurrent: number;
    distanceToDestinationCurrent: number;
    distanceToSourceNext: number;
    distanceToDestinationNext: number;
};
