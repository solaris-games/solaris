const ValidationError = require('../errors/validation');
const axios = require('axios');

module.exports = (router, io, container) => {

    const middleware = require('./middleware')(container);

    router.post('/api/auth/login', async (req, res, next) => {        
        let errors = [];
    
        if (!req.body.email) {
            errors.push('Email is a required field');
        }
    
        if (!req.body.password) {
            errors.push('Password is a required field');
        }
    
        if (errors.length) {
            throw new ValidationError(errors);
        }
    
        try {
            let user = await container.authService.login(req.body.email, req.body.password);
    
            // Store the user id in the session.
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.roles = user.roles;
            req.session.isImpersonating = false;

            return res.status(200).json({
                _id: user._id,
                username: user.username,
                roles: user.roles
            });
        } catch (err) {
            next(err);
        }
    }, middleware.handleError);
    
    router.post('/api/auth/logout', (req, res, next) => {
        if (req.session) {
            // Delete the session object.
            req.session.destroy((err) => {
                if (err) {
                    return next(err);
                }
    
                return res.sendStatus(200);
            });
        } else {
            return res.sendStatus(200);
        }
    }, middleware.handleError);

    router.post('/api/auth/verify', (req, res, next) => {
        return res.status(200).json({
            _id: req.session.userId,
            username: req.session.username,
            roles: req.session.roles
        });
    });

    // TODO: This should be in another api file. oauth.js?
    router.get('/api/auth/discord', async (req, res, next) => {
        const code = req.query.code;

        if (code) {
            try {
                await container.authService.clearOauthDiscord(req.session.userId);

                const params = new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENTID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: process.env.DISCORD_OAUTH_REDIRECT_URI,
                    scope: 'identify',
                });

                const oauthResult = await axios.post('https://discord.com/api/oauth2/token', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });

                if (oauthResult.status === 200) {
                    const userResult = await axios.get('https://discord.com/api/users/@me', {
                        headers: {
                            authorization: `${oauthResult.data.token_type} ${oauthResult.data.access_token}`,
                        },
                    });

                    if (userResult.status === 200) {
                        await container.authService.updateOauthDiscord(req.session.userId, userResult.data.id, oauthResult.data);
        
                        return res.redirect(`${process.env.CLIENT_URL_ACCOUNT_SETTINGS}?discordSuccess=true`);
                    }
                }
            } catch (error) {
                // NOTE: An unauthorized token will not throw an error;
                // it will return a 401 Unauthorized response in the try block above
                console.error(error);
            }
        }

        return res.redirect(`${process.env.CLIENT_URL_ACCOUNT_SETTINGS}?discordSuccess=false`);
    });

    return router;

};
