const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const GameService = require('../services/game');

const gameService = new GameService();

router.get('/defaultSettings', middleware.authenticate, (req, res, next) => {
    return res.status(200).json(require('../config/game/defaultGameSettings.json'));
});

router.post('/', middleware.authenticate, (req, res, next) => {
    req.body.general.createdByUserId = req.session.userId;

    gameService.create(req.body, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(201).json(game._id);
    });
});

router.get('/:id/info', middleware.authenticate, (req, res, next) => {
    gameService.getByIdInfo(req.params.id, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(game);
    });
});

router.get('/:id/galaxy', middleware.authenticate, (req, res, next) => {
    gameService.getByIdGalaxy(req.params.id, req.session.userId, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(game);
    });
});

router.get('/list/official', middleware.authenticate, (req, res, next) => {
    gameService.listOfficialGames((err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

router.get('/list/user', middleware.authenticate, (req, res, next) => {
    gameService.listUserGames((err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

router.get('/list/active', middleware.authenticate, (req, res, next) => {
    gameService.listActiveGames(req.session.userId, (err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

router.post('/:gameId/join', middleware.authenticate, (req, res, next) => {
    gameService.join(
        req.params.gameId,
        req.session.userId,
        req.body.playerId,
        req.body.raceId,
        req.body.alias,
        (err) => {
            if (err) {
                return res.status(401).json(err);
            }

            return res.sendStatus(200);
        });
});

router.post('/:gameId/concedeDefeat', middleware.authenticate, (req, res, next) => {
    gameService.concedeDefeat(
        req.params.gameId,
        req.session.userId,
        (err) => {
            if (err) {
                return res.status(401).json(err);
            }

            return res.sendStatus(200);
        });
});

module.exports = router;
