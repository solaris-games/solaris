import {type AuthResponse, createAuthRoutes} from "@solaris/common";
import type { Axios } from "axios";
import {doDelete, doGet, doPost, type ResponseResult} from "@/services/typedapi/index";

type PRR<A> = Promise<ResponseResult<A>>;

const routes = createAuthRoutes<string>();

export const login = (axios: Axios) => async (email: string, password: string): PRR<AuthResponse<string>> => {
  return doPost(axios)(routes.login, {}, {}, {email, password}, { withCredentials: true });
};

export const logout = (axios: Axios) => async (): PRR<{}> => {
  return doPost(axios)(routes.logout, {}, {}, {}, { withCredentials: true });
};

export const verify = (axios: Axios) => async (): PRR<AuthResponse<string>> => {
  return doPost(axios)(routes.verify, {}, {}, {}, { withCredentials: true });
};

export const authoriseDiscord = (axios: Axios) => async (code: string): PRR<{}> => {
  return doGet(axios)(routes.authoriseDiscord, {}, { code }, { withCredentials: true });
};

export const unauthoriseDiscord = (axios: Axios) => async (): PRR<{}> => {
  return doDelete(axios)(routes.unauthoriseDiscord, {}, {}, {}, { withCredentials: true });
};
