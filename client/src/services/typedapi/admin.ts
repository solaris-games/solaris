import {type Announcement, createAdminRoutes, type ListPasswordReset, type ListUser} from "@solaris-common";
import type { Axios } from "axios";
import {doGet, type ResponseResult} from ".";

const routes = createAdminRoutes<string>();

export const getUsers = (axios: Axios) => async (): Promise<ResponseResult<ListUser<string>[]>> => {
  return doGet(axios)(routes.listUsers, {}, {});
}

export const getPasswordResets = (axios: Axios) => async (): Promise<ResponseResult<ListPasswordReset<string>[]>> => {
  return doGet(axios)(routes.listPasswordResets, {}, {});
}

export const getAllAnnouncements = (axios: Axios) => async (): Promise<ResponseResult<Announcement<string>[]>> => {
  return doGet(axios)(routes.getAllAnnouncements, {}, {});
}
