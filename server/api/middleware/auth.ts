import ValidationError from '../../errors/validation';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export interface AuthMiddleware {
    authenticate: (options?: AuthenticationOptions | undefined) => (req: any, res: any, next: any) => Promise<any>;
}

export interface AuthenticationOptions {
    admin?: boolean;
    subAdmin?: boolean;
    communityManager?: boolean;
};

export const middleware = (container: DependencyContainer): AuthMiddleware => {
    return {
        authenticate: (options?: AuthenticationOptions) => {
            return async (req, res, next) => {
                try {
                    if (!req.session.userId) {
                        return res.sendStatus(401);
                    }
    
                    // General Auth
                    let isBanned = await container.userService.getUserIsBanned(req.session.userId);
    
                    if (isBanned && !req.session.isImpersonating) {
                        throw new ValidationError(`The account is banned.`, 401);
                    }
    
                    if (!req.session.isImpersonating) {
                        await container.userService.updateLastSeen(req.session.userId, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
                    }
    
                    // Role based authorisation
                    if (options) {
                        if (options.admin) {
                            let isAdmin = await container.userService.getUserIsAdmin(req.session.userId);
            
                            if (!isAdmin) {
                                throw new ValidationError(`The account is not an administrator.`, 401);
                            }
                        }
    
                        if (options.subAdmin) {
                            let isSubAdmin = await container.userService.getUserIsSubAdmin(req.session.userId);
    
                            if (!isSubAdmin) {
                                throw new ValidationError(`The account is not a sub administrator.`, 401);
                            }
                        }
    
                        if (options.communityManager) {
                            let isCommunityManager = await container.userService.getUserIsCommunityManager(req.session.userId);
    
                            if (!isCommunityManager) {
                                throw new ValidationError(`The account is not a community manager.`, 401);
                            }
                        }
                    }
    
                    next();
                } catch(err) {
                    next(err);
                }
            };
        }
    };
};
