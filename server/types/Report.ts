import { ObjectId } from "mongoose";

export interface ReportReasons {
    abuse: boolean;
    spamming: boolean;
    multiboxing: boolean;
    inappropriateAlias: boolean;
};

export interface Report {
    _id?: ObjectId;
    gameId: ObjectId;
    reportedPlayerId: ObjectId;
    reportedUserId: ObjectId;
    reportedPlayerAlias: string;
    reportedByPlayerId: ObjectId;
    reportedByUserId: ObjectId;
    reportedByPlayerAlias: string;
    reasons: ReportReasons,
    actioned: boolean;
};
