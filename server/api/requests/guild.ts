import {
    Validator,
    GuildRenameGuildRequest,
    GuildCreateGuildRequest,
    GuildInviteUserRequest,
    object,
    stringValue,
    username
} from "@solaris/common";

const guildName: Validator<string> = stringValue({
    minLength: 4,
    maxLength: 64,
    trim: true,
});

const guildTag: Validator<string> = stringValue({
    minLength: 2,
    maxLength: 4,
});

export const parseGuildCreateRequest: Validator<GuildCreateGuildRequest> = object({
    name: guildName,
    tag: guildTag,
});

export const parseGuildRenameRequest: Validator<GuildRenameGuildRequest> = object({
    name: guildName,
    tag: guildTag,
});

export const parseGuildInviteUserRequest: Validator<GuildInviteUserRequest> = object({
    username: username,
});
