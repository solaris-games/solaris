import { NextFunction, Request, Response } from 'express';
import { ExpressJoiError } from 'express-joi-validation';
import { ValidationError } from '@solaris-common';
import { DependencyContainer } from '../../services/types/DependencyContainer';
import {logger} from "../../utils/logging";

const log = logger("Core Middleware");

export interface CoreMiddleware {
    handleError(err: any, req: Request<unknown>, res: Response, next: NextFunction);
};

export const middleware = (container: DependencyContainer): CoreMiddleware => {
    return {
        async handleError(err: any, req: Request<unknown>, res: Response, next: NextFunction) {
            try {
                // If there is an error in the pipeline
                // then test to see what type of error it is. If it's a validation
                // error then return it with its status code.
                if (err instanceof ValidationError) {
                    let errors: string | string[] = err.message;

                    if (!Array.isArray(errors)) {
                        errors = [errors];
                    }

                    log.error({
                        userId: req.session?.userId,
                        errors
                    });
                    res.status(err.statusCode).json({
                        errors
                    });

                    return;
                }

                // If its a Joi error then return the error messages only.
                if (err.type && ['body', 'query', 'headers', 'fields', 'params'].includes(err.type)) {
                    const jerr = err as ExpressJoiError;

                    res.status(400).json({
                        errors: jerr.error!.details.map(d => d.message)
                    });

                    return;
                }

                log.error({
                    userId: req.session?.userId,
                    error: err.stack
                });

                res.status(500).json({
                    errors: ['Something broke. If the problem persists, please contact a developer.']
                });

                return;
            }
            finally {
                if (req.game != null && req.playerMutexLocks != null) {
                    // If we encountered an error, we might not have released the locks, so we attempt to release them here, just to be safe.
                    await container.gamePlayerMutexService.releaseMutexLocks(req.game!._id.toString(), req.playerMutexLocks);
                }
            }
        }
    };
};
