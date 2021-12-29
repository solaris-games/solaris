const ValidationError = require('../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.post('/api/game/:gameId/report', middleware.authenticate, middleware.loadGamePlayers, middleware.loadPlayer, async (req, res, next) => {
        let errors = [];

        if (!req.body.playerId) {
            errors.push('playerId is a required body field');
        }

        if (!req.body.reasons) {
            errors.push('reasons is a required body field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.reportService.reportPlayer(req.game, req.body.playerId, req.session.userId, req.body.reasons);
            
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
