import { Router } from 'express';
import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';
import Middleware from './middleware';

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.get('/api/badges', middleware.authenticate, async (req, res, next) => {
        try {
            const result = container.badgeService.listPurchasableBadges();
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/badges/user/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            const result = await container.badgeService.listBadgesByUser(req.params.userId);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/badges/user/:userId', middleware.authenticate, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.badgeKey) {
            errors.push('badgeKey is required.');
        }

        try {
            if (errors.length) {
                throw new ValidationError(errors);
            }

            await container.badgeService.purchaseBadgeForUser(req.session.userId, req.params.userId, req.body.badgeKey);
            
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/badges/game/:gameId/player/:playerId', middleware.authenticate, middleware.loadGamePlayersState, async (req, res, next) => {
        try {
            const result = await container.badgeService.listBadgesByPlayer(req.game, req.params.playerId);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/badges/game/:gameId/player/:playerId', middleware.authenticate, middleware.loadGamePlayersState, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.badgeKey) {
            errors.push('badgeKey is required.');
        }

        try {
            if (errors.length) {
                throw new ValidationError(errors);
            }

            await container.badgeService.purchaseBadgeForPlayer(req.game, req.session.userId, req.params.playerId, req.body.badgeKey);
            
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
