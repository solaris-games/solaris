import {boolean, GameSettingEnabledDisabled, number, object, string, Validator} from "solaris-common";
import {enabledDisabled} from "./validators";

export type AdminSetUserRoleRequest = {
    enabled: boolean,
}

export const parseAdminSetUserRoleRequest: Validator<AdminSetUserRoleRequest> = object({
    enabled: boolean,
});

export type AdminSetUserCreditsRequest = {
    credits: number,
}

export const parseAdminSetUserCreditsRequest: Validator<AdminSetUserCreditsRequest> = object({
    credits: number,
});

export type AdminSetGameFeaturedRequest = {
    featured: boolean,
}

export const parseAdminSetGameFeaturedRequest: Validator<AdminSetGameFeaturedRequest> = object({
    featured: boolean,
});

export type AdminSetGameTimeMachineRequest = {
    timeMachine: GameSettingEnabledDisabled,
}

export const parseAdminSetGameTimeMachineRequest: Validator<AdminSetGameTimeMachineRequest> = object({
    timeMachine: enabledDisabled,
});

export type AdminAddWarningRequest = {
    text: string,
}

export const parseAdminAddWarningRequest: Validator<AdminAddWarningRequest> = object({
    text: string,
});
