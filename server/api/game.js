const express = require('express');
const router = express.Router();
const game = require('../data/game');

router.get('/defaultSettings', (req, res, next) => {
    return res.status(200).json(require('../data/db/misc/defaultGameSettings.json'));
});

router.post('/', (req, res, next) => {
    return res.status(201).json({
        _id: 1
    });
});

router.get('/:id', (req, res, next) => {
    game.getById(req.params.id)
    .then(games => {
        return res.status(200).json(games);
    })
    .catch(err => {
        return res.status(401).json(err);
    });
});

router.get('/list/official', (req, res, next) => {
    game.listOfficialGames()
    .then(games => {
        return res.status(200).json(games);
    })
    .catch(err => {
        return res.status(401).json(err);
    });
});

router.get('/list/user', (req, res, next) => {
    game.listUserGames()
    .then(games => {
        return res.status(200).json(games);
    })
    .catch(err => {
        return res.status(401).json(err);
    });
});

module.exports = router;
