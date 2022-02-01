export default (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/events', middleware.authenticate, middleware.loadGameLean, middleware.loadPlayer, async (req, res, next) => {
        let startTick = +req.query.startTick || 0;
        
        try {
            let events = await container.eventService.getPlayerEvents(
                req.game._id,
                req.player,
                startTick
            );

            return res.status(200).json(events);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/events/markAsRead', middleware.authenticate,middleware.loadGameLean, middleware.validateGameLocked, middleware.loadPlayer, async (req, res, next) => {
        if (req.session.isImpersonating) {
            return res.sendStatus(200);
        }

        try {
            await container.eventService.markAllEventsAsRead(
                req.game,
                req.player._id);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/events/:eventId/markAsRead', middleware.authenticate,middleware.loadGameLean, middleware.validateGameLocked, middleware.loadPlayer, async (req, res, next) => {
        if (req.session.isImpersonating) {
            return res.sendStatus(200);
        }
        
        try {
            await container.eventService.markEventAsRead(
                req.game,
                req.player._id,
                req.params.eventId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/events/trade', middleware.authenticate, middleware.loadGameLean, middleware.loadPlayer, async (req, res, next) => {
        let startTick = +req.query.startTick || 0;
        
        try {
            let events = await container.eventService.getPlayerTradeEvents(
                req.game,
                req.player,
                startTick
            );

            return res.status(200).json(events);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/events/unread', middleware.authenticate, middleware.loadGameLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let result = await container.eventService.getUnreadCount(
                req.game,
                req.player._id);

            return res.status(200).json({
                unread: result
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
