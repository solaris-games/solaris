import { Conversation } from "../Conversation";
import { ConversationMessageSentResult } from "../ConversationMessage";
import { InternalGameEvent } from "./InternalGameEvent";

export default interface InternalConversationMessageSentEvent extends InternalGameEvent {
    conversation: Conversation,
    sentMessageResult: ConversationMessageSentResult
};
