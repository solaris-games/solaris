import type { ConversationMessage } from "./conversationMessage";
import type { TradeEvent } from "./trade";

export interface Conversation<ID> {
    _id: ID;
    participants: ID[];
    createdBy: ID | null;
    name: string;
    mutedBy?: ID[];
    messages: (ConversationMessage<ID> | TradeEvent<ID>)[];
    lastMessage?: ConversationMessage<ID>;
    unreadCount?: number;
    isMuted?: boolean;
};
