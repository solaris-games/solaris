const ValidationError = require('../errors/validation');

module.exports = (container) => {

    return {
        authenticate(req, res, next) {
            if (!req.session.userId) {
                return res.sendStatus(401);
            }

            next();
        },

        handleError(err, req, res, next) {
            // If there is an error in the pipleline
            // then test to see what type of error it is. If its a validation
            // error then return it with its status code.
            if (err instanceof ValidationError) {
                let errors = err.message;

                if (!Array.isArray(errors)) {
                    errors = [errors];
                }

                return res.status(err.statusCode).json({
                    errors
                });
            }

            return next(err);
        },

        async loadGame(req, res, next) {
            // If the request URL contains a game id then
            // append it to the request object.
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdGalaxy(req.params.gameId);
            }

            return next();
        },

        async loadGameLean(req, res, next) {
            // If the request URL contains a game id then
            // append it to the request object.
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdGalaxyLean(req.params.gameId);
            }

            return next();
        },

        async loadGameAll(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdAll(req.params.gameId);
            }

            return next();
        },

        async loadGameInfo(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdInfo(req.params.gameId, req.session.userId);

                delete req.game.settings.general.password;
            }

            return next();
        },

        async loadGameMessages(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdMessages(req.params.gameId);
            }

            return next();
        },

        async loadGameMessagesLean(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdMessagesLean(req.params.gameId);
            }

            return next();
        },

        async loadGameConversations(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdConversations(req.params.gameId);
            }

            return next();
        },

        async loadGameConversationsLean(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdConversationsLean(req.params.gameId);
            }

            return next();
        },

        async loadGamePlayers(req, res, next) {
            if (req.params.gameId) {
                req.game = await container.gameService.getByIdLean(req.params.gameId, {
                    'galaxy.players': 1,
                    'settings': 1
                });
            }

            return next();
        },

        async loadGameHistory(req, res, next) {
            if (req.params.gameId) {
                let startTick = +req.query.startTick || 0;

                req.history = await container.historyService.listByGameId(req.params.gameId, startTick);
            }

            return next();
        },

        async loadPlayer(req, res, next) {
            let player = container.playerService.getByUserId(req.game, req.session.userId);

            if (!player) {
                throw new ValidationError('You are not participating in this game.');
            }

            req.player = player;

            return next();
        },

        validateUndefeatedPlayer(req, res, next) {
            if (req.player.defeated) {
                throw new ValidationError('You cannot participate in this game, you have been defeated.');
            }

            return next();
        },

        // TODO: Does this need a rework because games can be waiting to start?
        validateGameInProgress(req, res, next) {
            if (!container.gameService.isInProgress(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is not in progress.');
            }

            return next();
        },

        // TODO: Does this need a rework because games can be waiting to start?
        validateGameStarted(req, res, next) {
            if (!container.gameService.isStarted(req.game)) {
                throw new ValidationError('You cannot perform this action, the game has not yet started.');
            }

            return next();
        },

        validateGameNotFinished(req, res, next) {
            if (container.gameService.isFinished(req.game)) {
                throw new ValidationError('You cannot perform this action, the game is over.');
            }

            return next();
        }
    }

};
