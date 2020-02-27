const express = require('express');
const router = express.Router();
const middleware = require('./middleware');
const ResearchService = require('../services/research');

const researchService = new ResearchService();

router.post('/:gameId/research/now', middleware.authenticate, (req, res, next) => {
    researchService.updateResearchNow(req.params.gameId, req.session.userId, req.body.preference, (err) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.sendStatus(200);
    });
});

router.post('/:gameId/research/next', middleware.authenticate, (req, res, next) => {
    researchService.updateResearchNext(req.params.gameId, req.session.userId, req.body.preference, (err) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.sendStatus(200);
    });
});

module.exports = router;
