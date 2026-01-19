import type { ConversationMessage } from "./conversationMessage";
import type { TradeEvent } from "./trade";
import type {DiplomacyEvent} from "./diplomacy";

export interface Conversation<ID> {
    _id: ID;
    participants: ID[];
    createdBy: ID | null;
    name: string;
    mutedBy?: ID[];
    messages: (ConversationMessage<ID> | TradeEvent<ID> | DiplomacyEvent<ID>)[];
    lastMessage?: ConversationMessage<ID>;
    unreadCount?: number;
    isMuted?: boolean;
};
