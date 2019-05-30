const express = require('express');
const router = express.Router();
const game = require('../data/game');

router.get('/defaultSettings', (req, res, next) => {
    return res.status(200).json(require('../data/db/misc/defaultGameSettings.json'));
});

router.post('/', (req, res, next) => {
    req.body.general.createdByUserId = req.session.userId;

    game.create(req.body, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(201).json(game._id);
    });
});

router.get('/:id', (req, res, next) => {
    game.getById(req.params.id, (err, game) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(game);
    });
});

router.get('/list/official', (req, res, next) => {
    game.listOfficialGames((err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

router.get('/list/user', (req, res, next) => {
    game.listUserGames((err, games) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(games);
    });
});

module.exports = router;
