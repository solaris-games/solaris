module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/diplomacy', middleware.authenticate, middleware.loadGameLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let diplomaticStatuses = await container.diplomacyService.getDiplomaticStatusToAllPlayers(
                req.game,
                req.player);

            return res.status(200).json(diplomaticStatuses);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/diplomacy/ally/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let diplomaticStatus = await container.diplomacyService.declareAlly(
                req.game,
                req.player._id,
                req.params.playerId);

            return res.status(200).json(diplomaticStatus);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/diplomacy/enemy/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let diplomaticStatus = await container.diplomacyService.declareEnemy(
                req.game,
                req.player._id,
                req.params.playerId);

            return res.status(200).json(diplomaticStatus);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
