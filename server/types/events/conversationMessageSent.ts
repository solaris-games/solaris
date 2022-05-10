import { Conversation } from "../Conversation";
import { ConversationMessageSentResult } from "../ConversationMessage";
import { BaseGameEvent } from "./baseGameEvent";

export default interface ConversationMessageSentEvent extends BaseGameEvent {
    conversation: Conversation,
    sentMessageResult: ConversationMessageSentResult
};
