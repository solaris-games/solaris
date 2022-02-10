import { DBObjectId } from "./DBObjectId";

export interface ReportReasons {
    abuse: boolean;
    spamming: boolean;
    multiboxing: boolean;
    inappropriateAlias: boolean;
};

export interface Report {
    _id: DBObjectId;
    gameId: DBObjectId;
    reportedPlayerId: DBObjectId;
    reportedUserId: DBObjectId;
    reportedPlayerAlias: string;
    reportedByPlayerId: DBObjectId;
    reportedByUserId: DBObjectId;
    reportedByPlayerAlias: string;
    reasons: ReportReasons,
    actioned: boolean;
};
