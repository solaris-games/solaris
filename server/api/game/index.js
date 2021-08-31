const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/defaultSettings', middleware.authenticate, (req, res, next) => {
        return res.status(200).json({
            settings: require('../../config/game/settings/user/standard.json'),
            options: require('../../config/game/settings/options.json')
        });
    }, middleware.handleError);

    router.post('/api/game/', middleware.authenticate, async (req, res, next) => {
        req.body.general.createdByUserId = req.session.userId;

        try {
            let game = await container.gameCreateService.create(req.body);

            return res.status(201).json(game._id);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/info', middleware.loadGameInfo, async (req, res, next) => {
        try {
            return res.status(200).json(req.game);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/state', middleware.loadGameState, async (req, res, next) => {
        try {
            return res.status(200).json(req.game);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/galaxy', async (req, res, next) => {
        try {
            let tick = +req.query.tick || null;
    
            if (tick != null && tick < 0) {
                throw new ValidationError(`Tick must be greater or equal to 0.`);
            }
    
            let game = await container.gameGalaxyService.getGalaxy(req.params.gameId, req.session.userId, tick);

            return res.status(200).json(game);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/official', async (req, res, next) => {
        try {
            let games = await container.gameListService.listOfficialGames();

            return res.status(200).json(games);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/user', async (req, res, next) => {
        try {
            let games = await container.gameListService.listUserGames();

            return res.status(200).json(games);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/inprogress', async (req, res, next) => {
        try {
            let games = await container.gameListService.listInProgressGames();

            return res.status(200).json(games);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/active', middleware.authenticate, async (req, res, next) => {
        try {
            let games = await container.gameListService.listActiveGames(req.session.userId);

            return res.status(200).json(games);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/completed', middleware.authenticate, async (req, res, next) => {
        try {
            let games = await container.gameListService.listCompletedGames(req.session.userId);

            return res.status(200).json(games);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/intel', middleware.authenticate, async (req, res, next) => {
        try {
            let startTick = +req.query.startTick || 0;
            let endTick = +req.query.endTick || Number.MAX_VALUE;
            
            let result = await container.historyService.listIntel(req.params.gameId, startTick, endTick);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/join', middleware.authenticate, middleware.loadGameAll, middleware.validateGameLocked, async (req, res, next) => {
        try {
            let gameIsFull = await container.gameService.join(
                req.game,
                req.session.userId,
                req.body.playerId,
                req.body.alias,
                req.body.avatar,
                req.body.password);

            res.sendStatus(200);

            container.broadcastService.gamePlayerJoined(req.game, req.body.playerId, req.body.alias, req.body.avatar);

            if (gameIsFull) {
                container.broadcastService.gameStarted(req.game);
            }
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/quit', middleware.authenticate, middleware.loadGameAll, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let player = await container.gameService.quit(
                req.game,
                req.player);

            res.sendStatus(200);
                
            container.broadcastService.gamePlayerQuit(req.game, player);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/concedeDefeat', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.gameService.concedeDefeat(
                req.game,
                req.player);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/ready', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.playerService.declareReady(
                req.game,
                req.player);
            
            res.sendStatus(200);

            container.broadcastService.gamePlayerReady(req.game, req.player);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/notready', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.playerService.undeclareReady(
                req.game,
                req.player);

            res.sendStatus(200);
                
            container.broadcastService.gamePlayerNotReady(req.game, req.player);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/readyToQuit', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.playerService.declareReadyToQuit(
                req.game,
                req.player);
            
            res.sendStatus(200);

            container.broadcastService.gamePlayerReadyToQuit(req.game, req.player);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/notReadyToQuit', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.playerService.undeclareReadyToQuit(
                req.game,
                req.player);

            res.sendStatus(200);
                
            container.broadcastService.gamePlayerNotReadyToQuit(req.game, req.player);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/notes', middleware.authenticate, middleware.loadGame, middleware.loadPlayer, async (req, res, next) => {
        try {
            let notes = await container.playerService.getGameNotes(
                req.game,
                req.player);
            
            res.status(200).json({ notes });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/notes', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.loadPlayer, async (req, res, next) => {
        try {
            await container.playerService.updateGameNotes(
                req.game,
                req.player,
                req.body.notes);
            
            res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.delete('/api/game/:gameId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, async (req, res, next) => {
        try {
            await container.gameService.delete(
                req.game,
                req.session.userId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/player/:playerId', middleware.loadGamePlayers, async (req, res, next) => {
        try {
            let user = await container.gameService.getPlayerUserLean(
                req.game,
                req.params.playerId
            );

            return res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/game/:gameId/player/touch', middleware.authenticate, async (req, res, next) => {
        try {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            if (!req.session.isImpersonating) {
                await container.playerService.updateLastSeenLean(req.params.gameId, req.session.userId, ip);
            }
            
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);    

    return router;

};
