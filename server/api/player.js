const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const playerHelper = require('../data/player');

router.post('/:gameId/research/now', middleware.authenticate, (req, res, next) => {
    playerHelper.research.updateResearchNow(req.params.gameId, req.session.userId, req.body.preference, (err) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.sendStatus(200);
    });
});

router.post('/:gameId/research/next', middleware.authenticate, (req, res, next) => {
    playerHelper.research.updateResearchNext(req.params.gameId, req.session.userId, req.body.preference, (err) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.sendStatus(200);
    });
});

module.exports = router;
