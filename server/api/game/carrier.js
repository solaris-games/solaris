const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.put('/:gameId/carrier/:carrierId/waypoints', middleware.authenticate, middleware.loadGame, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.waypointService.saveWaypoints(
                req.game,
                req.player,
                req.params.carrierId,
                req.body);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/:gameId/carrier/:carrierId/waypoints/loop', middleware.authenticate, middleware.loadGame, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (req.body.loop == null) {
            errors.push('loop field is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.waypointService.loopWaypoints(
                req.game,
                req.player,
                req.params.carrierId,
                req.body.loop);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/:gameId/carrier/:carrierId/transfer', middleware.authenticate, middleware.loadGame, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (req.body.carrierShips == null) {
            errors.push('carrierShips is required.');
        }

        if (req.body.starShips == null) {
            errors.push('starShips is required.');
        }

        if (!req.body.starId) {
            errors.push('starId is required.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.shipTransferService.transfer(
                req.game,
                req.player,
                req.params.carrierId,
                req.body.carrierShips,
                req.body.starId,
                req.body.starShips);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
