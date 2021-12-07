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

    router.put('/api/game/:gameId/star/upgrade/economy', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeEconomy(
                req.game,
                req.player,
                req.body.starId);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/industry', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeIndustry(
                req.game,
                req.player,
                req.body.starId);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/science', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.upgradeScience(
                req.game,
                req.player,
                req.body.starId);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulk', middleware.authenticate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let summary = await container.starUpgradeService.upgradeBulk(
                req.game,
                req.player,
                req.body.upgradeStrategy,
                req.body.infrastructure,
                +req.body.amount);

            return res.status(200).json(summary);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/upgrade/bulkCheck', middleware.authenticate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let summary = await container.starUpgradeService.generateUpgradeBulkReport(
                req.game,
                req.player,
                req.body.upgradeStrategy,
                req.body.infrastructure,
                +req.body.amount);

            return res.status(200).json(summary);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/warpgate', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.starUpgradeService.buildWarpGate(
                req.game,
                req.player,
                req.body.starId);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/destroy/warpgate', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameStarted, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starUpgradeService.destroyWarpGate(
                req.game,
                req.player,
                req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/build/carrier', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let ships = +req.body.ships || 1;

        try {
            let report = await container.starUpgradeService.buildCarrier(
                req.game,
                req.player,
                req.body.starId,
                ships);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/transferall', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let report = await container.shipTransferService.transferAllToStar(
                req.game,
                req.player,
                req.body.starId);

            return res.status(200).json(report);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/abandon', middleware.authenticate, validate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starService.abandonStar(
                req.game,
                req.player,
                req.body.starId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/toggleignorebulkupgrade', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starService.toggleIgnoreBulkUpgrade(
                req.game,
                req.player,
                req.body.starId,
                req.body.infrastructureType);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/toggleignorebulkupgradeall', middleware.authenticate, validate, middleware.loadGameLean, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.starService.toggleIgnoreBulkUpgradeAll(
                req.game,
                req.player,
                req.body.starId,
                req.body.ignoreStatus);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
