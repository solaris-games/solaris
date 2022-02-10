import { DBObjectId } from "./DBObjectId";
import { SettingVisibility, User } from "./User";

export interface Guild {
    _id: DBObjectId;
    name: string;
    tag: string;
    leader: DBObjectId;
    officers: DBObjectId[];
    members: DBObjectId[];
    invitees: DBObjectId[];
    applicants: DBObjectId[];
};

export interface GuildRank extends Guild {
    totalRank: number;
};

export interface GuildLeaderboard extends GuildRank {
    memberCount: number;
    position?: number;
};

export interface GuildUserApplication {
    name: string;
    tag: string;
    hasApplied: boolean;
};

export interface GuildWithUsers {
    _id: DBObjectId;
    name: string;
    tag: string;
    leader?: User;
    officers?: User[];
    members?: User[];
    invitees?: User[];
    applicants?: User[];
    totalRank?: number;
};

export interface GuildUserWithTag {
    _id: DBObjectId;
    username: string;
    displayGuildTag: SettingVisibility;
    guild: Guild | null;
};
