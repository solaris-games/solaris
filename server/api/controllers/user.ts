import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../types/DependencyContainer';

export default (container: DependencyContainer, io) => {
    return {
        listLeaderboard: async (req, res, next) => {
            try {
                const limit = +req.query.limit || null;
                const result = await container.leaderboardService.getLeaderboard(limit, req.query.sortingKey);
    
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        },
        create: async (req, res, next) => {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let recaptchaEnabled = container.recaptchaService.isEnabled();
    
            try {
                let errors: string[] = [];
    
                if (!req.body.email) {
                    errors.push('Email is a required field');
                }
    
                if (!req.body.username) {
                    errors.push('Username is a required field');
                }
    
                if (!req.body.password) {
                    errors.push('Password is a required field');
                }
    
                if (recaptchaEnabled && !req.body.recaptchaToken) {
                    errors.push('Recaptcha token is required');
                }
    
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                const email = req.body.email.toLowerCase();
    
                const emailExists = await container.userService.userExists(email);
    
                if (emailExists) {
                    errors.push('An account with this email already exists');
                }
    
                const username = req.body.username;
    
                const usernameExists = await container.userService.usernameExists(username);
    
                if (usernameExists) {
                    errors.push('An account with this username already exists');
                }
    
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                // Before we create a new account, verify that the user is not a robot.
                if (recaptchaEnabled) {
                    try {
                        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
                        await container.recaptchaService.verify(ip, req.body.recaptchaToken);
                    } catch (err) {
                        throw new ValidationError(['Recaptcha is invalid']);
                    }
                }
    
                let userId = await container.userService.create(email, username, req.body.password, ip);
    
                return res.status(201).json({ id: userId });
            } catch (err) {
                return next(err);
            }
        },
        getSettings: async (req, res, next) => {
            try {
                let settings = await container.userService.getGameSettings(req.session.userId);
    
                return res.status(200).json(settings);
            } catch (err) {
                return next(err);
            }
        },
        saveSettings: async (req, res, next) => {
            try {
                await container.userService.saveGameSettings(req.session.userId, req.body);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        getSubscriptions: async (req, res, next) => {
            try {
                let subscriptions = await container.userService.getSubscriptions(req.session.userId);
    
                return res.status(200).json(subscriptions);
            } catch (err) {
                return next(err);
            }
        },
        saveSubscriptions: async (req, res, next) => {
            try {
                await container.userService.saveSubscriptions(req.session.userId, req.body);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        getCredits: async (req, res, next) => {
            try {
                let credits = await container.userService.getCredits(req.session.userId);
    
                return res.status(200).json({
                    credits
                });
            } catch (err) {
                return next(err);
            }
        },
        detailMe: async (req, res, next) => {
            try {
                let user = await container.userService.getMe(req.session.userId);
    
                return res.status(200).json(user);
            } catch (err) {
                return next(err);
            }
        },
        listMyAvatars: async (req, res, next) => {
            try {
                let avatars = await container.avatarService.listUserAvatars(req.session.userId);
    
                return res.status(200).json(avatars);
            } catch (err) {
                return next(err);
            }
        },
        purchaseAvatar: async (req, res, next) => {
            try {
                await container.avatarService.purchaseAvatar(req.session.userId, parseInt(req.params.avatarId));
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        detail: async (req, res, next) => {
            try {
                let user = await container.userService.getInfoByIdLean(req.params.id);
    
                return res.status(200).json(user);
            } catch (err) {
                return next(err);
            }
        },
        getAchievements: async (req, res, next) => {
            try {
                let achievements = await container.achievementService.getAchievements(req.params.id);
    
                return res.status(200).json(achievements);
            } catch (err) {
                return next(err);
            }
        },
        updateEmailPreference: async (req, res, next) => {
            try {
                await container.userService.updateEmailPreference(req.session.userId, req.body.enabled);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        updateUsername: async (req, res, next) => {
            let errors: string[] = [];
    
            if (!req.body.username) {
                errors.push('Username is a required field');
            }
    
            try {
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                await container.userService.updateUsername(req.session.userId, req.body.username);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        updateEmailAddress: async (req, res, next) => {
            let errors: string[] = [];
    
            if (!req.body.email) {
                errors.push('Email is a required field');
            }
    
            try {
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                await container.userService.updateEmailAddress(req.session.userId, req.body.email);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        updatePassword: async (req, res, next) => {
            let errors: string[] = [];
    
            if (!req.body.currentPassword) {
                errors.push('Current password is a required field');
            }
    
            if (!req.body.newPassword) {
                errors.push('New password is a required field');
            }
    
            try {
                if (errors.length) {
                    throw new ValidationError(errors);
                }
    
                await container.userService.updatePassword(
                    req.session.userId,
                    req.body.currentPassword,
                    req.body.newPassword);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        requestPasswordReset: async (req, res, next) => {
            try {
                let token = await container.userService.requestResetPassword(req.body.email);
    
                try {
                    await container.emailService.sendTemplate(req.body.email, container.emailService.TEMPLATES.RESET_PASSWORD, [token]);
                } catch (emailError) {
                    console.error(emailError);
    
                    return res.sendStatus(500);
                }
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        resetPassword: async (req, res, next) => {
            try {
                if (req.body.token == null || !req.body.token.length) {
                    throw new ValidationError(`The token is required`);
                }
    
                await container.userService.resetPassword(req.body.token, req.body.newPassword);
    
                return res.sendStatus(200);
            } catch (err) {
                return next(err);
            }
        },
        requestUsername: async (req, res, next) => {
            try {
                let username = await container.userService.getUsernameByEmail(req.body.email);
    
                try {
                    await container.emailService.sendTemplate(req.body.email, container.emailService.TEMPLATES.FORGOT_USERNAME, [username]);
                } catch (emailError) {
                    console.error(emailError);
    
                    return res.sendStatus(500);
                }
    
                return res.sendStatus(200);
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
    
                    return res.sendStatus(200);
                });
            } catch (err) {
                return next(err);
            }
        },
        listRecentDonations: async (req, res, next) => {
            try {
                let result = await container.donateService.listRecentDonations();
    
                return res.status(200).json(result);
            } catch (err) {
                return next(err);
            }
        }
    }
};
