import {
    ConversationCreateConversationRequest,
    ConversationSendMessageRequest,
    object,
    sizedArray,
    stringValue,
    Validator,
} from "@solaris/common";
import { DBObjectId } from "../../services/types/DBObjectId";
import { objectId } from "../../utils/validation";

const MAX_CONVERSATION_PARTICIPANTS = 64;

export const parseConversationCreateConversationRequest: Validator<
    ConversationCreateConversationRequest<DBObjectId>
> = object({
    name: stringValue({ minLength: 1 }),
    participants: sizedArray(1, MAX_CONVERSATION_PARTICIPANTS, objectId),
});

export const parseConversationSendMessageRequest: Validator<ConversationSendMessageRequest> =
    object({
        message: stringValue({ minLength: 1 }),
    });
