import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import UserController from '../controllers/user';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);

    const controller = UserController(container, io);

    router.get('/api/user/leaderboard',
        controller.listLeaderboard,
        mwCore.handleError);

    router.post('/api/user/',
        controller.create,
        mwCore.handleError);

    router.get('/api/user/settings',
        controller.getSettings,
        mwCore.handleError);

    router.put('/api/user/settings',
        mwAuth.authenticate(),
        controller.saveSettings,
        mwCore.handleError);

    router.get('/api/user/subscriptions',
        mwAuth.authenticate(),
        controller.getSubscriptions,
        mwCore.handleError);

    router.put('/api/user/subscriptions',
        mwAuth.authenticate(),
        controller.saveSubscriptions,
        mwCore.handleError);

    router.get('/api/user/credits',
        mwAuth.authenticate(),
        controller.getCredits,
        mwCore.handleError);

    router.get('/api/user/',
        mwAuth.authenticate(),
        controller.detailMe,
        mwCore.handleError);

    router.get('/api/user/avatars',
        mwAuth.authenticate(),
        controller.listMyAvatars,
        mwCore.handleError);

    router.post('/api/user/avatars/:avatarId/purchase',
        mwAuth.authenticate(),
        controller.purchaseAvatar,
        mwCore.handleError);

    router.get('/api/user/:id',
        controller.detail,
        mwCore.handleError);

    router.get('/api/user/achievements/:id',
        controller.getAchievements,
        mwCore.handleError);

    router.put('/api/user/changeEmailPreference',
        mwAuth.authenticate(),
        controller.updateEmailPreference,
        mwCore.handleError);

    router.put('/api/user/changeUsername',
        mwAuth.authenticate(),
        controller.updateUsername,
        mwCore.handleError);

    router.put('/api/user/changeEmailAddress',
        mwAuth.authenticate(),
        controller.updateEmailAddress,
        mwCore.handleError);

    router.put('/api/user/changePassword',
        mwAuth.authenticate(),
        controller.updatePassword,
        mwCore.handleError);

    router.post('/api/user/requestResetPassword',
        controller.requestPasswordReset,
        mwCore.handleError);

    router.post('/api/user/resetPassword',
        controller.resetPassword,
        mwCore.handleError);

    router.post('/api/user/requestUsername',
        controller.requestUsername,
        mwCore.handleError);

    router.delete('/api/user/closeaccount',
        mwAuth.authenticate(),
        controller.delete,
        mwCore.handleError);

    router.get('/api/user/donations/recent',
        controller.listRecentDonations,
        mwCore.handleError);

    return router;
}