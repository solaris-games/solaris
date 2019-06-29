const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const gameHelper = require('../data/game');

router.get('/defaultSettings', middleware.authenticate, (req, res, next) => {
    return res.status(200).json(require('../data/db/misc/defaultGameSettings.json'));
});

router.post('/', middleware.authenticate, (req, res, next) => {
    req.body.general.createdByUserId = req.session.userId;

    gameHelper.create(req.body, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(201).json(game._id);
    });
});

router.get('/:id/info', middleware.authenticate, (req, res, next) => {
    gameHelper.getByIdInfo(req.params.id, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(game);
    });
});

router.get('/:id/galaxy', middleware.authenticate, (req, res, next) => {
    gameHelper.getByIdGalaxy(req.params.id, req.session.userId, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(game);
    });
});

router.get('/list/official', middleware.authenticate, (req, res, next) => {
    gameHelper.listOfficialGames((err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

router.get('/list/user', middleware.authenticate, (req, res, next) => {
    gameHelper.listUserGames((err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

router.post('/join', middleware.authenticate, (req, res, next) => {
    gameHelper.join(
        req.body.gameId,
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

module.exports = router;
