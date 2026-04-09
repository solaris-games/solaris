import {boolean, maybeUndefined, object, ReportCreateReportRequest, Validator} from "@solaris/common";
import { DBObjectId } from "../../services/types/DBObjectId";
import {objectId} from "../../utils/validation";

export const parseReportCreateReportRequest: Validator<ReportCreateReportRequest<DBObjectId>> = object({
    playerId: objectId,
    reasons: object({
        abuse: boolean,
        spamming: boolean,
        multiboxing: boolean,
        inappropriateAlias: boolean,
    }),
    conversation: maybeUndefined(object({
        conversationId: objectId,
        messageId: objectId,
    })),
});
