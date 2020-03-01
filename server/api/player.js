const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const GameService = require('../services/game');
const ResearchService = require('../services/research');

const gameService = new GameService();
const researchService = new ResearchService(gameService);

router.post('/:gameId/research/now', middleware.authenticate, async (req, res, next) => {
    try {
        await researchService.updateResearchNow(req.params.gameId, req.session.userId, req.body.preference);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/:gameId/research/next', middleware.authenticate, async (req, res, next) => {
    try {
        await researchService.updateResearchNext(req.params.gameId, req.session.userId, req.body.preference);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
