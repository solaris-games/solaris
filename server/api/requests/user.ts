import { ValidationError } from "solaris-common";
import { keyHasBooleanValue, keyHasStringValue } from "./helpers";
import {email, object, password, string, stringValue, username, Validator} from "../../../common/src/validation/validate";

export interface UserCreateUserRequest {
    email: string;
    username: string;
    password: string;
};

export const parseCreateUserRequest: Validator<UserCreateUserRequest> = object({
    email: email,
    username: username,
    password: password,
});

export interface UserUpdateEmailPreferenceRequest {
    enabled: boolean;
};

export const mapToUserUpdateEmailPreferenceRequest = (body: any): UserUpdateEmailPreferenceRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'enabled')) {
        errors.push('Enabled is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        enabled: body.enabled
    }
};

export interface UserUpdateUsernameRequest {
    username: string;
};

export const parseUserUpdateUserNameRequest: Validator<UserUpdateUsernameRequest> = object({
    username: username,
});

export interface UserUpdateEmailRequest {
    email: string;
};

export const parseUserUpdateEmailRequest: Validator<UserUpdateEmailRequest> = object({
    email: email,
});

export interface UserUpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
};

export const parseUserUpdatePasswordRequest: Validator<UserUpdatePasswordRequest> = object({
    currentPassword: string,
    newPassword: password,
});

export interface UserRequestPasswordResetRequest {
    email: string;
};

export const mapToUserRequestPasswordResetRequest = (body: any): UserRequestPasswordResetRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'email')) {
        errors.push('Email is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        email: body.email
    }
};

export interface UserResetPasswordResetRequest {
    token: string;
    newPassword: string;
};

export const mapToUserResetPasswordResetRequest = (body: any): UserResetPasswordResetRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'token')) {
        errors.push('Token is required.');
    }

    if (!keyHasStringValue(body, 'newPassword')) {
        errors.push('New Password is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        token: body.token,
        newPassword: body.newPassword
    }
};

export interface UserRequestUsernameRequest {
    email: string;
};

export const mapToUserRequestUsernameRequest = (body: any): UserRequestUsernameRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'email')) {
        errors.push('Email is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        email: body.email
    }
};
