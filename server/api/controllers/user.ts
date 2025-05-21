import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';
import {
    mapToUserRequestPasswordResetRequest,
    mapToUserRequestUsernameRequest,
    mapToUserResetPasswordResetRequest,
    mapToUserUpdateEmailPreferenceRequest,
    mapToUserUpdateEmailRequest,
    mapToUserUpdatePasswordRequest,
    mapToUserUpdateUsernameRequest,
    parseCreateUserRequest
} from '../requests/user';
import {logger} from "../../utils/logging";

const log = logger("User Controller");

export default (container: DependencyContainer) => {
    return {
        listLeaderboard: async (req, res, next) => {
            try {
                const limit = +req.query.limit || null;
                const result = await container.userLeaderboardService.getUserLeaderboard(limit, req.query.sortingKey);
    
                res.status(200).json(result);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        create: async (req, res, next) => {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            try {
                const reqObj = parseCreateUserRequest(req.body);

                const email = reqObj.email.toLowerCase();
    
                const emailExists = await container.userService.userExists(email);
    
                if (emailExists) {
                    throw new ValidationError('An account with this email already exists');
                }
    
                const username = reqObj.username;
    
                const usernameExists = await container.userService.usernameExists(username);
    
                if (usernameExists) {
                    throw new ValidationError('An account with this username already exists');
                }
    
                const userId = await container.userService.create(email, username, reqObj.password, ip);
    
                res.status(201).json({ id: userId });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getSettings: async (req, res, next) => {
            try {
                const settings = await container.userService.getGameSettings(req.session.userId);
    
                res.status(200).json(settings);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        saveSettings: async (req, res, next) => {
            try {
                await container.userService.saveGameSettings(req.session.userId, req.body);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getSubscriptions: async (req, res, next) => {
            try {
                let subscriptions = await container.userService.getSubscriptions(req.session.userId);
    
                res.status(200).json(subscriptions);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        saveSubscriptions: async (req, res, next) => {
            try {
                await container.userService.saveSubscriptions(req.session.userId, req.body);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getCredits: async (req, res, next) => {
            try {
                let credits = await container.userService.getCredits(req.session.userId);
    
                res.status(200).json({
                    credits
                });
                return next();
            } catch (err) {
                return next(err);
            }
        },
        detailMe: async (req, res, next) => {
            try {
                let user = await container.userService.getMe(req.session.userId);

                if (!user) {
                    res.sendStatus(404);
                    return next();
                }

                req.session.userId = user._id;
                req.session.username = user.username;
                req.session.roles = user.roles;
                req.session.userCredits = user.credits;

                res.status(200).json(user);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        listMyAvatars: async (req, res, next) => {
            try {
                let avatars = await container.avatarService.listUserAvatars(req.session.userId);
    
                res.status(200).json(avatars);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        purchaseAvatar: async (req, res, next) => {
            try {
                await container.avatarService.purchaseAvatar(req.session.userId, parseInt(req.params.avatarId));
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        getAchievements: async (req, res, next) => {
            try {
                let achievements = await container.achievementService.getAchievements(req.params.id);
    
                res.status(200).json(achievements);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updateEmailPreference: async (req, res, next) => {
            try {
                const reqObj = mapToUserUpdateEmailPreferenceRequest(req.body);
    
                await container.userService.updateEmailPreference(req.session.userId, reqObj.enabled);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updateEmailOtherPreference: async (req, res, next) => {
            try {
                const reqObj = mapToUserUpdateEmailPreferenceRequest(req.body);
    
                await container.userService.updateEmailOtherPreference(req.session.userId, reqObj.enabled);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updateUsername: async (req, res, next) => {
            try {
                const reqObj = mapToUserUpdateUsernameRequest(req.body);
                
                await container.userService.updateUsername(req.session.userId, reqObj.username);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updateEmailAddress: async (req, res, next) => {
            try {
                const reqObj = mapToUserUpdateEmailRequest(req.body);
                
                await container.userService.updateEmailAddress(req.session.userId, reqObj.email);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        updatePassword: async (req, res, next) => {
            try {
                const reqObj = mapToUserUpdatePasswordRequest(req.body);
                
                await container.userService.updatePassword(
                    req.session.userId,
                    reqObj.currentPassword,
                    reqObj.newPassword);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        requestPasswordReset: async (req, res, next) => {
            try {
                const reqObj = mapToUserRequestPasswordResetRequest(req.body);
                
                let token = await container.userService.requestResetPassword(reqObj.email);
    
                try {
                    await container.emailService.sendTemplate(reqObj.email, container.emailService.TEMPLATES.RESET_PASSWORD, [token]);
                } catch (emailError) {
                    log.error(emailError);
                    res.sendStatus(500);
                    return next(emailError);
                }
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        resetPassword: async (req, res, next) => {
            try {
                const reqObj = mapToUserResetPasswordResetRequest(req.body);
                
                await container.userService.resetPassword(reqObj.token, reqObj.newPassword);
    
                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        requestUsername: async (req, res, next) => {
            try {
                const reqObj = mapToUserRequestUsernameRequest(req.body);
                
                let username = await container.userService.getUsernameByEmail(reqObj.email);
    
                try {
                    await container.emailService.sendTemplate(reqObj.email, container.emailService.TEMPLATES.FORGOT_USERNAME, [username]);
                } catch (emailError) {
                    log.error(emailError);
    
                    res.sendStatus(500);
                    return next(emailError);
                }

                res.sendStatus(200);
                return next();
            } catch (err) {
                return next(err);
            }
        },
        delete: async (req, res, next) => {
            try {
                await container.gameService.quitAllActiveGames(req.session.userId);
                await container.guildService.tryLeave(req.session.userId);
                await container.guildService.declineAllInvitations(req.session.userId);
                await container.userService.closeAccount(req.session.userId);
    
                // Delete the session object.
                req.session.destroy((err) => {
                    if (err) {
                        return next(err);
                    }
    
                    res.sendStatus(200);
                    return next();
                });
            } catch (err) {
                return next(err);
            }
        }
    }
};
