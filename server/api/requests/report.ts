import ValidationError from "../../errors/validation";
import { DBObjectId } from "../../types/DBObjectId";
import { keyHasBooleanValue, keyHasObjectValue, keyHasStringValue } from "./helpers";

export interface ReportCreateReportRequest {
    playerId: DBObjectId;
    reasons: {
        abuse: boolean;
        spamming: boolean;
        multiboxing: boolean;
        inappropriateAlias: boolean;
    }
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

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        playerId: body.playerId,
        reasons: body.reasons
    }
};
