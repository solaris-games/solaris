import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GuildController from '../controllers/guild';
import { MiddlewareContainer } from "../middleware";
import { singleRoute } from "../singleRoute";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = GuildController(container);

    router.get('/api/guild/list',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.list,
            mw.core.handleError)
    );

    router.get('/api/guild',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.detailMine,
            mw.core.handleError)
    );

    router.get('/api/guild/leaderboard',
        ...singleRoute(
            controller.listLeaderboard,
            mw.core.handleError)
    );

    router.get('/api/guild/invites',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listMyInvites,
            mw.core.handleError)
    );

    router.get('/api/guild/applications',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.listMyApplications,
            mw.core.handleError)
    );

    router.get('/api/guild/:guildId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.detail,
            mw.core.handleError)
    );

    router.post('/api/guild',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.create,
            mw.core.handleError)
    );

    router.patch('/api/guild',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.rename,
            mw.core.handleError)
    );

    router.delete('/api/guild/:guildId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.delete,
            mw.core.handleError)
    );

    router.put('/api/guild/:guildId/invite',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.invite,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/uninvite/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.uninvite,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/accept/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.acceptInviteForApplicant,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/accept',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.acceptInvite,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/decline',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.declineInvite,
            mw.core.handleError)
    );

    router.put('/api/guild/:guildId/apply',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.apply,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/withdraw',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.withdraw,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/reject/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.reject,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/leave',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.leave,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/promote/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.promote,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/demote/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.demote,
            mw.core.handleError)
    );

    router.patch('/api/guild/:guildId/kick/:userId',
        ...singleRoute(
            mw.auth.authenticate(),
            controller.kick,
            mw.core.handleError)
    );

    return router;
}