const ValidationError = require('../errors/validation');

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
            let userId = await container.authService.login(req.body.email, req.body.password);
    
            // Store the user id in the session.
            req.session.userId = userId;

            return res.status(200).json({id: userId});
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
            valid: req.session.userId != null
        });
    });

    return router;

};
