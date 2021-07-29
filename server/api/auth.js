const ValidationError = require('../errors/validation');
const fetch = require('node-fetch');

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
            req.session.isImpersonating = false;

            return res.status(200).json({
                _id: user._id,
                username: user.username
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
            username: req.session.username
        });
    });

    router.get('/api/auth/discord', async (req, res, next) => {
        const code = req.query.code;

        if (code) {
            try {
                const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    body: new URLSearchParams({
                        client_id: clientID,
                        client_secret: clientSecret,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: `http://localhost:${process.env.PORT}/api/auth/discord/token`,
                        scope: 'identify',
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const oauthData = await oauthResult.json();
                console.log(oauthData);
            } catch (error) {
                // NOTE: An unauthorized token will not throw an error;
                // it will return a 401 Unauthorized response in the try block above
                console.error(error);
            }
        }

        return res.sendStatus(200);
    });

    router.get('/api/auth/discord/token', async (req, res, next) => {
        const userResult = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${req.body.token_type} ${req.body.access_token}`,
            },
        });

        console.log(await userResult.json());

        res.sendStatus(200);
    });

    return router;

};
