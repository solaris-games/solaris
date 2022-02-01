import { ObjectId } from "mongoose";
import { ConversationMessage } from "./ConversationMessage";

export interface Conversation {
    _id?: ObjectId;
    participants: ObjectId[];
    createdBy: ObjectId | null;
    name: string;
    messages: [ConversationMessage]
};
