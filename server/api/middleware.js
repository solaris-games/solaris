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
        // TODO: If there is an error in the pipleline
        // then test to see what type of error it is. If its a validation
        // error then return a bad request.
        if (err instanceof ValidationError) {
            let errors = err.message;

            if (!Array.isArray(errors)) {
                errors = [errors];
            }

            return res.status(400).json({
                errors
            });
        }

        return next(err);
    },
    
    async loadGame(req, res, next) {
        // If the request URL contains a game id then
        // append it to the request object.
        if (req.params.gameId) {
            req.game = await container.gameService.getById(req.params.gameId);
        }

        return next();
    },
    
    // TODO: This needs to be refactored, everything should always use only the loadGame method
    // instead of this one and pass the game object through to the service.
    async loadGameInfo(req, res, next) {
        // If the request URL contains a game id then
        // append it to the request object.
        if (req.params.gameId) {
            req.game = await container.gameService.getByIdInfo(req.params.gameId);
        }

        return next();
    }

};
