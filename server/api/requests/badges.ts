import * as Joi from 'joi';

export const badgesPurchaseBadgeRequestSchema = Joi.object({
    badgeKey: Joi.string().required()
});
