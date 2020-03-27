const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const bcrypt = require('bcrypt');

const GameService = require('../../services/game');
const RandomService = require('../../services/random');
const StarService = require('../../services/star');
const TradeService = require('../../services/trade');
const StarNameService = require('../../services/starName');
const UserService = require('../../services/user');
const UpgradeStarService = require('../../services/upgradeStar');

const starNames = require('../../config/game/starNames');

const gameModel = require('../../models/Game');
const User = require('../../models/User');

// TODO: Need DI here.
const randomService = new RandomService();
const starNameService = new StarNameService(starNames, randomService);
const gameService = new GameService(gameModel);
const starService = new StarService(randomService, starNameService, gameService);
const upgradeStarService = new UpgradeStarService(gameService, starService);

const userService = new UserService(bcrypt, User);
const tradeService = new TradeService(gameService, userService);

router.post('/:gameId/star/upgrade/warpgate', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.starId) {
        errors.push('starId is required.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

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

router.post('/:gameId/star/destroy/warpgate', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.starId) {
        errors.push('starId is required.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

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

router.post('/:gameId/star/abandon', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.starId) {
        errors.push('starId is required.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

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
