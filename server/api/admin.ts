import { Router } from 'express';
import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';
import Middleware from './middleware';

export default (router: Router, io: any, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.get('/api/admin/user', middleware.authenticateCommunityManager, async (req: any, res: any, next: any) => {
        try {
            let result = await container.adminService.listUsers(req.session.roles.administrator, 300);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/admin/passwordresets', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            let result = await container.adminService.listPasswordResets();
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/admin/reports', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            let result = await container.reportService.listReports();
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/contributor', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.setRoleContributor(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/developer', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.setRoleDeveloper(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/communityManager', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.setRoleCommunityManager(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/gameMaster', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.setRoleGameMaster(req.params.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/credits', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.userService.setCredits(req.params.userId, +req.body.credits);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/ban', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.ban(req.params.userId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/unban', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.unban(req.params.userId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/resetAchievements', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.resetAchievements(req.params.userId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/user/:userId/promoteToEstablishedPlayer', middleware.authenticateCommunityManager, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.promoteToEstablishedPlayer(req.params.userId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/admin/user/:userId/impersonate', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            const user = await container.userService.getById(req.params.userId);

            if (!user) {
                throw new ValidationError(`User does not exist.`);
            }

            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.roles = user.roles;
            req.session.userCredits = user.credits;
            req.session.isImpersonating = true;

            return res.status(200).json({
                _id: user._id,
                username: user.username,
                roles: user.roles,
                credits: user.credits
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/admin/game', middleware.authenticateSubAdmin, async (req: any, res: any, next: any) => {
        try {
            let result = await container.adminService.listGames(100);
            
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/game/:gameId/featured', middleware.authenticateSubAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.setGameFeatured(req.params.gameId, req.body.featured);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/game/:gameId/timeMachine', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.adminService.setGameTimeMachine(req.params.gameId, req.body.timeMachine);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/game/:gameId/finish', middleware.authenticateAdmin, middleware.loadGamePlayersSettingsState, middleware.validateGameLocked, middleware.validateGameInProgress, async (req: any, res: any, next: any) => {
        try {
            await container.gameService.forceAllUndefeatedPlayersReadyToQuit(req.game);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/admin/reports/:reportId/action', middleware.authenticateAdmin, async (req: any, res: any, next: any) => {
        try {
            await container.reportService.actionReport(req.params.reportId);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
