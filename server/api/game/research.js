const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');

router.post('/:gameId/research/now', middleware.authenticate, async (req, res, next) => {
    try {
        await container.researchService.updateResearchNow(req.params.gameId, req.session.userId, req.body.preference);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/:gameId/research/next', middleware.authenticate, async (req, res, next) => {
    try {
        await container.researchService.updateResearchNext(req.params.gameId, req.session.userId, req.body.preference);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
