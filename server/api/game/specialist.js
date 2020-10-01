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

    router.get('/api/game/:gameId/specialists/star', middleware.authenticate, middleware.loadGameLean, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let specialists = await container.specialistService.listStar(req.game);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = await container.specialistService.hireCarrierSpecialist(
                req.game,
                req.player,
                req.params.carrierId,
                +req.params.specialistId);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/:starId/hire/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = await container.specialistService.hireStarSpecialist(
                req.game,
                req.player,
                req.params.starId,
                +req.params.specialistId);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
