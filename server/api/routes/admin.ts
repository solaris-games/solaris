import { DependencyContainer } from "../../services/types/DependencyContainer";
import AdminController from '../controllers/admin';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createRoutes} from "../typedapi/routes";
import {createAdminRoutes} from "@solaris/common";
import {DBObjectId} from "../../services/types/DBObjectId";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = AdminController(container);
    const routes = createAdminRoutes<DBObjectId>();

    const answer = createRoutes(router, mw);

    answer(routes.getInsights, mw.auth.authenticate({ admin: true }),
        controller.getInsights);

    answer(routes.listUsers,
            mw.auth.authenticate({ communityManager: true }),
            controller.listUsers
    );

    answer(routes.listPasswordResets,
            mw.auth.authenticate({ admin: true }),
            controller.listPasswordResets
    );

    answer(routes.getConversationForReport, 
            mw.auth.authenticate({ communityManager: true }),
            controller.conversationForReport
    );

    answer(routes.listReports,
        mw.auth.authenticate({ communityManager: true }),
        controller.listReports
    );

    answer(routes.actionReport, 
        mw.auth.authenticate({ communityManager: true }),
        controller.actionReport
    );

    answer(routes.addWarning, mw.auth.authenticate({ communityManager: true }),
        controller.addWarning);

    answer(routes.setRoleContributor,
            mw.auth.authenticate({ admin: true }),
            controller.setRoleContributor
    );

    answer(routes.setRoleDeveloper,
            mw.auth.authenticate({ admin: true }),
            controller.setRoleDeveloper
    );

    answer(routes.setRoleCommunityManager,
            mw.auth.authenticate({ admin: true }),
            controller.setRoleCommunityManager
    );

    answer(routes.setRoleGameMaster,
            mw.auth.authenticate({ admin: true }),
            controller.setRoleGameMaster
    );

    answer(routes.setCredits,
            mw.auth.authenticate({ admin: true }),
            controller.setCredits
    );

    answer(routes.ban,
            mw.auth.authenticate({ communityManager: true }),
            controller.banUser
    );

    answer(routes.unban,
            mw.auth.authenticate({ communityManager: true }),
            controller.unbanUser
    );

    answer(routes.resetAchievements,
            mw.auth.authenticate({ admin: true }),
            controller.resetAchievements
    );

    answer(routes.promoteToEstablishedPlayer,
            mw.auth.authenticate({ communityManager: true }),
            controller.promoteToEstablishedPlayer
    );

    answer(routes.impersonate,
            mw.auth.authenticate({ admin: true }),
            controller.impersonate
    );

    answer(routes.endImpersonate,
        mw.auth.authenticate({ adminImpersonatingAnotherUser: true }),
        controller.endImpersonate
    );

    answer(routes.listGames,
            mw.auth.authenticate({ subAdmin: true }),
            controller.listGames
    );

    answer(routes.setGameFeatured,
            mw.auth.authenticate({ subAdmin: true }),
            controller.setGameFeatured
    );

    answer(routes.setGameTimeMachine,
            mw.auth.authenticate({ subAdmin: true }),
            controller.setGameTimeMachine
    );

    answer(routes.finishGame,
            mw.auth.authenticate({ admin: true }),
            mw.game.loadGame({
                lean: true,
                settings: true,
                state: true,
                'galaxy.players': true
            }),
            mw.game.validateGameState({
                isUnlocked: true,
                isInProgress: true
            }),
            controller.forceEndGame
    );

    answer(routes.createAnnouncement,
        mw.auth.authenticate({ admin: true }),
        controller.createAnnouncement);

    answer(routes.deleteAnnouncement,
        mw.auth.authenticate({ admin: true }),
        controller.deleteAnnouncement);

    answer(routes.getAllAnnouncements,
        mw.auth.authenticate({ admin: true }),
        controller.getAllAnnouncements);

    return router;
}