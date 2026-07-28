import {
    DeleteRoute,
    GetRoute,
    PatchRoute,
    PostRoute,
    PutRoute,
    SimpleGetRoute,
} from "./index";
import type {
    Guild,
    GuildLeaderboard,
    GuildRank,
    GuildWithUsers,
} from "../../types/common/guild";

export type GuildLeaderboardResponse<ID> = {
    totalGuilds: number;
    leaderboard: GuildLeaderboard<ID>[];
};

export interface GuildCreateGuildRequest {
    name: string;
    tag: string;
}

export interface GuildRenameGuildRequest {
    name: string;
    tag: string;
}

export interface GuildInviteUserRequest {
    username: string;
}

export interface GuildApplication<ID> {
    _id: ID;
    name: string;
    tag: string;
    hasApplied: boolean;
}

export type GuildSortingKey = "totalRank" | "memberCount";

export const createGuildRoutes = <ID>() => ({
    listGuilds: new SimpleGetRoute<GuildRank<ID>[]>("/api/guild/list"),
    detailMyGuild: new SimpleGetRoute<GuildWithUsers<ID> | null>("/api/guild"),
    listGuildLeaderboard: new GetRoute<
        {},
        { sortingKey: GuildSortingKey; limit: number },
        GuildLeaderboardResponse<ID>
    >("/api/guild/leaderboard"),
    listMyGuildInvites: new SimpleGetRoute<Guild<ID>[]>("/api/guild/invites"),
    listMyGuildApplications: new SimpleGetRoute<GuildApplication<ID>[]>(
        "/api/guild/applications",
    ),
    detailGuild: new GetRoute<{ guildId: ID }, {}, GuildWithUsers<ID> | null>(
        "/api/guild/:guildId",
    ),
    createGuild: new PostRoute<{}, {}, GuildCreateGuildRequest, Guild<ID>>(
        "/api/guild",
    ),
    renameGuild: new PatchRoute<{}, {}, GuildRenameGuildRequest, Guild<ID>>(
        "/api/guild",
    ),
    deleteGuild: new DeleteRoute<{ guildId: ID }, {}, {}>(
        "/api/guild/:guildId",
    ),
    inviteGuild: new PostRoute<{ guildId: ID }, {}, GuildInviteUserRequest, {}>(
        "/api/guild/:guildId/invite",
    ),
    uninviteGuild: new PatchRoute<{ guildId: ID; userId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/uninvite/:userId",
    ),
    acceptGuildInviteForApplicant: new PatchRoute<
        { guildId: ID; userId: ID },
        {},
        {},
        {}
    >("/api/guild/:guildId/accept/:userId"),
    acceptGuildInvite: new PatchRoute<{ guildId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/accept",
    ),
    declineGuildInvite: new PatchRoute<{ guildId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/decline",
    ),
    applyToGuild: new PutRoute<{ guildId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/apply",
    ),
    withdrawGuildApplication: new PatchRoute<{ guildId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/withdraw",
    ),
    rejectGuildApplication: new PatchRoute<
        { guildId: ID; userId: ID },
        {},
        {},
        {}
    >("/api/guild/:guildId/reject/:userId"),
    leaveGuild: new PatchRoute<{ guildId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/leave",
    ),
    promoteGuildMember: new PatchRoute<{ guildId: ID; userId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/promote/:userId",
    ),
    demoteGuildMember: new PatchRoute<{ guildId: ID; userId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/demote/:userId",
    ),
    kickGuildMember: new PatchRoute<{ guildId: ID; userId: ID }, {}, {}, {}>(
        "/api/guild/:guildId/kick/:userId",
    ),
});
