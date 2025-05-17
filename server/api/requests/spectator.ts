import * as Joi from 'joi';
import {type Validator, array, string, object} from "../validate";

export const spectatorInviteSpectatorRequestSchema = Joi.object({
    username: Joi.string().required().min(3).max(24)
});

export type SpectatorInviteRequest = {
    usernames: string[];
}

// TODO: Validate usernames
export const parseSpectatorInviteRequest: Validator<SpectatorInviteRequest> = object({
    usernames: array(string),
});