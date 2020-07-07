const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.put('/api/game/:gameId/carrier/:carrierId/waypoints', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
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

    router.put('/api/game/:gameId/carrier/:carrierId/waypoints/loop', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
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

    router.put('/api/game/:gameId/carrier/:carrierId/transfer', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
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

            // Broadcast the event to the current player and also all other players within scanning range.
            let playersWithinScanningRange = container.playerService.getPlayersWithinScanningRangeOfStar(req.game, req.body.starId);

            playersWithinScanningRange.forEach(p => 
                container.broadcastService.gameStarCarrierShipTransferred(req.game, p._id, req.body.starId, req.body.starShips, req.params.carrierId, req.body.carrierShips));

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/game/:gameId/carrier/calculateCombat', middleware.authenticate, (req, res, next) => {
        let errors = [];

        if (req.body.defender.ships == null) {
            errors.push('defender.ships is required.');
        }

        if (+req.body.defender.ships <= 0) {
            errors.push('defender.ships must be greater than 0.');
        }

        if (req.body.defender.weaponsLevel == null) {
            errors.push('defender.weaponsLevel is required.');
        }

        if (+req.body.defender.weaponsLevel <= 0) {
            errors.push('defender.weaponsLevel must be greater than 0.');
        }

        if (req.body.attacker.ships == null) {
            errors.push('attacker.ships is required.');
        }

        if (+req.body.attacker.ships <= 0) {
            errors.push('attacker.ships must be greater than 0.');
        }

        if (req.body.attacker.weaponsLevel == null) {
            errors.push('attacker.weaponsLevel is required.');
        }

        if (+req.body.attacker.weaponsLevel <= 0) {
            errors.push('attacker.weaponsLevel must be greater than 0.');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = container.combatService.calculate(
                req.body.defender,
                req.body.attacker);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
