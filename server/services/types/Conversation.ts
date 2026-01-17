import { ConversationMessage } from "./ConversationMessage";
import { DBObjectId } from "./DBObjectId";
import { TradeEvent } from "solaris-common";

export interface Conversation {
    _id: DBObjectId;
    participants: DBObjectId[];
    createdBy: DBObjectId | null;
    name: string;
    mutedBy?: DBObjectId[];
    messages: (ConversationMessage | TradeEvent<DBObjectId>)[];

    lastMessage?: ConversationMessage;
    unreadCount?: number;
    isMuted?: boolean;
};
