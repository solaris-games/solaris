import { Carrier } from "./Carrier";
import { CarrierWaypoint } from "solaris-common";
import { Star } from "./Star";
import {DBObjectId} from "./DBObjectId";

export interface CarrierActionWaypoint {
    carrier: Carrier;
    star: Star;
    waypoint: CarrierWaypoint<DBObjectId>;
};
