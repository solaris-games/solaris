import { ConversationMessage } from "./ConversationMessage";
import { DBObjectId } from "./DBObjectId";
import { TradeEvent } from "./Trade";

export interface Conversation {
    _id: DBObjectId;
    participants: DBObjectId[];
    createdBy: DBObjectId | null;
    name: string;
    messages: (ConversationMessage | TradeEvent)[];

    lastMessage?: ConversationMessage;
    unreadCount?: number;
};
