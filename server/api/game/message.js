const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/message/conversation/:fromPlayerId', middleware.authenticate, middleware.loadGameMessages, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = await container.messageService.getConversation(
                req.game,
                req.player,
                req.params.fromPlayerId);

            let messageIds = result.map(m => m._id);

            container.broadcastService.gameMessagesRead(req.game, req.player._id, messageIds);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/message/conversations', middleware.authenticate, middleware.loadGameMessages, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = container.messageService.summary(
                req.game,
                req.player);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/message/unread', middleware.authenticate, middleware.loadGameMessages, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = await container.messageService.getUnreadCount(
                req.game,
                req.player);

            return res.status(200).json({ unread: result });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/message/markallread', middleware.authenticate, middleware.loadGameMessages, middleware.loadPlayer, async (req, res, next) => {
        try {
            await container.messageService.markAllAsRead(
                req.game,
                req.player);

            container.broadcastService.gameMessagesAllRead(req.game, req.player._id);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/game/:gameId/message/send', middleware.authenticate, middleware.loadGameMessages, middleware.loadPlayer, async (req, res, next) => {
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
            let message = await container.messageService.send(
                req.game,
                req.player,
                req.body.toPlayerId,
                req.body.message);

            container.broadcastService.gameMessageSent(req.game, message, req.body.toPlayerId)

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
