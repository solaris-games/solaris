const ValidationError = require('../errors/validation');

export default (router, io, container) => {
    
    const middleware = require('./middleware')(container);

    router.get('/api/user/leaderboard', async (req, res, next) => {
        try {
            const limit = +req.query.limit || null;
            const result = await container.leaderboardService.getLeaderboard(limit, req.query.sortingKey);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/user/', async (req, res, next) => {
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

            let userId = await container.userService.create({
                email: email,
                username,
                password: req.body.password
            }, ip);

            return res.status(201).json({ id: userId });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/settings', async (req, res, next) => {
        try {
            let settings = await container.userService.getGameSettings(req.session.userId);

            return res.status(200).json(settings);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/settings', middleware.authenticate, async (req, res, next) => {
        try {
            await container.userService.saveGameSettings(req.session.userId, req.body);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/', middleware.authenticate, async (req, res, next) => {
        try {
            let user = await container.userService.getMe(req.session.userId);

            return res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/avatars', middleware.authenticate, async (req, res, next) => {
        try {
            let avatars = await container.avatarService.listUserAvatars(req.session.userId);

            return res.status(200).json(avatars);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/user/avatars/:avatarId/purchase', middleware.authenticate, async (req, res, next) => {
        try {
            await container.avatarService.purchaseAvatar(req.session.userId, parseInt(req.params.avatarId));

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/:id', async (req, res, next) => {
        try {
            let user = await container.userService.getInfoByIdLean(req.params.id);

            return res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/user/achievements/:id', async (req, res, next) => {
        try {
            let achievements = await container.achievementService.getAchievements(req.params.id);

            return res.status(200).json(achievements);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changeEmailPreference', middleware.authenticate, async (req, res, next) => {
        try {
            await container.userService.updateEmailPreference(req.session.userId, req.body.enabled);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changeUsername', middleware.authenticate, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.username) {
            errors.push('Username is a required field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.userService.updateUsername(req.session.userId, req.body.username);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changeEmailAddress', middleware.authenticate, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.email) {
            errors.push('Email is a required field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.userService.updateEmailAddress(req.session.userId, req.body.email);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/user/changePassword', middleware.authenticate, async (req, res, next) => {
        let errors: string[] = [];

        if (!req.body.currentPassword) {
            errors.push('Current password is a required field');
        }

        if (!req.body.newPassword) {
            errors.push('New password is a required field');
        }

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            await container.userService.updatePassword(
                req.session.userId,
                req.body.currentPassword,
                req.body.newPassword);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/user/requestResetPassword', async (req, res, next) => {
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
    }, middleware.handleError);

    router.post('/api/user/resetPassword', async (req, res, next) => {
        if (req.body.token == null || !req.body.token.length) {
            throw new ValidationError(`The token is required`);
        }

        try {
            await container.userService.resetPassword(req.body.token, req.body.newPassword);

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.post('/api/user/requestUsername', async (req, res, next) => {
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
    }, middleware.handleError);

    router.delete('/api/user/closeaccount', middleware.authenticate, async (req, res, next) => {
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
    }, middleware.handleError);

    router.get('/api/user/donations/recent', async (req, res, next) => {
        try {
            let result = await container.donateService.listRecentDonations(3);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
