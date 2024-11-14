import { ObjectId } from "mongoose";
import ValidationError from "../../errors/validation";
import { DBObjectId } from "../../services/types/DBObjectId";
import { InfrastructureType } from "../../services/types/Star";
import { keyHasBooleanValue, keyHasNumberValue, keyHasStringValue } from "./helpers";
import { object, objectId, Validator } from "../validate";

export interface StarUpgradeInfrastructureRequest {
    starId: DBObjectId;
};

export const mapToStarUpgradeInfrastructureRequest = (body: any): StarUpgradeInfrastructureRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        starId: body.starId
    }
};

export interface StarUpgradeInfrastructureBulkRequest {
    upgradeStrategy: string;
    infrastructure: InfrastructureType;
    amount: number;
};

export interface ScheduledStarUpgradeInfrastructureBulkRequest {
    infrastructureType: InfrastructureType;
    buyType: string;
    amount: number;
    repeat: boolean;
    tick: number;
};

export type ScheduledStarUpgradeToggleRepeat = {
    actionId: DBObjectId;
};

export interface ScheduledStarUpgradeTrash {
    actionId: DBObjectId;
}

export const mapToStarUpgradeInfrastructureBulkRequest = (body: any): StarUpgradeInfrastructureBulkRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'upgradeStrategy')) {
        errors.push('Upgrade Strategy is required.');
    }

    if (!keyHasStringValue(body, 'infrastructure')) {
        errors.push('Infrastructure is required.');
    }

    if (!keyHasNumberValue(body, 'amount')) {
        errors.push('Amount is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    body.amount = +body.amount;

    return {
        upgradeStrategy: body.upgradeStrategy,
        infrastructure: body.infrastructure,
        amount: body.amount
    }
};

export const mapToScheduledStarUpgradeInfrastructureBulkRequest = (body: any): ScheduledStarUpgradeInfrastructureBulkRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'infrastructureType')) {
        errors.push('Infrastructure is required.');
    }

    if (!keyHasStringValue(body, 'buyType')) {
        errors.push('Upgrade Strategy is required.');
    }

    if (!keyHasNumberValue(body, 'amount')) {
        errors.push('Amount is required.');
    }

    if (!keyHasBooleanValue(body, 'repeat')) {
        errors.push('Repeat is required.');
    }

    if (!keyHasNumberValue(body, 'tick')) {
        errors.push('Tick is required.');
    }

    body.amount = +body.amount;
    body.tick = +body.tick;

    if (body.amount < 0) {
        errors.push('Amount must be greater than 0.');
    }

    if (body.tick < 0) {
        errors.push('Tick must be greater than 0.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        infrastructureType: body.infrastructureType,
        buyType: body.buyType,
        amount: body.amount,
        repeat: body.repeat,
        tick: body.tick
    }
};

export const parseScheduledStarUpgradeToggleRepeat: Validator<ScheduledStarUpgradeToggleRepeat> = object({
    actionId: objectId
});

export const parseScheduledStarUpgradeTrashRepeat: Validator<ScheduledStarUpgradeToggleRepeat> = object({
    actionId: objectId
});

export interface StarDestroyInfrastructureRequest {
    starId: DBObjectId;
};

export const mapToStarDestroyInfrastructureRequest = (body: any): StarDestroyInfrastructureRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        starId: body.starId
    }
};

export interface StarBuildCarrierRequest {
    starId: DBObjectId;
    ships: number;
};

export const mapToStarBuildCarrierRequest = (body: any): StarBuildCarrierRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (!keyHasNumberValue(body, 'ships')) {
        errors.push('Ships is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    let ships = 1;
                
    if (body.ships) {
        ships = +body.ships;
    }

    return {
        starId: body.starId,
        ships
    }
};

export interface StarAbandonStarRequest {
    starId: DBObjectId;
};

export const mapToStarAbandonStarRequest = (body: any): StarAbandonStarRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        starId: body.starId
    }
};

export interface StarToggleBulkIgnoreStatusRequest {
    starId: DBObjectId;
    infrastructureType: InfrastructureType;
};

export const mapToStarToggleBulkIgnoreStatusRequest = (body: any): StarToggleBulkIgnoreStatusRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (!keyHasStringValue(body, 'infrastructureType')) {
        errors.push('Infrastructure Type is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        starId: body.starId,
        infrastructureType: body.infrastructureType
    }
};

export interface StarSetBulkIgnoreAllStatusRequest {
    starId: DBObjectId;
    ignoreStatus: boolean;
};

export const mapToStarSetBulkIgnoreAllStatusRequest = (body: any): StarSetBulkIgnoreAllStatusRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'starId')) {
        errors.push('Star ID is required.');
    }

    if (!keyHasBooleanValue(body, 'ignoreStatus')) {
        errors.push('Ignore Status is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        starId: body.starId,
        ignoreStatus: body.ignoreStatus
    }
};
