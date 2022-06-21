import ValidationError from "../../errors/validation";
import { CarrierWaypointActionType } from "../../services/types/CarrierWaypoint";
import { DBObjectId } from "../../services/types/DBObjectId";
import { keyHasArrayValue, keyHasBooleanValue, keyHasNumberValue, keyHasObjectValue, keyHasStringValue } from "./helpers";

export interface CarrierSaveWaypointsRequest {
    waypoints: [
        {
            source: DBObjectId;
            destination: DBObjectId;
            action: CarrierWaypointActionType;
            actionShips: number;
            delayTicks: number;
        }
    ];
    looped: boolean;
};

export const mapToCarrierSaveWaypointsRequest = (body: any): CarrierSaveWaypointsRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'looped')) {
        errors.push('Looped is required.');
    }

    if (!keyHasArrayValue(body, 'waypoints')) {
        errors.push('Waypoints is required.');
    }

    if (body.waypoints) {
        for (let waypoint of body.waypoints) {
            if (!keyHasStringValue(waypoint, 'source')) {
                errors.push('Source is required.');
            }

            if (!keyHasStringValue(waypoint, 'destination')) {
                errors.push('Destination is required.');
            }

            if (!keyHasStringValue(waypoint, 'action')) {
                errors.push('Action is required.');
            }

            if (!keyHasNumberValue(waypoint, 'actionShips')) {
                errors.push('Action Ships is required.');
            }

            if (!keyHasNumberValue(waypoint, 'delayTicks')) {
                errors.push('Delay Ticks is required.');
            }

            waypoint.actionShips = +waypoint.actionShips;
            waypoint.delayTicks = +waypoint.delayTicks;
        }
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        waypoints: body.waypoints,
        looped: body.looped
    }
};

export interface CarrierLoopWaypointsRequest {
    loop: boolean;
};

export const mapToCarrierLoopWaypointsRequest = (body: any): CarrierLoopWaypointsRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'loop')) {
        errors.push('Loop is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        loop: body.loop
    }
};

export interface CarrierTransferShipsRequest {
    carrierShips: number;
    starShips: number;
    starId: DBObjectId;
};

export const mapToCarrierTransferShipsRequest = (body: any): CarrierTransferShipsRequest => {
    let errors: string[] = [];

    if (!keyHasNumberValue(body, 'carrierShips')) {
        errors.push('Carrier Ships is required.');
    }

    if (!keyHasNumberValue(body, 'starShips')) {
        errors.push('Star Ships is required.');
    }

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    body.starShips = +body.starShips;

    return {
        carrierShips: body.carrierShips,
        starShips: body.starShips,
        starId: body.starId
    }
};

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
