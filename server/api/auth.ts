import { Router } from 'express';
import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';
import Middleware from './middleware';

export default (router: Router, io: any, container: DependencyContainer) => {

    const middleware = Middleware(container);

    router.post('/api/auth/login', async (req: any, res: any, next: any) => {        
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
            req.session.userCredits = user.credits;
            req.session.isImpersonating = false;

            return res.status(200).json({
                _id: user._id,
                username: user.username,
                roles: user.roles,
                credits: user.credits
            });
        } catch (err) {
            next(err);
        }
    }, middleware.handleError);
    
    router.post('/api/auth/logout', (req: any, res: any, next: any) => {
        if (req.session) {
            // Delete the session object.
            req.session.destroy((err: any) => {
                if (err) {
                    return next(err);
                }
    
                return res.sendStatus(200);
            });
        } else {
            return res.sendStatus(200);
        }
    }, middleware.handleError);

    router.post('/api/auth/verify', (req: any, res: any, next: any) => {
        const session = (req as any).session;

        return res.status(200).json({
            _id: session.userId,
            username: session.username,
            roles: session.roles,
            credits: session.userCredits
        });
    });

    return router;

};
