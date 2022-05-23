import { Router } from "express";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GuildController from '../controllers/guild';

import AuthMiddleware from '../middleware/auth';
import CoreMiddleware from '../middleware/core';

export default (router: Router, io, container: DependencyContainer) => {
    const mwCore = CoreMiddleware();
    const mwAuth = AuthMiddleware(container);

    const controller = GuildController(container, io);

    router.get('/api/guild/list',
        mwAuth.authenticate(),
        controller.list,
        mwCore.handleError);

    router.get('/api/guild',
        mwAuth.authenticate(),
        controller.detailMine,
        mwCore.handleError);

    router.get('/api/guild/leaderboard',
        mwAuth.authenticate(),
        controller.listLeaderboard,
        mwCore.handleError);

    router.get('/api/guild/invites',
        mwAuth.authenticate(),
        controller.listMyInvites,
        mwCore.handleError);

    router.get('/api/guild/applications',
        mwAuth.authenticate(),
        controller.listMyApplications,
        mwCore.handleError);

    router.get('/api/guild/:guildId',
        mwAuth.authenticate(),
        controller.detail,
        mwCore.handleError);

    router.post('/api/guild',
        mwAuth.authenticate(),
        controller.create,
        mwCore.handleError);

    router.patch('/api/guild',
        mwAuth.authenticate(),
        controller.rename,
        mwCore.handleError);
        
    router.delete('/api/guild/:guildId',
        mwAuth.authenticate(),
        controller.delete,
        mwCore.handleError);

    router.put('/api/guild/:guildId/invite',
        mwAuth.authenticate(),
        controller.invite,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/uninvite/:userId',
        mwAuth.authenticate(),
        controller.uninvite,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/accept/:userId',
        mwAuth.authenticate(),
        controller.acceptInviteForApplicant,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/accept',
        mwAuth.authenticate(),
        controller.acceptInvite,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/decline',
        mwAuth.authenticate(),
        controller.declineInvite,
        mwCore.handleError);

    router.put('/api/guild/:guildId/apply',
        mwAuth.authenticate(),
        controller.apply,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/withdraw',
        mwAuth.authenticate(),
        controller.withdraw,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/reject/:userId',
        mwAuth.authenticate(),
        controller.reject,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/leave',
        mwAuth.authenticate(),
        controller.leave,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/promote/:userId',
        mwAuth.authenticate(),
        controller.promote,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/demote/:userId',
        mwAuth.authenticate(),
        controller.demote,
        mwCore.handleError);

    router.patch('/api/guild/:guildId/kick/:userId',
        mwAuth.authenticate(),
        controller.kick,
        mwCore.handleError);

    return router;
}