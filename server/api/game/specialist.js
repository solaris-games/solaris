const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/specialists/carrier', middleware.authenticate, middleware.loadGameLean, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let specialists = await container.specialistService.listCarrier(req.game);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/upgrade/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = await container.specialistService.upgradeCarrier(
                req.game,
                req.player,
                req.params.carrierId,
                req.params.specialistId);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
