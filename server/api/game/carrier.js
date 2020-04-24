const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');
const ValidationError = require('../../errors/validation');

router.put('/:gameId/carrier/:carrierId/waypoints', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    let errors = [];

    // TODO: Validation

    if (errors.length) {
        throw new ValidationError(errors);
    }

    try {
        await container.waypointService.saveWaypoints(
            req.game,
            req.params.carrierId,
            req.body);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/carrier/:carrierId/transfer', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    let errors = [];

    // TODO: Validation

    if (errors.length) {
        throw new ValidationError(errors);
    }

    try {
        await container.shipTransferService.transfer(
            req.game,
            req.params.carrierId,
            req.body.carrierShips,
            req.body.starId,
            req.body.starShips);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

module.exports = router;
