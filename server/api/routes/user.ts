import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import UserController from '../controllers/user';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = UserController(container);

    router.get('/api/user/leaderboard',
            controller.listLeaderboard
    );

    router.post('/api/user/',
            controller.create
    );

    router.get('/api/user/settings',
            controller.getSettings
    );

    router.put('/api/user/settings',
            mw.auth.authenticate(),
            controller.saveSettings
    );

    router.get('/api/user/subscriptions',
            mw.auth.authenticate(),
            controller.getSubscriptions
    );

    router.put('/api/user/subscriptions',
            mw.auth.authenticate(),
            controller.saveSubscriptions
    );

    router.get('/api/user/credits',
            mw.auth.authenticate(),
            controller.getCredits
    );

    router.get('/api/user/',
            mw.auth.authenticate(),
            controller.detailMe
    );

    router.get('/api/user/avatars',
            mw.auth.authenticate(),
            controller.listMyAvatars
    );

    router.post('/api/user/avatars/:avatarId/purchase',
            mw.auth.authenticate(),
            controller.purchaseAvatar
    );

    router.get('/api/user/achievements/:id',
            controller.getAchievements
    );

    router.put('/api/user/changeEmailPreference',
            mw.auth.authenticate(),
            controller.updateEmailPreference
    );

    router.put('/api/user/changeEmailOtherPreference',
            mw.auth.authenticate(),
            controller.updateEmailOtherPreference
    );

    router.put('/api/user/changeUsername',
            mw.auth.authenticate(),
            controller.updateUsername
    );

    router.put('/api/user/changeEmailAddress',
            mw.auth.authenticate(),
            controller.updateEmailAddress
    );

    router.put('/api/user/changePassword',
            mw.auth.authenticate(),
            controller.updatePassword
    );

    router.post('/api/user/requestResetPassword',
            controller.requestPasswordReset
    );

    router.post('/api/user/resetPassword',
            controller.resetPassword
    );

    router.post('/api/user/requestUsername',
            controller.requestUsername
    );

    router.delete('/api/user/closeaccount',
            mw.auth.authenticate(),
            controller.delete
    );

    return router;
}