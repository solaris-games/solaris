const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/ledger', middleware.authenticate, middleware.loadGame, middleware.loadPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let ledger = await container.ledgerService.getLedger(
                req.game,
                req.player);

            return res.status(200).json(ledger);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/ledger/forgive/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let newLedger = await container.ledgerService.forgiveDebt(
                req.game,
                req.player,
                req.params.playerId);

            return res.status(200).json(newLedger);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/ledger/settle/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let newLedger = await container.ledgerService.settleDebt(
                req.game,
                req.player,
                req.params.playerId);

            return res.status(200).json(newLedger);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
