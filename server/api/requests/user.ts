import ValidationError from "../../errors/validation";
import { keyHasBooleanValue, keyHasStringValue } from "./helpers";
import {email, object, password, string, stringValue, username, Validator} from "../validate";

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

export const mapToUserUpdateUsernameRequest = (body: any): UserUpdateUsernameRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'username')) {
        errors.push('Username is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        username: body.username
    }
};

export interface UserUpdateEmailRequest {
    email: string;
};

export const mapToUserUpdateEmailRequest = (body: any): UserUpdateEmailRequest => {
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

export interface UserUpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
};

export const mapToUserUpdatePasswordRequest = (body: any): UserUpdatePasswordRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'currentPassword')) {
        errors.push('Current Password is required.');
    }

    if (!keyHasStringValue(body, 'newPassword')) {
        errors.push('New Password is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword
    }
};

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
