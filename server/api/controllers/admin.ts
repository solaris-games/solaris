import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';
import { mapToAdminSetGameFeaturedRequest, mapToAdminSetGameTimeMachineRequest, mapToAdminSetUserCreditsRequest, mapToAdminSetUserRoleRequest } from '../requests/admin';

export default (container: DependencyContainer, io) => {
    return {
        listUsers: async (req, res, next) => {
            try {
                let result = await container.adminService.listUsers(req.session.roles.administrator, 300);
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        listPasswordResets: async (req, res, next) => {
            try {
                let result = await container.adminService.listPasswordResets();
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        listReports: async (req, res, next) => {
            try {
                let result = await container.reportService.listReports();
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        actionReport: async (req, res, next) => {
            try {
                await container.reportService.actionReport(req.params.reportId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },

        setRoleContributor: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetUserRoleRequest(req.body);

                await container.adminService.setRoleContributor(req.params.userId, reqObj.enabled);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        setRoleDeveloper: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetUserRoleRequest(req.body);

                await container.adminService.setRoleDeveloper(req.params.userId, reqObj.enabled);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        setRoleGameMaster: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetUserRoleRequest(req.body);

                await container.adminService.setRoleGameMaster(req.params.userId, reqObj.enabled);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        setRoleCommunityManager: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetUserRoleRequest(req.body);

                await container.adminService.setRoleCommunityManager(req.params.userId, reqObj.enabled);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        setCredits: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetUserCreditsRequest(req.body);

                await container.userService.setCredits(req.params.userId, +reqObj.credits);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        banUser: async (req, res, next) => {
            try {
                await container.adminService.ban(req.params.userId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        unbanUser: async (req, res, next) => {
            try {
                await container.adminService.unban(req.params.userId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        resetAchievements: async (req, res, next) => {
            try {
                await container.adminService.resetAchievements(req.params.userId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        promoteToEstablishedPlayer: async (req, res, next) => {
            try {
                await container.adminService.promoteToEstablishedPlayer(req.params.userId);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        impersonate: async (req, res, next) => {
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
        },
        listGames: async (req, res, next) => {
            try {
                let result = await container.adminService.listGames(100);
                
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        setGameFeatured: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetGameFeaturedRequest(req.body);

                await container.adminService.setGameFeatured(req.params.gameId, reqObj.featured);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        setGameTimeMachine: async (req, res, next) => {
            try {
                const reqObj = mapToAdminSetGameTimeMachineRequest(req.body);

                await container.adminService.setGameTimeMachine(req.params.gameId, reqObj.timeMachine);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        forceEndGame: async (req, res, next) => {
            try {
                await container.gameService.forceEndGame(req.game);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        }
    }
};
