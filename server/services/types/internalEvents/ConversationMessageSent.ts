import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";
import {Conversation, ConversationMessageSentResult} from "solaris-common";

export default interface InternalConversationMessageSentEvent extends InternalGameEvent {
    conversation: Conversation<DBObjectId>,
    sentMessageResult: ConversationMessageSentResult<DBObjectId>,
};
