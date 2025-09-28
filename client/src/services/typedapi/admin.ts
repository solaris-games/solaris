import {type Announcement, createAdminRoutes, type CreateAnnouncementReq, type GetInsight, type AdminListGame, type ListPasswordReset, type ListUser, type SettingEnabledDisabled, type Conversation, type ConversationMessage, type Report, type ImpersonateResp } from "@solaris-common";
import type { Axios } from "axios";
import {doGet, doPost, doPatch, type ResponseResult, doDelete} from ".";

const routes = createAdminRoutes<string>();

export const getUsers = (axios: Axios) => async (): Promise<ResponseResult<ListUser<string>[]>> => {
  return doGet(axios)(routes.listUsers, {}, {}, { withCredentials: true});
}

export const getPasswordResets = (axios: Axios) => async (): Promise<ResponseResult<ListPasswordReset<string>[]>> => {
  return doGet(axios)(routes.listPasswordResets, {}, {}, { withCredentials: true});
}

export const getInsights = (axios: Axios) => async (): Promise<ResponseResult<GetInsight[]>> => {
  return doGet(axios)(routes.getInsights, {}, {}, { withCredentials: true});
}

export const addWarning = (axios: Axios) => async (userId: string, warning: string): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.addWarning, { userId }, {}, { text: warning }, { withCredentials: true});
}

export const setRoleContributor = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleContributor, { userId }, {}, { enabled }, { withCredentials: true});
}

export const setRoleDeveloper = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleDeveloper, { userId }, {}, { enabled }, { withCredentials: true});
}

export const setRoleCommunityManager = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleCommunityManager, { userId }, {}, { enabled }, { withCredentials: true});
}

export const setRoleGameMaster = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleGameMaster, { userId }, {}, { enabled }, { withCredentials: true});
}

export const setCredits = (axios: Axios) => async (userId: string, credits: number): Promise<ResponseResult<{ credits: number }>> => {
  return doPatch(axios)(routes.setCredits, { userId }, {}, { credits }, { withCredentials: true});
}

export const ban = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.ban, { userId }, {}, {}, { withCredentials: true});
}

export const unban = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.unban, { userId }, {}, {}, { withCredentials: true});
}

export const resetAchievements = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.resetAchievements, { userId }, {}, {}, { withCredentials: true});
}

export const promoteToEstablishedPlayer = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.promoteToEstablishedPlayer, { userId }, {}, {}, { withCredentials: true});
}

export const impersonate = (axios: Axios) => async (userId: string): Promise<ResponseResult<ImpersonateResp<string>>> => {
  return doPost(axios)(routes.impersonate, { userId }, {}, {}, { withCredentials: true});
}

export const endImpersonate = (axios: Axios) => async (): Promise<ResponseResult<ImpersonateResp<string>>> => {
  return doPost(axios)(routes.endImpersonate, {}, {}, {}, { withCredentials: true});
}

export const listGames = (axios: Axios) => async (): Promise<ResponseResult<AdminListGame<string>[]>> => {
  return doGet(axios)(routes.listGames, {}, {}, { withCredentials: true});
}

export const setGameFeatured = (axios: Axios) => async (gameId: string, featured: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setGameFeatured, { gameId }, {}, { featured }, { withCredentials: true});
}

export const setGameTimeMachine = (axios: Axios) => async (gameId: string, timeMachine: SettingEnabledDisabled): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setGameTimeMachine, { gameId }, {}, { timeMachine }, { withCredentials: true});
}

export const finishGame = (axios: Axios) => async (gameId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.finishGame, { gameId }, {}, {}, { withCredentials: true});
}

export const resetQuitters = (axios: Axios) => async (gameId: string): Promise<ResponseResult<null>> => {
  return doDelete(axios)(routes.resetQuitters, { gameId }, {}, {}, { withCredentials: true});
}

export const getConversationForReport = (axios: Axios) => async (reportId: string): Promise<ResponseResult<Conversation<string>>> => {
  return doGet(axios)(routes.getConversationForReport, { reportId }, {}, { withCredentials: true});
}

export const listReports = (axios: Axios) => async (): Promise<ResponseResult<Report<string>[]>> => {
  return doGet(axios)(routes.listReports, {}, {}, { withCredentials: true});
}

export const actionReport = (axios: Axios) => async (reportId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.actionReport, { reportId }, {}, {}, { withCredentials: true});
}

export const createAnnouncement = (axios: Axios) => async (announcement: CreateAnnouncementReq): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.createAnnouncement, {}, {}, announcement, { withCredentials: true});
}

export const deleteAnnouncement = (axios: Axios) => async (announcementId: string): Promise<ResponseResult<null>> => {
  return doDelete(axios)(routes.deleteAnnouncement, { id: announcementId }, {}, {}, { withCredentials: true});
}

export const getAllAnnouncements = (axios: Axios) => async (): Promise<ResponseResult<Announcement<string>[]>> => {
  return doGet(axios)(routes.getAllAnnouncements, {}, {}, { withCredentials: true});
}
