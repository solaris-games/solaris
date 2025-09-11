import {map, string, Validator} from "@solaris-common";
import {DBObjectId, objectIdFromString} from "../services/types/DBObjectId";

export const objectId: Validator<DBObjectId> = map(objectIdFromString, string);