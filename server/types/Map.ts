import { DBObjectId } from "./DBObjectId";
import { Location } from "./Location";

export interface MapObject {
    _id: DBObjectId;
    ownedByPlayerId: DBObjectId | null;
    location: Location
};
