import ValidationError from '../errors/validation';
import Middleware from './middleware';

export default (router, io, container) => {

    const middleware = Middleware(container);

    router.post('/api/auth/login', async (req, res, next) => {        
        let errors: string[] = [];
    
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

    return router;

};
