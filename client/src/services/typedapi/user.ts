import {
  createUserRoutes,
  type UserSubscriptions,
  type UserGameSettings,
  type UserLeaderboard,
  type UserPrivate,
  type UserAvatar,
  type AchievementsUser
} from "@solaris-common";
import {doGet, doPost, type ResponseResult} from "@/services/typedapi/index";
import { type Axios } from "axios";

const routes = createUserRoutes<string>();

export const getLeaderboard = (axios: Axios) => async (): Promise<ResponseResult<UserLeaderboard>> => {
  return doGet(axios)(routes.listLeaderboard, {}, {withCredentials: true});
}

export const createUser = (axios: Axios) => async (email: string, username: string, password: string): Promise<ResponseResult<{ id: string }>> => {
  return doPost(axios)(routes.createUser, {}, { email, username, password }, { withCredentials: true });
}

export const getSettings = (axios: Axios) => async (): Promise<ResponseResult<UserGameSettings>> => {
  return doGet(axios)(routes.getSettings, {}, { withCredentials: true });
}

export const saveSettings = (axios: Axios) => async (settings: UserGameSettings): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.saveSettings, {}, settings, { withCredentials: true });
}

export const getSubscriptions = (axios: Axios) => async (): Promise<ResponseResult<UserSubscriptions>> => {
  return doGet(axios)(routes.getSubscriptions, {}, { withCredentials: true });
}

export const saveSubscriptions = (axios: Axios) => async (subscriptions: UserSubscriptions): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.saveSubscriptions, {}, subscriptions, { withCredentials: true });
}

export const getCredits = (axios: Axios) => async (): Promise<ResponseResult<{ credits: number }>> => {
  return doGet(axios)(routes.getCredits, {}, { withCredentials: true });
}

export const detailMe = (axios: Axios) => async (): Promise<ResponseResult<UserPrivate<string>>> => {
  return doGet(axios)(routes.detailMe, {}, { withCredentials: true });
}

export const listMyAvatars = (axios: Axios) => async (): Promise<ResponseResult<{ avatars: UserAvatar[] }>> => {
  return doGet(axios)(routes.listMyAvatars, {}, { withCredentials: true });
}

export const purchaseAvatar = (axios: Axios) => async (avatarId: number): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.purchaseAvatar, { avatarId }, {}, { withCredentials: true });
}

export const getAchievements = (axios: Axios) => async (id: string): Promise<ResponseResult<AchievementsUser<string>>> => {
  return doGet(axios)(routes.getAchievements, { id }, { withCredentials: true });
}

export const updateEmailPreference = (axios: Axios) => async (enabled: boolean): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.updateEmailPreference, {}, { enabled }, { withCredentials: true });
}

export const updateEmailOtherPreference = (axios: Axios) => async (enabled: boolean): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.updateEmailOtherPreference, {}, { enabled }, { withCredentials: true });
}

export const updateUsername = (axios: Axios) => async (username: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.updateUsername, {}, { username }, { withCredentials: true });
}

export const updateEmailAddress = (axios: Axios) => async (email: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.updateEmailAddress, {}, { email }, { withCredentials: true });
}

export const updatePassword = (axios: Axios) => async (currentPassword: string, newPassword: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.updatePassword, {}, { currentPassword, newPassword }, { withCredentials: true });
}

export const requestPasswordReset = (axios: Axios) => async (email: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.requestPasswordReset, {}, { email }, { withCredentials: true });
}

export const resetPassword = (axios: Axios) => async (token: string, newPassword: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.resetPassword, {}, { token, newPassword }, { withCredentials: true });
}

export const requestUsernameReset = (axios: Axios) => async (email: string): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.requestUsernameReset, {}, { email }, { withCredentials: true });
}

export const deleteUser = (axios: Axios) => async (): Promise<ResponseResult<{}>> => {
  return doPost(axios)(routes.deleteUser, {}, {}, { withCredentials: true });
}
