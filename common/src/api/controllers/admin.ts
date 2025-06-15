import type { Announcement } from '../types/common/announcement';
import type { GameSettingsGeneral, GameState } from '../types/common/game';
import type { SettingEnabledDisabled } from '../types/common/settings';
import type { UserRoles, UserWarning } from '../types/common/user';
import type { Report } from '../types/common/report';
import type { Conversation } from '../types/common/conversation';
import { GetRoute, PatchRoute, PostRoute, DeleteRoute, SimpleGetRoute, SimplePatchRoute, SimplePostRoute } from './index';

export type GetInsight = {
    name: string,
    d1: number,
    d2: number,
    d7: number,
    d14: number,
}

export type RoleSpecificUserInfo =
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

export type ListUser<ID> = {
    _id: ID,
    username: string,
    banned: boolean,
    isEstablishedPlayer: boolean,
    warnings: UserWarning[],
} & RoleSpecificUserInfo;

export type ListPasswordReset<ID> = {
    _id: ID,
    username: string,
    email: string,
    resetPasswordToken: string,
};

export type AddWarningReq = {
    text: string,
}

export type SetRoleReq = {
    enabled: boolean,
}

export type SetCreditsReq = {
    credits: number,
}

export type ListGame<ID> = {
    _id: ID,
    settings: {
        general: GameSettingsGeneral<ID>,
    },
    state: GameState<ID>,
};

export type SetFeaturedReq = {
    featured: boolean,
};

export type SetTimeMachineReq = {
    timeMachine: SettingEnabledDisabled,
};

export type CreateAnnouncementReq = {
    title: string,
    content: string,
    date: Date,
};

export const createAdminRoutes = <ID>() => ({
    getInsights: new SimpleGetRoute<GetInsight[]>('/api/admin/insights'),
    listUsers: new SimpleGetRoute<ListUser<ID>[]>('/api/admin/user'),
    listPasswordResets: new SimpleGetRoute<ListPasswordReset<ID>[]>('/api/admin/passwordresets'),
    addWarning: new PostRoute<{ userId: string }, {}, AddWarningReq, null>('/api/admin/user/:userId/warning'),
    setRoleContributor: new PatchRoute<{ userId: string }, {}, SetRoleReq, null>('/api/admin/user/:userId/contributor'),
    setRoleDeveloper: new PatchRoute<{ userId: string }, {}, SetRoleReq, null>('/api/admin/user/:userId/developer'),
    setRoleCommunityManager: new PatchRoute<{ userId: string }, {}, SetRoleReq, null>('/api/admin/user/:userId/communityManager'),
    setRoleGameMaster: new PatchRoute<{ userId: string }, {}, SetRoleReq, null>('/api/admin/user/:userId/gameMaster'),
    setCredits: new PatchRoute<{ userId: string }, {}, SetCreditsReq, null>('/api/admin/user/:userId/credits'),
    ban: new PatchRoute<{ userId: string }, {}, null, null>('/api/admin/user/:userId/ban'),
    unban: new PatchRoute<{ userId: string }, {}, null, null>('/api/admin/user/:userId/unban'),
    resetAchievements: new PatchRoute<{ userId: string }, {}, null, null>('/api/admin/user/:userId/resetAchievements'),
    promoteToEstablishedPlayer: new PatchRoute<{ userId: string }, {}, null, null>('/api/admin/user/:userId/promoteToEstablishedPlayer'),
    impersonate: new PostRoute<{ userId: string }, {}, null, null>('/api/admin/user/:userId/impersonate'),
    endImpersonate: new SimplePostRoute<null, null>('/api/admin/endImpersonate'),
    listGames: new SimpleGetRoute<ListGame<ID>[]>('/api/admin/game'),
    setGameFeatured: new PatchRoute<{ gameId: string }, {}, SetFeaturedReq, null>('/api/admin/game/:gameId/featured'),
    setGameTimeMachine: new PatchRoute<{ gameId: string }, {}, SetTimeMachineReq, null>('/api/admin/game/:gameId/timeMachine'),
    finishGame: new PatchRoute<{ gameId: string }, {}, null, null>('/api/admin/game/:gameId/finish'),
    resetQuitters: new DeleteRoute<{ gameId: string }, {}, null>('/api/admin/game/:gameId/quitters'),
    getConversationForReport: new GetRoute<{ reportId: string }, {}, Conversation<ID>>('/api/admin/reports/:reportId/conversation'),
    listReports: new SimpleGetRoute<Report<ID>[]>('/api/admin/reports'),
    actionReport: new PatchRoute<{ reportId: string }, {}, {}, null>('/api/admin/reports/:reportId/action'),
    createAnnouncement: new SimplePostRoute<CreateAnnouncementReq, null>('/api/admin/announcements/'),
    deleteAnnouncement: new DeleteRoute<{ id: string }, {}, null>('/api/admin/announcements/:id'),
    getAllAnnouncements: new SimpleGetRoute<Announcement<ID>[]>('/api/admin/announcements/'),
});
