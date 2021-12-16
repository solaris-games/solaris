const ValidationError = require('../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.get('/api/badges', middleware.authenticate, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            const result = await container.badgeService.listBadges();
            
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
        let errors = [];

        if (!req.body.badgeKey) {
            errors.push('badgeKey is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            const result = await container.badgeService.purchaseBadgeForUser(req.session.userId, req.params.userId, req.body.badgeKey);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/badges/game/:gameId/player/:playerId', middleware.authenticate, async (req, res, next) => {
        try {
            const result = await container.badgeService.listBadgesByPlayer(req.params.gameId, req.params.playerId);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/badges/game/:gameId/player/:playerId', middleware.authenticate, async (req, res, next) => {
        let errors = [];

        if (!req.body.badgeKey) {
            errors.push('badgeKey is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            const result = await container.badgeService.purchaseBadgeForPlayer(req.session.userId, req.params.gameId, req.params.playerId, req.body.badgeKey);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
