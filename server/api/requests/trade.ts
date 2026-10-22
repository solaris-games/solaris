import {
    ValidationError,
    RESEARCH_TYPES_NOT_RANDOM,
    ResearchTypeNotRandom,
    numberAdv,
    object,
    stringEnumeration,
    Validator,
} from "@solaris/common";
import { DBObjectId } from "../../services/types/DBObjectId";
import { objectId } from "../../utils/validation";

export interface TradeSendToPlayerRequest {
    toPlayerId: DBObjectId;
    amount: number;
}

const tradeAmount = numberAdv({
    sign: "positive",
    integer: true,
    range: { from: 1 },
});

interface TradeSendToPlayerBody {
    toPlayerId: DBObjectId;
    amount: number;
}

const tradeSendToPlayerBody: Validator<TradeSendToPlayerBody> = object({
    toPlayerId: objectId,
    amount: tradeAmount,
});

export const parseTradeSendToPlayerRequest = (
    body: any,
    userId: any,
): TradeSendToPlayerRequest => {
    const reqObj = tradeSendToPlayerBody(body);

    if (reqObj.toPlayerId.toString() === userId.toString()) {
        throw new ValidationError("Cannot trade with yourself.");
    }

    return {
        toPlayerId: reqObj.toPlayerId,
        amount: reqObj.amount,
    };
};

export interface TradeSendTechnologyToPlayerRequest {
    toPlayerId: DBObjectId;
    technology: ResearchTypeNotRandom;
    level: number;
}

export const parseTradeSendTechnologyToPlayerRequest: Validator<TradeSendTechnologyToPlayerRequest> =
    object({
        toPlayerId: objectId,
        technology: stringEnumeration<
            ResearchTypeNotRandom,
            ResearchTypeNotRandom[]
        >(RESEARCH_TYPES_NOT_RANDOM),
        level: tradeAmount,
    });
