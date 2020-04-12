const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');

router.post('/:gameId/research/now', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.researchService.updateResearchNow(req.game, req.session.userId, req.body.preference);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.post('/:gameId/research/next', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
    try {
        await container.researchService.updateResearchNext(req.game, req.session.userId, req.body.preference);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

module.exports = router;
