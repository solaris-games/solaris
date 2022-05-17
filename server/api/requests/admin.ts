import ValidationError from "../../errors/validation";
import { keyHasBooleanValue, keyHasNumberValue } from './helpers';

export interface AdminSetUserRoleRequest {
    enabled: boolean;
};

export const mapToAdminSetUserRoleRequest = (body: any): AdminSetUserRoleRequest => {
    if (!keyHasBooleanValue(body, 'enabled')) {
        throw new ValidationError(`Enabled is required.`);
    }

    return {
        enabled: body.enabled
    }
};

export interface AdminSetUserCreditsRequest {
    credits: number;
};

export const mapToAdminSetUserCreditsRequest = (body: any): AdminSetUserCreditsRequest => {
    if (!keyHasNumberValue(body, 'credits')) {
        throw new ValidationError(`Credits is required.`);
    }

    return {
        credits: body.credits
    }
};

export interface AdminSetGameFeaturedRequest {
    featured: boolean;
};

export const mapToAdminSetGameFeaturedRequest = (body: any): AdminSetGameFeaturedRequest => {
    if (!keyHasBooleanValue(body, 'featured')) {
        throw new ValidationError(`Featured is required.`);
    }

    return {
        featured: body.featured
    }
};

export interface AdminSetGameTimeMachineRequest {
    timeMachine: boolean;
};

export const mapToAdminSetGameTimeMachineRequest = (body: any): AdminSetGameTimeMachineRequest => {
    if (!keyHasBooleanValue(body, 'timeMachine')) {
        throw new ValidationError(`Time Machine is required.`);
    }

    return {
        timeMachine: body.timeMachine
    }
};
