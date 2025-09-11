import { ValidationError } from "@solaris-common";
import { keyHasStringValue } from "./helpers";

export interface GuildCreateGuildRequest {
    name: string;
    tag: string;
};

export const mapToGuildCreateGuildRequest = (body: any): GuildCreateGuildRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'name')) {
        errors.push('Name is required.');
    }

    if (!keyHasStringValue(body, 'tag')) {
        errors.push('Tag is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        name: body.name,
        tag: body.tag
    }
};

export interface GuildRenameGuildRequest {
    name: string;
    tag: string;
};

export const mapToGuildRenameGuildRequest = (body: any): GuildRenameGuildRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'name')) {
        errors.push('Name is required.');
    }

    if (!keyHasStringValue(body, 'tag')) {
        errors.push('Tag is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        name: body.name,
        tag: body.tag
    }
};

export interface GuildInviteUserRequest {
    username: string;
};

export const mapToGuildInviteUserRequest = (body: any): GuildInviteUserRequest => {
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
