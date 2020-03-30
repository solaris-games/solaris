const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');

function validate(req, res, next) {
    let errors = [];

    if (!req.body.starId) {
        errors.push('starId is required.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    return next();
}

router.put('/:gameId/star/upgrade/economy', middleware.authenticate, validate, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeEconomy(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.put('/:gameId/star/upgrade/industry', middleware.authenticate, validate, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeIndustry(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.put('/:gameId/star/upgrade/science', middleware.authenticate, validate, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeScience(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.put('/:gameId/star/upgrade/warpgate', middleware.authenticate, validate, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeWarpGate(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.put('/:gameId/star/destroy/warpgate', middleware.authenticate, validate, async (req, res, next) => {
    try {
        await container.starUpgradeService.destroyWarpGate(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.put('/:gameId/star/abandon', middleware.authenticate, validate, async (req, res, next) => {
    try {
        await container.starService.abandonStar(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
