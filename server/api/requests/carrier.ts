import {
    CarrierCalculateCombatRequest,
    CarrierSaveWaypointsRequest,
    TransferShipsReq,
    ValidationError,
} from "@solaris/common";
import {
    CarrierWaypointActionType,
    CarrierWaypointActionTypes,
} from "@solaris/common";
import { DBObjectId } from "../../services/types/DBObjectId";
import {
    array,
    boolean,
    object,
    positiveInteger,
    stringEnumeration,
    stringValue,
    UNICODE_INVISIBLE_CHARACTERS,
    UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
    Validator,
    withDefault,
} from "@solaris/common";
import {
    keyHasBooleanValue,
    keyHasNumberValue,
    keyHasObjectValue,
    keyHasStringValue,
} from "./helpers";
import { objectId } from "../../utils/validation";

export const parseCarrierSaveWaypointsRequest: Validator<
    CarrierSaveWaypointsRequest<DBObjectId>
> = object({
    waypoints: array(
        object({
            source: objectId,
            destination: objectId,
            action: stringEnumeration<
                CarrierWaypointActionType,
                CarrierWaypointActionType[]
            >(CarrierWaypointActionTypes),
            actionShips: withDefault(0, positiveInteger),
            delayTicks: withDefault(0, positiveInteger),
        }),
    ),
    looped: boolean,
});

export type CarrierLoopWaypointsRequest = {
    loop: boolean;
};

export const parseCarrierLoopWaypointsRequest: Validator<CarrierLoopWaypointsRequest> =
    object({
        loop: boolean,
    });

export const parseCarrierTransferShipsRequest: Validator<
    TransferShipsReq<DBObjectId>
> = object({
    carrierShips: positiveInteger,
    starShips: positiveInteger,
    starId: objectId,
});

export interface CarrierRenameCarrierRequest {
    name: string;
}

export const parseCarrierRenameCarrierRequest: Validator<CarrierRenameCarrierRequest> =
    object({
        name: stringValue({
            minLength: 3,
            maxLength: 30,
            trim: true,
            matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
            ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
        }),
    });
