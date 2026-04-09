import {type Axios} from "axios";
import {
  createGuildRoutes,
  type Guild, type GuildApplication,
  type GuildLeaderboardResponse,
  type GuildRank, type GuildSortingKey,
  type GuildWithUsers
} from "@solaris/common";
import {doDelete, doGet, doPatch, doPost, doPut, type ResponseResult} from "@/services/typedapi/index";

const routes = createGuildRoutes<string>();

type PRR<A> = Promise<ResponseResult<A>>;

export const listGuilds = (axios: Axios) => async (): PRR<GuildRank<string>[]> => {
  return doGet(axios)(routes.listGuilds, {}, {}, { withCredentials: true });
}

export const detailMyGuild = (axios: Axios) => async (): PRR<GuildWithUsers<string>> => {
  return doGet(axios)(routes.detailMyGuild, {}, {}, { withCredentials: true });
}

export const listGuildLeaderboard = (axios: Axios) => async (sortingKey: GuildSortingKey, limit: number): PRR<GuildLeaderboardResponse<string>> => {
  return doGet(axios)(routes.listGuildLeaderboard, {}, { sortingKey, limit }, { withCredentials: true });
}

export const listMyGuildInvites = (axios: Axios) => async (): PRR<Guild<string>[]> => {
  return doGet(axios)(routes.listMyGuildInvites, {}, {}, { withCredentials: true });
}

export const listMyGuildApplications = (axios: Axios) => async (): PRR<GuildApplication<string>[]> => {
  return doGet(axios)(routes.listMyGuildApplications, {}, {}, { withCredentials: true });
}

export const detailGuild = (axios: Axios) => async (guildId: string): PRR<GuildWithUsers<string> | null> => {
  return doGet(axios)(routes.detailGuild, { guildId }, {}, { withCredentials: true });
}

export const createGuild = (axios: Axios) => async (name: string, tag: string): PRR<Guild<string>> => {
  return doPost(axios)(routes.createGuild, {}, {}, { name, tag }, { withCredentials: true });
}

export const renameGuild = (axios: Axios) => async (name: string, tag: string): PRR<Guild<string>> => {
  return doPatch(axios)(routes.renameGuild, {}, {}, { name, tag }, { withCredentials: true });
}

export const deleteGuild = (axios: Axios) => async (guildId: string): PRR<{}> => {
  return doDelete(axios)(routes.deleteGuild, { guildId }, {}, {}, { withCredentials: true });
}

export const inviteGuild = (axios: Axios) => async (guildId: string, username: string): PRR<{}> => {
  return doPost(axios)(routes.inviteGuild, { guildId }, {}, { username }, { withCredentials: true });
}

export const uninviteGuild = (axios: Axios) => async (guildId: string, userId: string) => {
  return doPatch(axios)(routes.uninviteGuild, { guildId, userId}, {}, {}, { withCredentials: true });
}

export const acceptGuildInviteForApplicant = (axios: Axios) => async (guildId: string, userId: string): PRR<{}> => {
  return doPatch(axios)(routes.acceptGuildInviteForApplicant, { guildId, userId }, {}, {}, { withCredentials: true });
}

export const acceptGuildInvite = (axios: Axios) => async (guildId: string): PRR<{}> => {
  return doPatch(axios)(routes.acceptGuildInvite, { guildId }, {}, {}, { withCredentials: true });
}

export const declineGuildInvite = (axios: Axios) => async (guildId: string): PRR<{}> => {
  return doPatch(axios)(routes.declineGuildInvite, { guildId }, {}, {}, { withCredentials: true });
}

export const applyToGuild = (axios: Axios) => async (guildId: string): PRR<{}> => {
  return doPut(axios)(routes.applyToGuild, { guildId }, {}, {}, { withCredentials: true });
}

export const withdrawGuildApplication = (axios: Axios) => async (guildId: string): PRR<{}> => {
  return doPatch(axios)(routes.withdrawGuildApplication, { guildId }, {}, {}, { withCredentials: true });
}

export const rejectGuildApplication = (axios: Axios) => async (guildId: string, userId: string): PRR<{}> => {
  return doPatch(axios)(routes.rejectGuildApplication, { guildId, userId }, {}, {}, { withCredentials: true });
}

export const leaveGuild = (axios: Axios) => async (guildId: string): PRR<{}> => {
  return doPatch(axios)(routes.leaveGuild, { guildId }, {}, {},{ withCredentials: true });
}

export const promoteGuildMember = (axios: Axios) => async (guildId: string, userId: string): PRR<{}> => {
  return doPatch(axios)(routes.promoteGuildMember, { guildId, userId }, {}, {}, { withCredentials: true });
}

export const demoteGuildMember = (axios: Axios) => async (guildId: string, userId: string): PRR<{}> => {
  return doPatch(axios)(routes.demoteGuildMember, { guildId, userId }, {}, {}, { withCredentials: true });
}

export const kickGuildMember = (axios: Axios) => async (guildId: string, userId: string): PRR<{}> => {
  return doPatch(axios)(routes.kickGuildMember, { guildId, userId }, {}, {}, { withCredentials: true });
}
