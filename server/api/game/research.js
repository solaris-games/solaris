module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.put('/:gameId/research/now', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
        try {
            let eta = await container.researchService.updateResearchNow(req.game, req.session.userId, req.body.preference);
            
            return res.status(200).json(eta);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/:gameId/research/next', middleware.authenticate, middleware.loadGame, async (req, res, next) => {
        try {
            await container.researchService.updateResearchNext(req.game, req.session.userId, req.body.preference);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
