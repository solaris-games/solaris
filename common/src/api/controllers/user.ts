import {GetRoute, PostRoute, DeleteRoute} from "./index";
import {LeaderboardUser} from "../types/common/leaderboard";
import {UserGameSettings} from "../types/common/settings";
import {UserSubscriptions} from "../types/common/subscriptions";
import {UserPrivate, UserPublic} from "../types/common/user";
import {UserAvatar} from "../types/common/avatar";
import {GuildDataForUser} from "../types/common/guild";

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
    listLeaderboard: new GetRoute<{}, UserLeaderboard>("/api/user/leaderboard"),
    createUser: new PostRoute<{}, CreateUserReq, { id: string }>("/api/user/"),
    getSettings: new GetRoute<{}, UserGameSettings>("/api/user/settings"),
    saveSettings: new PostRoute<{}, UserGameSettings, {}>("/api/user/settings"),
    getSubscriptions: new GetRoute<{}, UserSubscriptions>("/api/user/subscriptions"),
    saveSubscriptions: new PostRoute<{}, UserSubscriptions, {}>("/api/user/subscriptions"),
    getCredits: new GetRoute<{}, { credits: number }>("/api/user/credits"),
    detailMe: new GetRoute<{}, UserPrivate<ID>>("/api/user/"),
    listMyAvatars: new GetRoute<{}, { avatars: UserAvatar[] }>("/api/user/avatars"),
    purchaseAvatar: new PostRoute<{ avatarId: number }, {}, {}>("/api/user/avatars/:avatarId/purchase"),
    getAchievements: new GetRoute<{ id: string }, UserPublic<ID>>("/api/user/achievements/:id"),
    updateEmailPreference: new PostRoute<{}, { enabled: boolean }, {}>("/api/user/changeEmailPreference"),
    updateEmailOtherPreference: new PostRoute<{}, { enabled: boolean }, {}>("/api/user/changeEmailOtherPreference"),
    updateUsername: new PostRoute<{}, { username: string }, {}>("/api/user/changeUsername"),
    updateEmailAddress: new PostRoute<{}, { email: string }, {}>("/api/user/changeEmailAddress"),
    updatePassword: new PostRoute<{}, { currentPassword: string, newPassword: string }, {}>("/api/user/changePassword"),
    requestPasswordReset: new PostRoute<{}, { email: string }, {}>("/api/user/requestResetPassword"),
    resetPassword: new PostRoute<{}, { token: string, newPassword: string }, {}>("/api/user/resetPassword"),
    requestUsernameReset: new PostRoute<{}, { email: string }, {}>("/api/user/requestUsername"),
    deleteUser: new DeleteRoute<{}, {}>("/api/user/closeaccount"),
})