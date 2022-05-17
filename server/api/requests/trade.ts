import ValidationError from "../../errors/validation";
import { DBObjectId } from "../../types/DBObjectId";
import { ResearchTypeNotRandom } from "../../types/Player";
import { keyHasNumberValue, keyHasStringValue } from "./helpers";

export interface TradeSendToPlayerRequest {
    toPlayerId: DBObjectId;
    amount: number;
};

export const mapToTradeSendToPlayerRequest = (body: any, userId: any): TradeSendToPlayerRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'toPlayerId')) {
        errors.push('To Player ID is required.');
    }

    if (body.toPlayerId && userId === body.toPlayerId) {
        errors.push('Cannot trade with yourself.');
    }
    
    if (!keyHasNumberValue(body, 'amount')) {
        errors.push('amount is required.');
    }
    
    if (body.amount != null && body.amount <= 0) {
        errors.push('amount must be greater than 0.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        toPlayerId: body.toPlayerId,
        amount: body.amount
    }
};

export interface TradeSendTechnologyToPlayerRequest {
    toPlayerId: DBObjectId;
    amount: number;
    technology: ResearchTypeNotRandom;
    level: number;
};

export const mapToTradeSendTechnologyToPlayerRequest = (body: any): TradeSendTechnologyToPlayerRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'toPlayerId')) {
        errors.push('To Player Id is required.');
    }

    if (!keyHasNumberValue(body, 'amount')) {
        errors.push('Amount is required.');
    }

    if (!keyHasStringValue(body, 'technology')) {
        errors.push('Technology is required.');
    }

    if (!keyHasNumberValue(body, 'level')) {
        errors.push('Level is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        toPlayerId: body.toPlayerId,
        amount: body.amount,
        technology: body.technology,
        level: body.level
    }
};
