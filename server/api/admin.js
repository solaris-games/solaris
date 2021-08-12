const ValidationError = require('../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.get('/api/admin/user', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            let result = await container.adminService.listUsers(500);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/contributor', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.setRoleContributor(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.patch('/api/admin/user/:userId/developer', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.setRoleDeveloper(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.patch('/api/admin/user/:userId/communityManager', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.setRoleCommunityManager(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.patch('/api/admin/user/:userId/gameMaster', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.setRoleGameMaster(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.patch('/api/admin/user/:userId/credits', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.setCredits(req.params.userId, +req.body.credits);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.patch('/api/admin/user/:userId/ban', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.ban(req.params.userId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.patch('/api/admin/user/:userId/unban', middleware.authenticateAdmin, async (req, res, next) => {
        try {
            await container.adminService.unban(req.params.userId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.post('/api/admin/user/:userId/impersonate', middleware.authenticateAdmin, (req, res, next) => {
        try {
            req.session.userId = req.params.userId;
            req.session.username = req.body.username;
            req.session.roles = req.body.roles;
            req.session.isImpersonating = true;

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    router.get('/api/admin/game', middleware.authenticateSubAdmin, async (req, res, next) => {
        try {
            let result = await container.adminService.listGames();
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/game/:gameId/featured', middleware.authenticateSubAdmin, async (req, res, next) => {
        try {
            await container.adminService.setGameFeatured(req.params.gameId, req.body.featured);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    });

    return router;

};
