import { Router } from "express";
import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GuildController from '../controllers/guild';
import { MiddlewareContainer } from "../middleware";

export default (router: Router, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = GuildController(container);

    router.get('/api/guild/list',
        mw.auth.authenticate(),
        controller.list,
        mw.core.handleError);

    router.get('/api/guild',
        mw.auth.authenticate(),
        controller.detailMine,
        mw.core.handleError);

    router.get('/api/guild/leaderboard',
        controller.listLeaderboard,
        mw.core.handleError);

    router.get('/api/guild/invites',
        mw.auth.authenticate(),
        controller.listMyInvites,
        mw.core.handleError);

    router.get('/api/guild/applications',
        mw.auth.authenticate(),
        controller.listMyApplications,
        mw.core.handleError);

    router.get('/api/guild/:guildId',
        mw.auth.authenticate(),
        controller.detail,
        mw.core.handleError);

    router.post('/api/guild',
        mw.auth.authenticate(),
        controller.create,
        mw.core.handleError);

    router.patch('/api/guild',
        mw.auth.authenticate(),
        controller.rename,
        mw.core.handleError);
        
    router.delete('/api/guild/:guildId',
        mw.auth.authenticate(),
        controller.delete,
        mw.core.handleError);

    router.put('/api/guild/:guildId/invite',
        mw.auth.authenticate(),
        controller.invite,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/uninvite/:userId',
        mw.auth.authenticate(),
        controller.uninvite,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/accept/:userId',
        mw.auth.authenticate(),
        controller.acceptInviteForApplicant,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/accept',
        mw.auth.authenticate(),
        controller.acceptInvite,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/decline',
        mw.auth.authenticate(),
        controller.declineInvite,
        mw.core.handleError);

    router.put('/api/guild/:guildId/apply',
        mw.auth.authenticate(),
        controller.apply,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/withdraw',
        mw.auth.authenticate(),
        controller.withdraw,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/reject/:userId',
        mw.auth.authenticate(),
        controller.reject,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/leave',
        mw.auth.authenticate(),
        controller.leave,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/promote/:userId',
        mw.auth.authenticate(),
        controller.promote,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/demote/:userId',
        mw.auth.authenticate(),
        controller.demote,
        mw.core.handleError);

    router.patch('/api/guild/:guildId/kick/:userId',
        mw.auth.authenticate(),
        controller.kick,
        mw.core.handleError);

    return router;
}