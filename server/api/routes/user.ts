import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import UserController from '../controllers/user';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import { createUserRoutes } from "solaris-common";
import { createRoutes } from "../typedapi/routes";
import {DBObjectId} from "../../services/types/DBObjectId";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = UserController(container);
    const routes = createUserRoutes<DBObjectId>();

    const answer = createRoutes(router, mw);

    answer(routes.listLeaderboard, controller.listLeaderboard);

    answer(routes.createUser, controller.create);

    answer(routes.getSettings, mw.auth.authenticate(), controller.getSettings);

    answer(routes.saveSettings, mw.auth.authenticate(), controller.saveSettings);

    answer(routes.getSubscriptions, mw.auth.authenticate(), controller.getSubscriptions);

    answer(routes.saveSubscriptions, mw.auth.authenticate(), controller.saveSubscriptions);
    
    answer(routes.getCredits, mw.auth.authenticate(), controller.getCredits);

    answer(routes.detailMe, mw.auth.authenticate(), controller.detailMe);
    
    answer(routes.listMyAvatars, mw.auth.authenticate(), controller.listMyAvatars);

    answer(routes.purchaseAvatar, mw.auth.authenticate(), controller.purchaseAvatar);

    answer(routes.getAchievements, controller.getAchievements);

    answer(routes.updateEmailPreference, mw.auth.authenticate(), controller.updateEmailPreference);

    answer(routes.updateEmailOtherPreference, mw.auth.authenticate(), controller.updateEmailOtherPreference);

    answer(routes.updateUsername, mw.auth.authenticate(), controller.updateUsername);

    answer(routes.updateEmailAddress, mw.auth.authenticate(), controller.updateEmailAddress);

    answer(routes.updatePassword, mw.auth.authenticate(), controller.updatePassword);

    answer(routes.requestPasswordReset, controller.requestPasswordReset);

    answer(routes.resetPassword, controller.resetPassword);

    answer(routes.requestUsername, controller.requestUsername);

    answer(routes.deleteUser, mw.auth.authenticate(), controller.delete);

    return router;
}