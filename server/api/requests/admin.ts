import * as Joi from 'joi';

export const adminSetUserRoleRequestSchema = Joi.object({
    enabled: Joi.boolean().required()
});

export const adminSetUserCreditsRequestSchema = Joi.object({
    credits: Joi.number().required()
});

export const adminSetGameFeaturedRequestSchema = Joi.object({
    featured: Joi.boolean().required()
});

export const adminSetGameTimeMachineRequestSchema = Joi.object({
    timeMachine: Joi.string().required().valid('enabled', 'disabled')
});

export const adminAddWarningRequestSchema = Joi.object({
    text: Joi.string().required()
});