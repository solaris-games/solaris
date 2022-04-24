import { Router } from 'express';
import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';
import Middleware from './middleware';

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.get('/api/guild/list', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.list();
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/guild', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.detailMyGuild(req.session.userId, true);
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/guild/leaderboard', middleware.authenticate, async (req, res, next) => {
        try {
            let limit = +req.query.limit || null;
            let sortingKey = req.query.sortingKey || null;
            let result = await container.guildService.getLeaderboard(limit, sortingKey);
                
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

    router.get('/api/guild/applications', middleware.authenticate, async (req, res, next) => {
        try {
            let result = await container.guildService.listApplications(req.session.userId);
                
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/guild/:guildId', middleware.authenticate, async (req, res, next) => {
        try {
            const result = await container.guildService.detailWithUserInfo(req.params.guildId, false);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/guild', middleware.authenticate, async (req, res, next) => {
        try {
            if (!req.body.name) {
                throw new ValidationError(`name is required.`);
            }

            if (!req.body.tag) {
                throw new ValidationError(`tag is required.`);
            }

            let result = await container.guildService.create(req.session.userId, req.body.name, req.body.tag);
                
            return res.status(201).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild', middleware.authenticate, async (req, res, next) => {
        try {
            if (!req.body.name) {
                throw new ValidationError(`name is required.`);
            }

            if (!req.body.tag) {
                throw new ValidationError(`tag is required.`);
            }

            await container.guildService.rename(req.session.userId, req.body.name, req.body.tag);
                
            return res.sendStatus(200);
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

    router.patch('/api/guild/:guildId/accept/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.accept(req.params.userId, req.params.guildId, req.session.userId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/accept', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.join(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/decline', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.decline(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/guild/:guildId/apply', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.apply(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/withdraw', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.withdraw(req.session.userId, req.params.guildId);
                
            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.patch('/api/guild/:guildId/reject/:userId', middleware.authenticate, async (req, res, next) => {
        try {
            await container.guildService.reject(req.params.userId, req.params.guildId, req.session.userId);
                
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
