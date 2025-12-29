import {createEventRoutes, type ListEventsResponse} from "@solaris-common";
import {doGet, doPatch, type ResponseResult} from "@/services/typedapi/index";
import { type Axios } from "axios";

const routes = createEventRoutes<string>();

export const listEvents = (axios: Axios) => async (gameId: string): Promise<ResponseResult<ListEventsResponse<string>>> => {
  return doGet(axios)(routes.listEvents, { gameId }, {}, { withCredentials: true });
}

export const markAllAsRead = (axios: Axios) => async (gameId: string) : Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.markAllAsRead, { gameId }, {}, {}, { withCredentials: true });
}

export const markAsRead = (axios: Axios) => async (gameId: string, eventId: string) : Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.markAsRead, { gameId, eventId }, {}, {}, { withCredentials: true });
}

export const unreadCount = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{ unread: number }>> => {
  return doGet(axios)(routes.unreadCount, { gameId }, {}, { withCredentials: true });
}
