const express = require('express');
const router = express.Router();
const middleware = require('../middleware');

const GameService = require('../../services/game');
const RandomService = require('../../services/random');
const StarService = require('../../services/star');
const StarNameService = require('../../services/starName');
const UpgradeStarService = require('../../services/upgradeStar');

const starNames = require('../../config/game/starNames');

const gameModel = require('../../models/Game');

// TODO: Need DI here.
const randomService = new RandomService();
const starNameService = new StarNameService(starNames, randomService);
const gameService = new GameService(gameModel);
const starService = new StarService(randomService, starNameService, gameService);
const upgradeStarService = new UpgradeStarService(gameService, starService);

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
        await upgradeStarService.upgradeEconomy(
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
        await upgradeStarService.upgradeIndustry(
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
        await upgradeStarService.upgradeScience(
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
        await upgradeStarService.upgradeWarpGate(
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
        await upgradeStarService.destroyWarpGate(
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
        await starService.abandonStar(
            req.params.gameId,
            req.session.userId,
            req.body.starId);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
