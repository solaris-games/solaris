import { UserRoles, UserWarning } from '../types/common/user';
import { GetRoute, PatchRoute, PostRoute } from './index';

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

export const createAdminRoutes = <ID>() => ({
    getInsights: new GetRoute<GetInsight[]>('/api/admin/insights'),
    listUsers: new GetRoute<ListUser<ID>[]>('/api/admin/user'),
    listPasswordResets: new GetRoute<ListPasswordReset<ID>[]>('/api/admin/passwordresets'),
    addWarning: new PostRoute<AddWarningReq, null>('/api/admin/user/:userId/warning'),
});
