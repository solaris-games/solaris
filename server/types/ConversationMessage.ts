import { ObjectId } from "mongoose"

export interface ConversationMessage {
    _id: ObjectId;
    fromPlayerId: ObjectId;
    fromPlayerAlias: string;
    message: string;
    sentDate: Date;
    sentTick: number | null;
    pinned: boolean;
    readBy: ObjectId[];
};

export interface ConversationMessageSentResult extends ConversationMessage {
    conversationId: ObjectId;
    type: string;
    toPlayerIds: ObjectId[];
};
