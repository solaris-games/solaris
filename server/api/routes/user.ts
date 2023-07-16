import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import UserController from '../controllers/user';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = UserController(container);

    router.get('/api/user/leaderboard',
        controller.listLeaderboard,
        mw.core.handleError);

    router.post('/api/user/',
        controller.create,
        mw.core.handleError);

    router.get('/api/user/settings',
        controller.getSettings,
        mw.core.handleError);

    router.put('/api/user/settings',
        mw.auth.authenticate(),
        controller.saveSettings,
        mw.core.handleError);

    router.get('/api/user/subscriptions',
        mw.auth.authenticate(),
        controller.getSubscriptions,
        mw.core.handleError);

    router.put('/api/user/subscriptions',
        mw.auth.authenticate(),
        controller.saveSubscriptions,
        mw.core.handleError);

    router.get('/api/user/credits',
        mw.auth.authenticate(),
        controller.getCredits,
        mw.core.handleError);

    router.get('/api/user/',
        mw.auth.authenticate(),
        controller.detailMe,
        mw.core.handleError);

    router.get('/api/user/avatars',
        mw.auth.authenticate(),
        controller.listMyAvatars,
        mw.core.handleError);

    router.post('/api/user/avatars/:avatarId/purchase',
        mw.auth.authenticate(),
        controller.purchaseAvatar,
        mw.core.handleError);

    router.get('/api/user/:id',
        controller.detail,
        mw.core.handleError);

    router.get('/api/user/achievements/:id',
        controller.getAchievements,
        mw.core.handleError);

    router.put('/api/user/changeEmailPreference',
        mw.auth.authenticate(),
        controller.updateEmailPreference,
        mw.core.handleError);

    router.put('/api/user/changeEmailOtherPreference',
        mw.auth.authenticate(),
        controller.updateEmailOtherPreference,
        mw.core.handleError);

    router.put('/api/user/changeUsername',
        mw.auth.authenticate(),
        controller.updateUsername,
        mw.core.handleError);

    router.put('/api/user/changeEmailAddress',
        mw.auth.authenticate(),
        controller.updateEmailAddress,
        mw.core.handleError);

    router.put('/api/user/changePassword',
        mw.auth.authenticate(),
        controller.updatePassword,
        mw.core.handleError);

    router.post('/api/user/requestResetPassword',
        controller.requestPasswordReset,
        mw.core.handleError);

    router.post('/api/user/resetPassword',
        controller.resetPassword,
        mw.core.handleError);

    router.post('/api/user/requestUsername',
        controller.requestUsername,
        mw.core.handleError);

    router.delete('/api/user/closeaccount',
        mw.auth.authenticate(),
        controller.delete,
        mw.core.handleError);

    return router;
}