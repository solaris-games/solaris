import {type Announcement, type AnnouncementState, createAnnouncementRoutes} from "solaris-common";
import type { Axios } from "axios";
import {doGet, doPatch, type ResponseResult} from "@/services/typedapi/index";

const routes = createAnnouncementRoutes<string>();

export const getLatestAnnouncement = (axios: Axios) => async (): Promise<ResponseResult<Announcement<string> | null>> => {
  return doGet(axios)(routes.getLatestAnnouncement, {}, {});
}

export const getCurrentAnnouncements = (axios: Axios) => async (): Promise<ResponseResult<Announcement<string>[]>> => {
  return doGet(axios)(routes.getCurrentAnnouncements, {}, {});
}

export const getAnnouncementState = (axios: Axios) => async (): Promise<ResponseResult<AnnouncementState<string>>> => {
  return doGet(axios)(routes.getAnnouncementState, {}, {});
}

export const markAsRead = (axios: Axios) => async (): Promise<ResponseResult<null>> => {
  return doPatch(axios)(routes.markAsRead, {}, {}, {});
}
