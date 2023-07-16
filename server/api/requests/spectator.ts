import * as Joi from 'joi';

export const spectatorInviteSpectatorRequestSchema = Joi.object({
    username: Joi.string().required().min(3).max(24)
});
