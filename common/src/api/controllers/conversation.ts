import {GetRoute, PatchRoute, PostRoute} from "./index";
import type {ConversationMessage, ConversationMessageSentResult} from "../../types/common/conversationMessage";
import type {Conversation} from "../../types/common/conversation";

export type ConversationOverview<ID> = {
    _id: ID,
    participants: ID[],
    createdBy: ID,
    name: string,
    lastMessage: ConversationMessage<ID>,
    unreadCount: number,
    isMuted: boolean,
}

export type ConversationCreateConversationRequest<ID> = {
    name: string,
    participants: ID[],
};

export type ConversationSendMessageRequest = {
    message: string;
};

export const createConversationRoutes = <ID>() => ({
    list: new GetRoute<{ gameId: ID }, {}, ConversationOverview<ID>[]>("/api/game/:gameId/conversations"),
    listPrivate: new GetRoute<{ gameId: ID, withPlayerId: ID }, {}, ConversationOverview<ID> | null>("/api/game/:gameId/conversations/private/:withPlayerId"),
    getUnreadCount: new GetRoute<{ gameId: ID }, {}, { unread: number }>("/api/game/:gameId/conversations/unread"),
    detail: new GetRoute<{ gameId: ID, conversationId: ID }, {}, Conversation<ID>>("/api/game/:gameId/conversations/:conversationId"),
    create: new PostRoute<{ gameId: ID }, {}, ConversationCreateConversationRequest<ID>, Conversation<ID>>("/api/game/:gameId/conversations"),
    sendMessage: new PatchRoute<{ gameId: ID, conversationId: ID }, {}, ConversationSendMessageRequest, ConversationMessageSentResult<ID>>("/api/game/:gameId/conversations/:conversationId/send"),
    markAsRead: new PatchRoute<{ gameId: ID, conversationId: ID }, {}, {}, {}>("/api/game/:gameId/conversations/:conversationId/markAsRead"),
    mute: new PatchRoute<{ gameId: ID, conversationId: ID }, {}, {}, {}>("/api/game/:gameId/conversations/:conversationId/mute"),
    unmute: new PatchRoute<{ gameId: ID, conversationId: ID }, {}, {}, {}>("/api/game/:gameId/conversations/:conversationId/unmute"),
    leave: new PatchRoute<{ gameId: ID, conversationId: ID }, {}, {}, {}>("/api/game/:gameId/conversations/:conversationId/leave"),
    pinMessage: new PatchRoute<{ gameId: ID, conversationId: ID, messageId: ID }, {}, {}, {}>("/api/game/:gameId/conversations/:conversationId/pin/:messageId"),
    unpinMessage: new PatchRoute<{ gameId: ID, conversationId: ID, messageId: ID }, {}, {}, {}>("/api/game/:gameId/conversations/:conversationId/unpin/:messageId"),
});
