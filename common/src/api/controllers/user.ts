import {
    GetRoute,
    PostRoute,
    DeleteRoute,
    SimpleGetRoute,
    SimplePostRoute,
    SimpleDeleteRoute,
    SimplePutRoute
} from "./index";
import type {LeaderboardUser} from "../../types/common/leaderboard";
import type {UserGameSettings} from "../../types/common/settings";
import type {UserSubscriptions} from "../../types/common/subscriptions";
import type {UserPrivate, UserPublic} from "../../types/common/user";
import type {UserAvatar} from "../../types/common/avatar";
import type {GuildDataForUser} from "../../types/common/guild";

export type UserLeaderboard = {
    totalPlayers: number,
    leaderboard: LeaderboardUser<string>[],
}

export type CreateUserReq = {
    email: string;
    username: string;
    password: string;
}

export type AchievementsUser<ID> = UserPublic<ID> & {
    guild?: GuildDataForUser<ID>;
}

export const createUserRoutes = <ID>() => ({
    listLeaderboard: new GetRoute<{}, { limit: number, sortingKey: string }, UserLeaderboard>("/api/user/leaderboard"),
    createUser: new SimplePostRoute<CreateUserReq, { id: string }>("/api/user/"),
    getSettings: new SimpleGetRoute<UserGameSettings>("/api/user/settings"),
    saveSettings: new SimplePutRoute<UserGameSettings, {}>("/api/user/settings"),
    getSubscriptions: new SimpleGetRoute<UserSubscriptions>("/api/user/subscriptions"),
    saveSubscriptions: new SimplePutRoute<UserSubscriptions, {}>("/api/user/subscriptions"),
    getCredits: new SimpleGetRoute<{ credits: number }>("/api/user/credits"),
    detailMe: new SimpleGetRoute<UserPrivate<ID>>("/api/user/"),
    listMyAvatars: new SimpleGetRoute<{ avatars: UserAvatar[] }>("/api/user/avatars"),
    purchaseAvatar: new PostRoute<{ avatarId: number }, {}, {}, {}>("/api/user/avatars/:avatarId/purchase"),
    getAchievements: new GetRoute<{ id: string }, {}, AchievementsUser<ID>>("/api/user/achievements/:id"),
    updateEmailPreference: new SimplePutRoute<{ enabled: boolean }, {}>("/api/user/changeEmailPreference"),
    updateEmailOtherPreference: new SimplePutRoute<{ enabled: boolean }, {}>("/api/user/changeEmailOtherPreference"),
    updateUsername: new SimplePutRoute<{ username: string }, {}>("/api/user/changeUsername"),
    updateEmailAddress: new SimplePutRoute<{ email: string }, {}>("/api/user/changeEmailAddress"),
    updatePassword: new SimplePutRoute<{ currentPassword: string, newPassword: string }, {}>("/api/user/changePassword"),
    requestPasswordReset: new SimplePostRoute<{ email: string }, {}>("/api/user/requestResetPassword"),
    resetPassword: new SimplePostRoute<{ token: string, newPassword: string }, {}>("/api/user/resetPassword"),
    requestUsername: new SimplePostRoute<{ email: string }, {}>("/api/user/requestUsername"),
    deleteUser: new SimpleDeleteRoute<{}>("/api/user/closeaccount"),
})