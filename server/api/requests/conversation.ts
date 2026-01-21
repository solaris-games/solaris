import {ConversationCreateConversationRequest, ConversationSendMessageRequest, ValidationError} from "solaris-common";
import { DBObjectId } from "../../services/types/DBObjectId";
import { keyHasArrayValue, keyHasStringValue } from "./helpers";

export const mapToConversationCreateConversationRequest = (body: any): ConversationCreateConversationRequest<DBObjectId> => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'name')) {
        errors.push('Name is required.');
    }

    if (!keyHasArrayValue(body, 'participants')) {
        errors.push('Participants is required.');
    }

    if (body.participants && !body.participants.length) {
        errors.push('At least 1 participant is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }
    
    return {
        name: body.name,
        participants: body.participants
    }
};

export const mapToConversationSendMessageRequest = (body: any): ConversationSendMessageRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'message')) {
        errors.push('Message is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }
    
    return {
        message: body.message
    }
};
