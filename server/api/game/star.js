const ValidationError = require('../../errors/validation');

function validate(req, res, next) {
    let errors = [];

    if (!req.body.starId) {
        errors.push('starId is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return next();
}

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.put('/api/game/:gameId/star/upgrade/economy', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeEconomy(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarEconomyUpgraded(req.game, req.body.starId, report.infrastructure);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/industry', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeIndustry(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarIndustryUpgraded(req.game, req.body.starId, report.infrastructure);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/science', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeScience(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarScienceUpgraded(req.game, req.body.starId, report.infrastructure);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulk', middleware.authenticate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let summary = await container.starUpgradeService.upgradeBulk(
                req.game,
                req.player,
                req.body.infrastructure,
                +req.body.amount);

            container.broadcastService.gameStarBulkUpgraded(req.game, summary);

            return res.status(200).json(summary);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/warpgate', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starUpgradeService.buildWarpGate(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarWarpGateBuilt(req.game, req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/destroy/warpgate', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starUpgradeService.destroyWarpGate(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarWarpGateDestroyed(req.game, req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/carrier', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let carrier = await container.starUpgradeService.buildCarrier(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarCarrierBuilt(req.game, carrier);

            return res.status(200).json(carrier);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/abandon', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starService.abandonStar(
                req.game,
                req.player,
                req.body.starId);

            container.broadcastService.gameStarAbandoned(req.game, req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
