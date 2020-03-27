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

const userService = new UserService(bcrypt, User);
const tradeService = new TradeService(gameService, userService);

router.post('/:gameId/trade/credits', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.toPlayerId) {
        errors.push('toPlayerId is required.');
    }

    if (req.session.userId === req.body.toPlayerId) {
        errors.push('Cannot send credits to yourself.');
    }
    
    req.body.amount = parseInt(req.body.amount || 0);

    if (!req.body.amount) {
        errors.push('amount is required.');
    }
    
    if (req.body.amount <= 0) {
        errors.push('amount must be greater than 0.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    try {
        await tradeService.sendCredits(
            req.params.gameId,
            req.session.userId,
            req.body.toPlayerId,
            req.body.amount);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/:gameId/trade/renown', async (req, res, next) => {
    let errors = [];

    if (!req.body.toPlayerId) {
        errors.push('toPlayerId is required.');
    }

    req.body.amount = parseInt(req.body.amount || 0);

    if (!req.body.amount) {
        errors.push('amount is required.');
    }
    
    if (req.body.amount <= 0) {
        errors.push('amount must be greater than 0.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    try {
        await tradeService.sendRenown(
            req.params.gameId,
            req.session.userId,
            req.body.toPlayerId,
            req.body.amount);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
