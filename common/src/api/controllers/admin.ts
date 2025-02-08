import { Announcement } from '../types/common/announcement';
import { GameSettingsGeneral, GameState } from '../types/common/game';
import { SettingEnabledDisabled } from '../types/common/settings';
import { UserRoles, UserWarning } from '../types/common/user';
import { GetRoute, PatchRoute, PostRoute, DeleteRoute } from './index';

type GetInsight = {
    name: string,
    d1: number,
    d2: number,
    d7: number,
    d14: number,
}

type RoleSpecificUserInfo =
    | { adminRole: 'communityManager' }
    | { 
        adminRole: 'admin',
        email: string,
        credits: number,
        roles: UserRoles,
        emailEnabled: boolean,
        lastSeen: Date,
        lastSeenIP: string,
    };

type ListUser<ID> = {
    _id: ID,
    username: string,
    banned: boolean,
    isEstablishedPlayer: boolean,
    warnings: UserWarning[],
} & RoleSpecificUserInfo;

type ListPasswordReset<ID> = {
    _id: ID,
    username: string,
    email: string,
    resetPasswordToken: string,
};

type AddWarningReq = {
    text: string,
}

type SetRoleReq = {
    enabled: boolean,
}

type SetCreditsReq = {
    credits: number,
}

type ListGame<ID> = {
    settings: {
        general: GameSettingsGeneral<ID>,
    },
    state: GameState<ID>,
};

type SetFeaturedReq = {
    featured: boolean,
};

type SetTimeMachineReq = {
    timeMachine: SettingEnabledDisabled,
};

type CreateAnnouncementReq = {
    title: string,
    content: string,
    date: Date,
};

export const createAdminRoutes = <ID>() => ({
    getInsights: new GetRoute<GetInsight[]>('/api/admin/insights'),
    listUsers: new GetRoute<ListUser<ID>[]>('/api/admin/user'),
    listPasswordResets: new GetRoute<ListPasswordReset<ID>[]>('/api/admin/passwordresets'),
    addWarning: new PostRoute<AddWarningReq, null>('/api/admin/user/:userId/warning'),
    setRoleContributor: new PatchRoute<SetRoleReq, null>('/api/admin/user/:userId/contributor'),
    setRoleDeveloper: new PatchRoute<SetRoleReq, null>('/api/admin/user/:userId/developer'),
    setRoleCommunityManager: new PatchRoute<SetRoleReq, null>('/api/admin/user/:userId/communityManager'),
    setRoleGameMaster: new PatchRoute<SetRoleReq, null>('/api/admin/user/:userId/gameMaster'),
    setCredits: new PatchRoute<SetCreditsReq, null>('/api/admin/user/:userId/credits'),
    ban: new PatchRoute('/api/admin/user/:userId/ban'),
    unban: new PatchRoute('/api/admin/user/:userId/unban'),
    resetAchievements: new PatchRoute('/api/admin/user/:userId/resetAchievements'),
    promoteToEstablishedPlayer: new PatchRoute('/api/admin/user/:userId/promoteToEstablishedPlayer'),
    impersonate: new PatchRoute('/api/admin/user/:userId/impersonate'),
    endImpersonate: new PatchRoute('/api/admin/endImpersonate'),
    listGames: new GetRoute<ListGame<ID>[]>('/api/admin/game'),
    setGameFeatured: new PatchRoute<SetFeaturedReq, null>('/api/admin/game/:gameId/featured'),
    setGameTimeMachine: new PatchRoute<SetTimeMachineReq, null>('/api/admin/game/:gameId/timeMachine'),
    finishGame: new PatchRoute('/api/admin/game/:gameId/finish'),
    resetQuitters: new DeleteRoute('/api/admin/game/:gameId/quitters'),
    createAnnouncement: new PostRoute<CreateAnnouncementReq, null>('/api/admin/announcements/'),
    deleteAnnouncement: new DeleteRoute('/api/admin/announcements/:id'),
    getAllAnnouncements: new GetRoute<Announcement<ID>[]>('/api/admin/announcements/'),
});
