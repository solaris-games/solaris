import {object, string, Validator} from "solaris.common";

export type AuthLoginRequest = {
    email: string,
    password: string,
}

export const parseAuthLoginRequest : Validator<AuthLoginRequest> = object({
    email: string,
    password: string,
});
