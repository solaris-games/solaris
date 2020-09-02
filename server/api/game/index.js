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

    router.get('/api/game/:gameId/info', middleware.authenticate, middleware.loadGameInfo, async (req, res, next) => {
        try {
            return res.status(200).json(req.game);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/history', middleware.authenticate, middleware.loadGameHistory, async (req, res, next) => {
        try {
            return res.status(200).json(req.history);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/galaxy', middleware.authenticate, middleware.loadGameLean, async (req, res, next) => {
        try {
            let game = await container.gameGalaxyService.getGalaxy(req.game, req.session.userId);

            return res.status(200).json(game);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/official', middleware.authenticate, async (req, res, next) => {
        try {
            let games = await container.gameListService.listOfficialGames();

            return res.status(200).json(games);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/list/user', middleware.authenticate, async (req, res, next) => {
        try {
            let games = await container.gameListService.listUserGames();

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

    router.put('/api/game/:gameId/join', middleware.authenticate, middleware.loadGameAll, async (req, res, next) => {
        try {
            let gameIsFull = await container.gameService.join(
                req.game,
                req.session.userId,
                req.body.playerId,
                req.body.alias,
                req.body.avatar,
                req.body.password);

            container.broadcastService.gamePlayerJoined(req.game, req.body.playerId, req.body.alias);

            if (gameIsFull) {
                container.broadcastService.gameStarted(req.game);
            }

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/quit', middleware.authenticate, middleware.loadGameAll, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            let player = await container.gameService.quit(
                req.game,
                req.player);
                
            container.broadcastService.gamePlayerQuit(req.game, player);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/concedeDefeat', middleware.authenticate, middleware.loadGame, middleware.validateGameInProgress, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        try {
            await container.gameService.concedeDefeat(
                req.game,
                req.player);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/player/:playerId', middleware.authenticate, middleware.loadGamePlayers, async (req, res, next) => {
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

    router.get('/api/game/:gameId/events', middleware.authenticate, middleware.loadGameLean, middleware.loadPlayerLean, async (req, res, next) => {
        let startTick = +req.query.startTick || 0;
        
        try {
            let events = await container.eventService.getPlayerEvents(
                req.game,
                req.player,
                startTick
            );

            return res.status(200).json(events);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
