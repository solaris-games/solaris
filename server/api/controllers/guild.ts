import { DependencyContainer } from '../../services/types/DependencyContainer';
import { mapToGuildCreateGuildRequest, mapToGuildInviteUserRequest, mapToGuildRenameGuildRequest } from '../requests/guild';

export default (container: DependencyContainer) => {
    return {
        list: async (req, res, next) => {
            try {
                let result = await container.guildService.list();
                    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detailMine: async (req, res, next) => {
            try {
                let result = await container.guildService.detailMyGuild(req.session.userId, true);
                    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listLeaderboard: async (req, res, next) => {
            try {
                let limit = +req.query.limit || null;
                let sortingKey = req.query.sortingKey || null;
                let result = await container.guildService.getLeaderboard(limit, sortingKey);
                    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listMyInvites: async (req, res, next) => {
            try {
                let result = await container.guildService.listInvitations(req.session.userId);
                    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listMyApplications: async (req, res, next) => {
            try {
                let result = await container.guildService.listApplications(req.session.userId);
                    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detail: async (req, res, next) => {
            try {
                const result = await container.guildService.detailWithUserInfo(req.params.guildId, false);
    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        create: async (req, res, next) => {
            try {
                const reqObj = mapToGuildCreateGuildRequest(req.body);

                let result = await container.guildService.create(req.session.userId, reqObj.name, reqObj.tag);
                    
                res.status(201).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        rename: async (req, res, next) => {
            try {
                const reqObj = mapToGuildRenameGuildRequest(req.body);
                
                await container.guildService.rename(req.session.userId, reqObj.name, reqObj.tag);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        delete: async (req, res, next) => {
            try {
                await container.guildService.delete(req.session.userId, req.params.guildId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        invite: async (req, res, next) => {
            try {
                const reqObj = mapToGuildInviteUserRequest(req.body);
                
                let result = await container.guildService.invite(reqObj.username, req.params.guildId, req.session.userId);
                    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        uninvite: async (req, res, next) => {
            try {
                await container.guildService.uninvite(req.params.userId, req.params.guildId, req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        acceptInviteForApplicant: async (req, res, next) => {
            try {
                await container.guildService.accept(req.params.userId, req.params.guildId, req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        acceptInvite: async (req, res, next) => {
            try {
                await container.guildService.join(req.session.userId, req.params.guildId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        declineInvite: async (req, res, next) => {
            try {
                await container.guildService.decline(req.session.userId, req.params.guildId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        apply: async (req, res, next) => {
            try {
                await container.guildService.apply(req.session.userId, req.params.guildId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        withdraw: async (req, res, next) => {
            try {
                await container.guildService.withdraw(req.session.userId, req.params.guildId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        reject: async (req, res, next) => {
            try {
                await container.guildService.reject(req.params.userId, req.params.guildId, req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        leave: async (req, res, next) => {
            try {
                await container.guildService.leave(req.session.userId, req.params.guildId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        promote: async (req, res, next) => {
            try {
                await container.guildService.promote(req.params.userId, req.params.guildId, req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        demote: async (req, res, next) => {
            try {
                await container.guildService.demote(req.params.userId, req.params.guildId, req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        kick: async (req, res, next) => {
            try {
                await container.guildService.kick(req.params.userId, req.params.guildId, req.session.userId);
                    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
