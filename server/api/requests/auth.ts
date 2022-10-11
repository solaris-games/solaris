import * as Joi from 'joi';

export const authLoginRequestSchema = Joi.object({
  email: Joi.string().required().email().message('Email is required and must be a valid email address.'),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.'
  })
});
