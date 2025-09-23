import { ValidationError } from "solaris-common";
import { DBObjectId } from "../../services/types/DBObjectId";
import { keyHasBooleanValue, keyHasObjectValue, keyHasStringValue } from "./helpers";

export interface ReportCreateReportRequest {
    playerId: DBObjectId;
    reasons: {
        abuse: boolean;
        spamming: boolean;
        multiboxing: boolean;
        inappropriateAlias: boolean;
    }
    conversationId?: DBObjectId;
    messageId?: DBObjectId;
};

export const mapToReportCreateReportRequest = (body: any): ReportCreateReportRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'playerId')) {
        errors.push('Player ID is required.');
    }

    if (!keyHasObjectValue(body, 'reasons')) {
        errors.push('Reasons is required.');
    }

    if (body.reasons) {
        if (!keyHasBooleanValue(body.reasons, 'abuse')) {
            errors.push('Abuse reason is required.');
        }

        if (!keyHasBooleanValue(body.reasons, 'spamming')) {
            errors.push('Spamming reason is required.');
        }
        
        if (!keyHasBooleanValue(body.reasons, 'multiboxing')) {
            errors.push('Multiboxing reason is required.');
        }
        
        if (!keyHasBooleanValue(body.reasons, 'inappropriateAlias')) {
            errors.push('Inappropriate reason is required.');
        }
    }

    const req: ReportCreateReportRequest = {
        playerId: body.playerId,
        reasons: body.reasons
    };

    if (body.conversationId) {
        if (body.messageId) {
            req.conversationId = body.conversationId;
            req.messageId = body.messageId;
        } else {
            errors.push('Message ID is required if conversation ID is provided.');
        }
    } else if (body.messageId) {
        errors.push('Conversation ID is required if message ID is provided.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return req;
};
