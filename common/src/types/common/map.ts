import type { Location } from "./location";

export interface MapObject<ID> {
    _id: ID;
    ownedByPlayerId: ID | null;
    location: Location;
};

export interface MapObjectWithVisibility<ID> extends MapObject<ID> {
    isAlwaysVisible?: boolean;
};
