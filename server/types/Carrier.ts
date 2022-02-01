import { ObjectId } from "mongoose";
import { Location } from "./Location";
import { CarrierWaypoint } from "./CarrierWaypoint";

export interface Carrier {
    _id?: ObjectId;
    ownedByPlayerId: ObjectId;
    orbiting: ObjectId | null;
    waypointsLooped: boolean;
    name: string;
    ships: number;
    specialistId: number | null;
    isGift: boolean;
    location: Location,
    waypoints: CarrierWaypoint[]
};
