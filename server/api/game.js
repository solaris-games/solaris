const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const GameService = require('../services/game');
const GameListService = require('../services/gameList');
const GameGalaxyService = require('../services/gameGalaxy');
const MapService = require('../services/map');
const PlayerService = require('../services/player');
const StarService = require('../services/star');

const gameModel = require('../models/Game');
const gameListService = new GameListService(gameModel);

const mapService = new MapService();
const playerService = new PlayerService();
const starService = new StarService();

const gameService = new GameService(
    gameModel, 
    mapService, 
    playerService, 
    starService);
    
const gameGalaxyService = new GameGalaxyService(
    gameService,
    mapService,
    playerService,
    starService
);

router.get('/defaultSettings', middleware.authenticate, (req, res, next) => {
    return res.status(200).json(require('../config/game/defaultGameSettings.json'));
});

router.post('/', middleware.authenticate, async (req, res, next) => {
    req.body.general.createdByUserId = req.session.userId;

    try {
        let game = await gameService.create(req.body);

        return res.status(201).json(game._id);
    } catch (err) {
        return next(err);
    }
});

router.get('/:id/info', middleware.authenticate, async (req, res, next) => {
    try {
        let game = await gameService.getByIdInfo(req.params.id);

        return res.status(200).json(game);
    } catch (err) {
        return next(err);
    }
});

router.get('/:id/galaxy', middleware.authenticate, async (req, res, next) => {
    try {
        let game = await gameGalaxyService.getGalaxy(req.params.id, req.session.userId);

        return res.status(200).json(game);
    } catch (err) {
        return next(err);
    }
});

router.get('/list/official', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await gameListService.listOfficialGames();

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
});

router.get('/list/user', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await gameListService.listUserGames();

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
});

router.get('/list/active', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await gameListService.listActiveGames();

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
});

router.post('/:gameId/join', middleware.authenticate, async (req, res, next) => {
    try {
        await gameService.join(
            req.params.gameId,
            req.session.userId,
            req.body.playerId,
            req.body.alias);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/:gameId/concedeDefeat', middleware.authenticate, async (req, res, next) => {
    try {
        await gameService.concedeDefeat(
            req.params.gameId,
            req.session.userId);
            
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
