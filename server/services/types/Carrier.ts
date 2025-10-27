import { Location } from "./Location";
import { CarrierWaypoint } from "solaris-common";
import { MapObject } from "./Map";
import { DBObjectId } from "./DBObjectId";
import { Specialist } from 'solaris-common';
import { PlayerTechnologyLevels } from "./Player";

export interface Carrier extends MapObject {
    orbiting: DBObjectId | null;
    waypointsLooped: boolean;
    name: string;
    ships: number | null;
    specialistId: number | null;
    specialistExpireTick: number | null;
    specialist: Specialist | null;
    isGift: boolean;
    waypoints: CarrierWaypoint<DBObjectId>[];
    ticksEta?: number | null;
    ticksEtaTotal?: number | null;
    locationNext: Location | null;
    distanceToDestination?: number;
    effectiveTechs?: PlayerTechnologyLevels;

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
