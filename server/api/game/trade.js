const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');

router.post('/:gameId/trade/credits', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.toPlayerId) {
        errors.push('toPlayerId is required.');
    }

    if (req.session.userId === req.body.toPlayerId) {
        errors.push('Cannot send credits to yourself.');
    }
    
    req.body.amount = parseInt(req.body.amount || 0);

    if (!req.body.amount) {
        errors.push('amount is required.');
    }
    
    if (req.body.amount <= 0) {
        errors.push('amount must be greater than 0.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    try {
        await container.tradeService.sendCredits(
            req.params.gameId,
            req.session.userId,
            req.body.toPlayerId,
            req.body.amount);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

router.post('/:gameId/trade/renown', middleware.authenticate, async (req, res, next) => {
    let errors = [];

    if (!req.body.toPlayerId) {
        errors.push('toPlayerId is required.');
    }

    req.body.amount = parseInt(req.body.amount || 0);

    if (!req.body.amount) {
        errors.push('amount is required.');
    }
    
    if (req.body.amount <= 0) {
        errors.push('amount must be greater than 0.');
    }

    if (errors.length) {
        return res.status(400).json({ errors: errors });
    }

    try {
        await container.tradeService.sendRenown(
            req.params.gameId,
            req.session.userId,
            req.body.toPlayerId,
            req.body.amount);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
