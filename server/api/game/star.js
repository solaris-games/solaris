const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');
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

router.put('/:gameId/star/upgrade/economy', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeEconomy(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/star/upgrade/industry', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeIndustry(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/star/upgrade/science', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starUpgradeService.upgradeScience(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/star/build/warpgate', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starUpgradeService.buildWarpGate(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/star/destroy/warpgate', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starUpgradeService.destroyWarpGate(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/star/build/carrier', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starUpgradeService.buildCarrier(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/star/abandon', middleware.authenticate, validate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.starService.abandonStar(
            req.game,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

module.exports = router;
