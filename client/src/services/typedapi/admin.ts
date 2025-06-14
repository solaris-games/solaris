import {type Announcement, createAdminRoutes, type CreateAnnouncementReq, type GetInsight, type ListGame, type ListPasswordReset, type ListUser, type SettingEnabledDisabled, type Conversation, type ConversationMessage, type Report } from "@solaris-common";
import type { Axios } from "axios";
import {doGet, doPost, doPatch, type ResponseResult, doDelete} from ".";

const routes = createAdminRoutes<string>();

export const getUsers = (axios: Axios) => async (): Promise<ResponseResult<ListUser<string>[]>> => {
  return doGet(axios)(routes.listUsers, {}, {});
}

export const getPasswordResets = (axios: Axios) => async (): Promise<ResponseResult<ListPasswordReset<string>[]>> => {
  return doGet(axios)(routes.listPasswordResets, {}, {});
}

export const getInsights = (axios: Axios) => async (): Promise<ResponseResult<GetInsight[]>> => {
  return doGet(axios)(routes.getInsights, {}, {});
}

export const addWarning = (axios: Axios) => async (userId: string, warning: string): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.addWarning, { userId }, {}, { text: warning });
}

export const setRoleContributor = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleContributor, { userId }, {}, { enabled });
}

export const setRoleDeveloper = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleDeveloper, { userId }, {}, { enabled });
}

export const setRoleCommunityManager = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleCommunityManager, { userId }, {}, { enabled });
}

export const setRoleGameMaster = (axios: Axios) => async (userId: string, enabled: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setRoleGameMaster, { userId }, {}, { enabled });
}

export const setCredits = (axios: Axios) => async (userId: string, credits: number): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setCredits, { userId }, {}, { credits });
}

export const ban = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.ban, { userId }, {}, {});
}

export const unban = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.unban, { userId }, {}, {});
}

export const resetAchievements = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.resetAchievements, { userId }, {}, {});
}

export const promoteToEstablishedPlayer = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.promoteToEstablishedPlayer, { userId }, {}, {});
}

export const impersonate = (axios: Axios) => async (userId: string): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.impersonate, { userId }, {}, {});
}

export const endImpersonate = (axios: Axios) => async (): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.endImpersonate, {}, {}, {});
}

export const listGames = (axios: Axios) => async (): Promise<ResponseResult<ListGame<string>>> => {
  return doGet(axios)(routes.listGames, {}, {}, {});
}

export const setGameFeatured = (axios: Axios) => async (gameId: string, featured: boolean): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setGameFeatured, { gameId }, {}, { featured });
}

export const setGameTimeMachine = (axios: Axios) => async (gameId: string, timeMachine: SettingEnabledDisabled): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.setGameTimeMachine, { gameId }, {}, { timeMachine });
}

export const finishGame = (axios: Axios) => async (gameId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.finishGame, { gameId }, {}, {});
}

export const resetQuitters = (axios: Axios) => async (gameId: string): Promise<ResponseResult<null>> => {
  return doDelete(axios)(routes.resetQuitters, { gameId }, {}, {});
}

export const getConversationForReport = (axios: Axios) => async (reportId: string): Promise<ResponseResult<Conversation<string>>> => {
  return doGet(axios)(routes.getConversationForReport, { reportId }, {});
}

export const listReports = (axios: Axios) => async (): Promise<ResponseResult<Report<string>[]>> => {
  return doGet(axios)(routes.listReports, {}, {});
}

export const actionReport = (axios: Axios) => async (reportId: string): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.actionReport, { reportId }, {}, {});
}

export const createAnnouncement = (axios: Axios) => async (announcement: CreateAnnouncementReq): Promise<ResponseResult<null>> => {
  return doPost(axios)(routes.createAnnouncement, {}, {}, announcement);
}

export const deleteAnnouncement = (axios: Axios) => async (announcementId: string): Promise<ResponseResult<null>> => {
  return doDelete(axios)(routes.deleteAnnouncement, { id: announcementId }, {}, {});
}

export const getAllAnnouncements = (axios: Axios) => async (): Promise<ResponseResult<Announcement<string>[]>> => {
  return doGet(axios)(routes.getAllAnnouncements, {}, {});
}
