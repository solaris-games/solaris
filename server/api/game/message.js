const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const container = require('../container');
const ValidationError = require('../../errors/validation');

router.get('/:gameId/message/conversation/:fromPlayerId', middleware.authenticate, middleware.loadGameMessages, async (req, res, next) => {
    try {
        let result = container.messageService.list(
            req.game,
            req.session.userId,
            req.params.fromPlayerId);

        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.get('/:gameId/message/conversations', middleware.authenticate, middleware.loadGameMessages, async (req, res, next) => {
    try {
        let result = container.messageService.summary(
            req.game,
            req.session.userId);

        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

router.post('/:gameId/message/send', middleware.authenticate, middleware.loadGameMessages, async (req, res, next) => {
    let errors = [];

    if (!req.body.toPlayerId) {
        errors.push('toPlayerId is required.');
    }

    if (!req.body.message || !req.body.message.length) {
        errors.push('message is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    try {
        await container.messageService.send(
            req.game,
            req.session.userId,
            req.body.toPlayerId,
            req.body.message);

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
}, middleware.handleError);

module.exports = router;
