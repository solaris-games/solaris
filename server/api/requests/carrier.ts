import ValidationError from "../../errors/validation";
import { CarrierWaypointActionType, CarrierWaypointActionTypes } from "../../services/types/CarrierWaypoint";
import { DBObjectId } from "../../services/types/DBObjectId";
import {
    array,
    boolean,
    map,
    number,
    numberAdv,
    object,
    objectId,
    or,
    positiveInteger,
    string,
    stringEnumeration,
    Validator,
    withDefault
} from "../validate";
import { keyHasArrayValue, keyHasBooleanValue, keyHasNumberValue, keyHasObjectValue, keyHasStringValue } from "./helpers";

type CarrierSaveWaypoint = {
    source: DBObjectId;
    destination: DBObjectId;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;
};

export type CarrierSaveWaypointsRequest = {
    waypoints: CarrierSaveWaypoint[];
    looped: boolean;
};

export const parseCarrierSaveWaypointsRequest: Validator<CarrierSaveWaypointsRequest> = object({
    waypoints: array(object({
        source: objectId,
        destination: objectId,
        action: stringEnumeration<CarrierWaypointActionType, CarrierWaypointActionType[]>(CarrierWaypointActionTypes),
        actionShips: withDefault(0, positiveInteger),
        delayTicks: withDefault(0, positiveInteger),
    })),
    looped: boolean,
});

export type CarrierLoopWaypointsRequest = {
    loop: boolean;
};

export const parseCarrierLoopWaypointsRequest: Validator<CarrierLoopWaypointsRequest> = object({
    loop: boolean,
});

export type CarrierTransferShipsRequest = {
    carrierShips: number;
    starShips: number;
    starId: DBObjectId;
};

export const parseCarrierTransferShipsRequest = object({
    carrierShips: positiveInteger,
    starShips: positiveInteger,
    starId: objectId,
});

export interface CarrierRenameCarrierRequest {
    name: string;
};

export const mapToCarrierRenameCarrierRequest = (body: any): CarrierRenameCarrierRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'name')) {
        errors.push('Name is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        name: body.name
    }
};

export interface CarrierCalculateCombatRequest {
    defender: {
        ships: number;
        weaponsLevel: number;
    },
    attacker: {
        ships: number;
        weaponsLevel: number;
    },
    isTurnBased: boolean;
};

export const mapToCarrierCalculateCombatRequest = (body: any): CarrierCalculateCombatRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'isTurnBased')) {
        errors.push('Is Turn Based is required.');
    }

    if (!keyHasObjectValue(body, 'defender')) {
        errors.push('Defender is required.');
    }

    if (body.defender) {
        if (!keyHasNumberValue(body.defender, 'ships')) {
            errors.push('Defender Ships is required.');
        }
        
        if (body.defender.ships != null && +body.defender.ships < 0) {
            errors.push('Defender Ships must be greater than or equal to 0.');
        }

        if (body.defender.ships != null && +body.defender.ships % 1 != 0) {
            errors.push('Defender Ships must be an integer.');
        }

        if (!keyHasNumberValue(body.defender, 'weaponsLevel')) {
            errors.push('Defender Weapons Level is required.');
        }

        if (body.defender.weaponsLevel != null && +body.defender.weaponsLevel <= 0) {
            errors.push('Defender Weapons Level must be greater than 0.');
        }

        if (body.defender.weaponsLevel != null && +body.defender.weaponsLevel % 1 != 0) {
            errors.push('Defender Weapons Level must be an integer.');
        }

        body.defender.ships = +body.defender.ships;
        body.defender.weaponsLevel = +body.defender.weaponsLevel;
    }

    if (!keyHasObjectValue(body, 'attacker')) {
        errors.push('Attacker is required.');
    }

    if (body.attacker) {
        if (!keyHasNumberValue(body.attacker, 'ships')) {
            errors.push('Attacker Ships is required.');
        }
        
        if (body.attacker.ships != null && +body.attacker.ships < 0) {
            errors.push('Attacker Ships must be greater than or equal to 0.');
        }

        if (body.attacker.ships != null && +body.attacker.ships % 1 != 0) {
            errors.push('Attacker Ships must be an integer.');
        }

        if (!keyHasNumberValue(body.attacker, 'weaponsLevel')) {
            errors.push('Attacker Weapons Level is required.');
        }

        if (body.attacker.weaponsLevel != null && +body.attacker.weaponsLevel <= 0) {
            errors.push('Attacker Weapons Level must be greater than 0.');
        }

        if (body.attacker.weaponsLevel != null && +body.attacker.weaponsLevel % 1 != 0) {
            errors.push('Attacker Weapons Level must be an integer.');
        }

        body.attacker.ships = +body.attacker.ships;
        body.attacker.weaponsLevel = +body.attacker.weaponsLevel;
    }
    
    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        defender: body.defender,
        attacker: body.attacker,
        isTurnBased: body.isTurnBased
    }
};
