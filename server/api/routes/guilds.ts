import { DependencyContainer } from "../../services/types/DependencyContainer";
import GuildController from '../controllers/guild';
import { MiddlewareContainer } from "../middleware";
import {SingleRouter} from "../singleRoute";
import {createGuildRoutes} from "solaris-common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {createRoutes} from "../typedapi/routes";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    const controller = GuildController(container);
    const routes = createGuildRoutes<DBObjectId>();
    const answer = createRoutes(router, mw);

    answer(routes.listGuilds,
            mw.auth.authenticate(),
            controller.list
    );

    answer(routes.detailMyGuild,
            mw.auth.authenticate(),
            controller.detailMine
    );

    answer(routes.listGuildLeaderboard,
            controller.listLeaderboard
    );

    answer(routes.listMyGuildInvites,
            mw.auth.authenticate(),
            controller.listMyInvites
    );

    answer(routes.listMyGuildApplications,
            mw.auth.authenticate(),
            controller.listMyApplications
    );

    answer(routes.detailGuild,
            mw.auth.authenticate(),
            controller.detail
    );

    answer(routes.createGuild,
            mw.auth.authenticate(),
            controller.create
    );

    answer(routes.renameGuild,
            mw.auth.authenticate(),
            controller.rename
    );

    answer(routes.deleteGuild,
            mw.auth.authenticate(),
            controller.delete
    );

    answer(routes.inviteGuild,
            mw.auth.authenticate(),
            controller.invite
    );

    answer(routes.uninviteGuild,
            mw.auth.authenticate(),
            controller.uninvite
    );

    answer(routes.acceptGuildInviteForApplicant,
            mw.auth.authenticate(),
            controller.acceptInviteForApplicant
    );

    answer(routes.acceptGuildInvite,
            mw.auth.authenticate(),
            controller.acceptInvite
    );

    answer(routes.declineGuildInvite,
            mw.auth.authenticate(),
            controller.declineInvite
    );

    answer(routes.applyToGuild,
            mw.auth.authenticate(),
            controller.apply
    );

    answer(routes.withdrawGuildApplication,
            mw.auth.authenticate(),
            controller.withdraw
    );

    answer(routes.rejectGuildApplication,
            mw.auth.authenticate(),
            controller.reject
    );

    answer(routes.leaveGuild,
            mw.auth.authenticate(),
            controller.leave
    );

    answer(routes.promoteGuildMember,
            mw.auth.authenticate(),
            controller.promote
    );

    answer(routes.demoteGuildMember,
            mw.auth.authenticate(),
            controller.demote
    );

    answer(routes.kickGuildMember,
            mw.auth.authenticate(),
            controller.kick
    );

    return router;
}