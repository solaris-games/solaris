import {type Validator, array, object, username} from "@solaris/common";

export type SpectatorInviteRequest = {
    usernames: string[];
}

export const parseSpectatorInviteRequest: Validator<SpectatorInviteRequest> = object({
    usernames: array(username),
});