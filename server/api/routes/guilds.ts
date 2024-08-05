import { ExpressJoiInstance } from "express-joi-validation";
import { DependencyContainer } from "../../services/types/DependencyContainer";
import GuildController from '../controllers/guild';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";

export default (router: SingleRouter, mw: MiddlewareContainer, validator: ExpressJoiInstance, container: DependencyContainer) => {
    const controller = GuildController(container);

    router.get('/api/guild/list',
            mw.auth.authenticate(),
            controller.list
    );

    router.get('/api/guild',
            mw.auth.authenticate(),
            controller.detailMine
    );

    router.get('/api/guild/leaderboard',
            controller.listLeaderboard
    );

    router.get('/api/guild/invites',
            mw.auth.authenticate(),
            controller.listMyInvites
    );

    router.get('/api/guild/applications',
            mw.auth.authenticate(),
            controller.listMyApplications
    );

    router.get('/api/guild/:guildId',
            mw.auth.authenticate(),
            controller.detail
    );

    router.post('/api/guild',
            mw.auth.authenticate(),
            controller.create
    );

    router.patch('/api/guild',
            mw.auth.authenticate(),
            controller.rename
    );

    router.delete('/api/guild/:guildId',
            mw.auth.authenticate(),
            controller.delete
    );

    router.put('/api/guild/:guildId/invite',
            mw.auth.authenticate(),
            controller.invite
    );

    router.patch('/api/guild/:guildId/uninvite/:userId',
            mw.auth.authenticate(),
            controller.uninvite
    );

    router.patch('/api/guild/:guildId/accept/:userId',
            mw.auth.authenticate(),
            controller.acceptInviteForApplicant
    );

    router.patch('/api/guild/:guildId/accept',
            mw.auth.authenticate(),
            controller.acceptInvite
    );

    router.patch('/api/guild/:guildId/decline',
            mw.auth.authenticate(),
            controller.declineInvite
    );

    router.put('/api/guild/:guildId/apply',
            mw.auth.authenticate(),
            controller.apply
    );

    router.patch('/api/guild/:guildId/withdraw',
            mw.auth.authenticate(),
            controller.withdraw
    );

    router.patch('/api/guild/:guildId/reject/:userId',
            mw.auth.authenticate(),
            controller.reject
    );

    router.patch('/api/guild/:guildId/leave',
            mw.auth.authenticate(),
            controller.leave
    );

    router.patch('/api/guild/:guildId/promote/:userId',
            mw.auth.authenticate(),
            controller.promote
    );

    router.patch('/api/guild/:guildId/demote/:userId',
            mw.auth.authenticate(),
            controller.demote
    );

    router.patch('/api/guild/:guildId/kick/:userId',
            mw.auth.authenticate(),
            controller.kick
    );

    return router;
}