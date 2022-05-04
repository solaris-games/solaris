import { Router } from 'express';
import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';
import Middleware from './middleware';

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.post('/api/game/:gameId/report', middleware.authenticate, middleware.loadGamePlayers, middleware.loadPlayer, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.playerId) {
            errors.push('playerId is a required body field');
        }

        if (!req.body.reasons) {
            errors.push('reasons is a required body field');
        }

        try {
            if (errors.length) {
                throw new ValidationError(errors);
            }

            await container.reportService.reportPlayer(req.game, req.body.playerId, req.session.userId, req.body.reasons);
            
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
