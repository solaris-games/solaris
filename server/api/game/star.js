const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const bcrypt = require('bcrypt');

const GameService = require('../../services/game');
const DistanceService = require('../../services/distance');
const StarDistanceService = require('../../services/starDistance');
const MapService = require('../../services/map');
const PlayerService = require('../../services/player');
const RandomService = require('../../services/random');
const StarService = require('../../services/star');
const CarrierService = require('../../services/carrier');
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
const distanceService = new DistanceService();
const starDistanceService = new StarDistanceService(distanceService);
const carrierService = new CarrierService();
const starService = new StarService(randomService, starNameService);
const mapService = new MapService(randomService, starService, distanceService, starDistanceService, starNameService);
const playerService = new PlayerService(randomService, mapService, starService, carrierService, starDistanceService);
const gameService = new GameService(gameModel);
const upgradeStarService = new UpgradeStarService(gameService, starService);

const userService = new UserService(bcrypt, User);
const tradeService = new TradeService(gameService, userService);

router.post('/:gameId/star/upgrade/warpgate', async (req, res, next) => {
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

router.post('/:gameId/star/destroy/warpgate', async (req, res, next) => {
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

module.exports = router;
