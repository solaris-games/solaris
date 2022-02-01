import Middleware from '../middleware';

export default (router, io, container) => {

    const middleware = Middleware(container);

    router.get('/api/game/:gameId/diplomacy', middleware.authenticate, middleware.loadGameDiplomacyLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let diplomaticStatuses = await container.diplomacyService.getDiplomaticStatusToAllPlayers(
                req.game,
                req.player);

            return res.status(200).json(diplomaticStatuses);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/diplomacy/:toPlayerId', middleware.authenticate, middleware.loadGameDiplomacyLean, middleware.loadPlayer, async (req, res, next) => {
        try {
            let diplomaticStatus = await container.diplomacyService.getDiplomaticStatusToPlayer(
                req.game,
                req.player._id,
                req.params.toPlayerId);

            return res.status(200).json(diplomaticStatus);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/diplomacy/ally/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let newStatus = await container.diplomacyService.declareAlly(
                req.game,
                req.player._id,
                req.params.playerId);

            await container.broadcastService.gamePlayerDiplomaticStatusChanged(req.player._id, req.params.playerId, newStatus);

            return res.status(200).json(newStatus);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/diplomacy/enemy/:playerId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let newStatus = await container.diplomacyService.declareEnemy(
                req.game,
                req.player._id,
                req.params.playerId);

            await container.broadcastService.gamePlayerDiplomaticStatusChanged(req.player._id, req.params.playerId, newStatus);

            return res.status(200).json(newStatus);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
