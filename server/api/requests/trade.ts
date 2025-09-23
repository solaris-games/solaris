import { ValidationError } from "solaris-common";
import { DBObjectId } from "../../services/types/DBObjectId";
import { ResearchTypeNotRandom } from "../../services/types/Player";
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
    
    if (body.amount != null && +body.amount <= 0) {
        errors.push('amount must be greater than 0.');
    }

    if (body.amount != null && +body.amount % 1 != 0) {
        errors.push('amount must be an integer.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    body.amount = +body.amount;

    return {
        toPlayerId: body.toPlayerId,
        amount: body.amount
    }
};

export interface TradeSendTechnologyToPlayerRequest {
    toPlayerId: DBObjectId;
    technology: ResearchTypeNotRandom;
    level: number;
};

export const mapToTradeSendTechnologyToPlayerRequest = (body: any): TradeSendTechnologyToPlayerRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'toPlayerId')) {
        errors.push('To Player Id is required.');
    }

    if (!keyHasStringValue(body, 'technology')) {
        errors.push('Technology is required.');
    }

    if (!keyHasNumberValue(body, 'level')) {
        errors.push('Level is required.');
    }
    
    if (body.level != null && body.level <= 0) {
        errors.push('Level must be greater than 0.');
    }

    if (body.level != null && +body.level % 1 != 0) {
        errors.push('level must be an integer.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    body.level = +body.level;

    return {
        toPlayerId: body.toPlayerId,
        technology: body.technology,
        level: body.level
    }
};
