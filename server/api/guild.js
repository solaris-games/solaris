const ValidationError = require('../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.get('/api/guild', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.list();
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/guild/leaderboard', middleware.authenticate, async (req, res, next) => {
        try {
            let limit = +req.query.limit || null;
            let result = await container.guildService.getLeaderboard(limit);
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/guild/invites', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.listInvitations(req.session.userId);
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/guild/mine', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.detailMyGuild(req.session.userId, true);
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/guild', middleware.authenticate, async (req, res, next) => {
        if (!req.body.name) {
            throw new ValidationError(`name is required.`);
        }

        if (!req.body.tag) {
            throw new ValidationError(`tag is required.`);
        }

        try {
            let result = await container.guildService.create(req.session.userId, req.body.name, req.body.tag);
                
            return res.status(201).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.delete('/api/guild/:guildId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.delete(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/guild/:guildId/invite', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.invite(req.body.username, req.params.guildId, req.session.userId);
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/uninvite/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.uninvite(req.params.userId, req.params.guildId, req.session.userId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/acceptInvite', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.acceptInvite(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/declineInvite', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.declineInvite(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/leave', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.leave(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/promote/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.promote(req.params.userId, req.params.guildId, req.session.userId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/demote/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.demote(req.params.userId, req.params.guildId, req.session.userId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/kick/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.kick(req.params.userId, req.params.guildId, req.session.userId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
