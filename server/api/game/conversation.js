const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/conversations', middleware.authenticate, middleware.loadGameConversationsLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = await container.conversationService.list(
                req.game,
                req.player._id);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/conversations/private/:withPlayerId', middleware.authenticate, middleware.loadGameConversationsLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = await container.conversationService.privateChatSummary(
                req.game,
                req.player._id,
                req.params.withPlayerId);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/conversations/unread', middleware.authenticate, middleware.loadGameConversationsLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = container.conversationService.getUnreadCount(
                req.game,
                req.player._id);

            return res.status(200).json({
                unread: result
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/conversations/:conversationId', middleware.authenticate, middleware.loadGameConversationsLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = await container.conversationService.detail(
                req.game,
                req.player._id,
                req.params.conversationId);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/game/:gameId/conversations', middleware.authenticate, middleware.loadGameConversationsLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let errors = [];

            if (!req.body.name || !req.body.name.length) {
                errors.push('name is required.');
            }

            if (!req.body.participants || !req.body.participants.length) {
                errors.push('participants is required.');
            }

            if (errors.length) {
                throw new ValidationError(errors);
            }
            
            let convo = await container.conversationService.create(
                req.game,
                req.player._id,
                req.body.name,
                req.body.participants);

            // TODO: Broadcast convo created.

            return res.status(200).json(convo);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/send', middleware.authenticate, middleware.loadGameConversationsLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let errors = [];

            if (!req.body.message || !req.body.message.length) {
                errors.push('message is required.');
            }

            if (errors.length) {
                throw new ValidationError(errors);
            }
            
            let message = await container.conversationService.send(
                req.game,
                req.player._id,
                req.params.conversationId,
                req.body.message);

            container.broadcastService.gameMessageSent(req.game, message);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/markAsRead', middleware.authenticate, middleware.loadGameConversations, middleware.loadPlayer, async (req, res, next) => {
        try {
            let convo = await container.conversationService.markConversationAsRead(
                req.game,
                req.player._id,
                req.params.conversationId);

            container.broadcastService.gameConversationRead(req.game, convo, req.player._id);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/conversations/:conversationId/leave', middleware.authenticate, middleware.loadGameConversations, middleware.loadPlayer, async (req, res, next) => {
        try {
            let convo = await container.conversationService.leave(
                req.game,
                req.player._id,
                req.params.conversationId);

            container.broadcastService.gameConversationLeft(req.game, convo, req.player._id);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
