import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export default (container: DependencyContainer) => {
    return {
        getInsights: async (req, res, next) => {
            try {
                let result = await container.adminService.getInsights();
                
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        addWarning: async (req, res, next) => {
           try {
               const result = await container.adminService.addWarning(req.params.userId, req.body.text);

               res.status(200).json(result);
               return next();
           } catch (err) {
               return next(err);
           }
        },
        listUsers: async (req, res, next) => {
            try {
                let result = await container.adminService.listUsers(req.session.roles, 300);
                
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listPasswordResets: async (req, res, next) => {
            try {
                let result = await container.adminService.listPasswordResets();
                
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        conversationForReport: async (req, res, next) => {
            try {
                const result = await container.reportService.conversationForReport(req.params.reportId, req.session.userId);

                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listReports: async (req, res, next) => {
            try {
                let result = await container.reportService.listReports(req.session.userId);
                
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        actionReport: async (req, res, next) => {
            try {
                await container.reportService.actionReport(req.session.userId, req.params.reportId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },

        setRoleContributor: async (req, res, next) => {
            try {
                await container.adminService.setRoleContributor(req.params.userId, req.body.enabled);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setRoleDeveloper: async (req, res, next) => {
            try {
                await container.adminService.setRoleDeveloper(req.params.userId, req.body.enabled);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setRoleGameMaster: async (req, res, next) => {
            try {
                await container.adminService.setRoleGameMaster(req.params.userId, req.body.enabled);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setRoleCommunityManager: async (req, res, next) => {
            try {
                await container.adminService.setRoleCommunityManager(req.params.userId, req.body.enabled);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setCredits: async (req, res, next) => {
            try {
                await container.userService.setCredits(req.params.userId, req.body.credits);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        banUser: async (req, res, next) => {
            try {
                await container.adminService.ban(req.params.userId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        unbanUser: async (req, res, next) => {
            try {
                await container.adminService.unban(req.params.userId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        resetAchievements: async (req, res, next) => {
            try {
                await container.adminService.resetAchievements(req.params.userId);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        promoteToEstablishedPlayer: async (req, res, next) => {
            try {
                await container.adminService.promoteToEstablishedPlayer(req.params.userId);
    
                res.sendStatus(200);
                return next();
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
    
                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    roles: user.roles,
                    credits: user.credits
                });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listGames: async (req, res, next) => {
            try {
                let result = await container.adminService.listGames(100);
                
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setGameFeatured: async (req, res, next) => {
            try {
                await container.adminService.setGameFeatured(req.params.gameId, req.body.featured);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        setGameTimeMachine: async (req, res, next) => {
            try {
                await container.adminService.setGameTimeMachine(req.params.gameId, req.body.timeMachine);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        forceEndGame: async (req, res, next) => {
            try {
                await container.gameService.forceEndGame(req.game);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        resetQuitters: async (req, res, next) => {
            try {
                await container.gameService.resetQuitters(req.game);

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        createAnnouncement: async (req, res, next) => {
            // TODO: validation

            try {
                await container.announcementService.createAnnouncement('', new Date(), '');

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        deleteAnnouncement: async (req, res, next) => {
            try {
                await container.announcementService.deleteAnnouncement(req.params.announcementId);

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        }
    }
};
