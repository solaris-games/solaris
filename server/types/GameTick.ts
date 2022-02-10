import { Carrier } from "./Carrier";
import { CarrierWaypoint } from "./CarrierWaypoint";
import { Star } from "./Star";

export interface CarrierActionWaypoint {
    carrier: Carrier;
    star: Star;
    waypoint: CarrierWaypoint;
};
