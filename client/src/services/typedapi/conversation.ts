import {
  type Conversation,
  type ConversationMessageSentResult,
  type ConversationOverview,
  createConversationRoutes
} from "@solaris-common";
import { type Axios } from "axios";
import {doGet, doPatch, doPost, type ResponseResult} from "@/services/typedapi/index";

const routes = createConversationRoutes<string>();

export const listConversations = (axios: Axios) => async (gameId: string): Promise<ResponseResult<ConversationOverview<string>[]>> => {
  return doGet(axios)(routes.list, { gameId }, {}, { withCredentials: true });
};

export const listPrivate = (axios: Axios) => async (gameId: string, withPlayerId: string): Promise<ResponseResult<ConversationOverview<string> | null>> => {
  return doGet(axios)(routes.listPrivate, { gameId, withPlayerId }, {}, { withCredentials: true });
};

export const getUnreadCount = (axios: Axios) => async (gameId: string): Promise<ResponseResult<{ unread: number }>> => {
  return doGet(axios)(routes.getUnreadCount, { gameId }, {}, { withCredentials: true });
};

export const detailConversation = (axios: Axios) => async (gameId: string, conversationId: string): Promise<ResponseResult<Conversation<string>>> => {
  return doGet(axios)(routes.detail, { gameId, conversationId }, {}, { withCredentials: true });
};

export const createConversation = (axios: Axios) => async (gameId: string, name: string, participants: string[]): Promise<ResponseResult<Conversation<string>>> => {
  return doPost(axios)(routes.create, { gameId }, {}, { name, participants }, { withCredentials: true });
};

export const sendMessage = (axios: Axios) => async (gameId: string, conversationId: string, message: string): Promise<ResponseResult<ConversationMessageSentResult<string>>> => {
  return doPatch(axios)(routes.sendMessage, { gameId, conversationId }, {}, { message }, { withCredentials: true });
};

export const markAsRead = (axios: Axios) => async (gameId: string, conversationId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.markAsRead, { gameId, conversationId }, {}, {}, { withCredentials: true });
};

export const mute = (axios: Axios) => async (gameId: string, conversationId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.mute, { gameId, conversationId }, {}, {}, { withCredentials: true });
};

export const unmute = (axios: Axios) => async (gameId: string, conversationId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.unmute, { gameId, conversationId }, {}, {}, { withCredentials: true });
};

export const leave = (axios: Axios) => async (gameId: string, conversationId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.leave, { gameId, conversationId }, {}, {}, { withCredentials: true });
};

export const pinMessage = (axios: Axios) => async (gameId: string, conversationId: string, messageId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.pinMessage, { gameId, conversationId, messageId }, {}, {}, { withCredentials: true });
};

export const unpinMessage = (axios: Axios) => async (gameId: string, conversationId: string, messageId: string): Promise<ResponseResult<{}>> => {
  return doPatch(axios)(routes.unpinMessage, { gameId, conversationId, messageId }, {}, {}, { withCredentials: true });
};
