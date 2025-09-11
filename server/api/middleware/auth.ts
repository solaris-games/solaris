import { Request } from 'express';
import { ValidationError } from '@solaris-common';
import { DependencyContainer } from '../../services/types/DependencyContainer';

export interface AuthMiddleware {
    authenticate: (options?: AuthenticationOptions | undefined) => (req: any, res: any, next: any) => Promise<any>;
}

export interface AuthenticationOptions {
    admin?: boolean;
    subAdmin?: boolean;
    communityManager?: boolean;
    adminImpersonatingAnotherUser?: boolean;
};

export const middleware = (container: DependencyContainer): AuthMiddleware => {
    return {
        authenticate: (options?: AuthenticationOptions) => {
            return async (req: Request<unknown>, res, next) => {
                try {
                    if (!req.session.userId) {
                        throw new ValidationError('Access denied.', 401);
                    }
    
                    // General Auth
                    let isBanned = await container.userService.getUserIsBanned(req.session.userId);
    
                    if (isBanned && !req.session.isImpersonating) {
                        throw new ValidationError(`The account is banned.`, 401);
                    }
    
                    if (!req.session.isImpersonating) {
                        await container.userService.updateLastSeen(req.session.userId, req.headers['x-forwarded-for'] as string || req.connection.remoteAddress!);
                    }
    
                    // Role based authorisation
                    if (options) {
                        if (options.admin) {
                            let isAdmin = await container.userService.getUserIsAdmin(req.session.userId);

                            if (!isAdmin) {
                                throw new ValidationError(`The account is not an administrator.`, 401);
                            }
                        }

                        if (options.adminImpersonatingAnotherUser) {
                            let isAdminImpersonatingAnotherUser = false;

                            if (req.session.isImpersonating && req.session.originalUserId != null) {
                                isAdminImpersonatingAnotherUser = await container.userService.getUserIsAdmin(req.session.originalUserId);
                            }
            
                            if (!isAdminImpersonatingAnotherUser) {
                                throw new ValidationError(`The account is not an administrator impersonating another user.`, 401);
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
    
                    return next();
                } catch(err) {
                    return next(err);
                }
            };
        }
    };
};
