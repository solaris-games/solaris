const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');

router.get('/defaultSettings', middleware.authenticate, (req, res, next) => {
    return res.status(200).json({
        settings: require('../../config/game/settings/user/standard.json'),
        options: require('../../config/game/settings/options.json')
    });
}, middleware.handleError);

router.post('/', middleware.authenticate, async (req, res, next) => {
    req.body.general.createdByUserId = req.session.userId;

    try {
        let game = await container.gameCreateService.create(req.body);

        return res.status(201).json(game._id);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/:gameId/info', middleware.authenticate, middleware.loadGameInfo, async (req, res, next) => {
    try {
        return res.status(200).json(req.game);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/:gameId/history', middleware.authenticate, middleware.loadGameHistory, async (req, res, next) => {
    try {
        return res.status(200).json(req.history);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/:gameId/galaxy', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        let game = await container.gameGalaxyService.getGalaxy(req.game, req.session.userId);

        return res.status(200).json(game);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/list/official', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await container.gameListService.listOfficialGames();

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/list/user', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await container.gameListService.listUserGames();

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/list/active', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await container.gameListService.listActiveGames(req.session.userId);

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/list/completed', middleware.authenticate, async (req, res, next) => {
    try {
        let games = await container.gameListService.listCompletedGames(req.session.userId);

        return res.status(200).json(games);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/join', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.gameService.join(
            req.game,
            req.session.userId,
            req.body.playerId,
            req.body.alias);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/quit', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.gameService.quit(
            req.game,
            req.session.userId);
            
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.put('/:gameId/concedeDefeat', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.gameService.concedeDefeat(
            req.game,
            req.session.userId);
            
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/:gameId/player/:playerId', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        let user = await container.gameService.getPlayerUser(
            req.game,
            req.params.playerId
        );

        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

module.exports = router;
