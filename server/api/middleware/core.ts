import ValidationError from '../../errors/validation';
import { ExpressJoiError } from 'express-joi-validation';
import { NextFunction, Request, Response } from 'express';

export interface CoreMiddleware {
    handleError(err: any, req: Request, res: Response, next: NextFunction);
};

export const middleware = (): CoreMiddleware => {
    return {
        handleError(err, req, res, next) {
            // If there is an error in the pipleline
            // then test to see what type of error it is. If its a validation
            // error then return it with its status code.
            if (err instanceof ValidationError) {
            // if (err instanceof ValidationError) {
                let errors: string | string[] = err.message;

                if (!Array.isArray(errors)) {
                    errors = [errors];
                }

                return res.status(err.statusCode).json({
                    errors
                });
            }

            // If its a Joi error then return the error messages only.
            if (err.type && ['body','query','headers','fields','params'].includes(err.type)) {
                const jerr = err as ExpressJoiError;

                return res.status(400).json({
                    errors: jerr.error!.details.map(d => d.message)
                })
            }

            console.error(err.stack);

            return res.status(500).json({
                errors: ['Something broke. If the problem persists, please contact a developer.']
            });
        }
    };
};
