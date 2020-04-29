const container = require('./container');

const ValidationError = require('../errors/validation');

module.exports = {

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
    
    async loadGameInfo(req, res, next) {
        if (req.params.gameId) {
            req.game = await container.gameService.getByIdInfo(req.params.gameId);
        }

        return next();
    },

    async loadGameMessages(req, res, next) {
        if (req.params.gameId) {
            req.game = await container.gameService.getByIdMessages(req.params.gameId);
        }

        return next();
    },

    async loadGameHistory(req, res, next) {
        if (req.params.gameId) {
            req.history = await container.historyService.listByGameId(req.params.gameId);
        }

        return next();
    }

};
