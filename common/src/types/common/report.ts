export interface ReportReasons {
    abuse: boolean;
    spamming: boolean;
    multiboxing: boolean;
    inappropriateAlias: boolean;
};

export interface Report<ID> {
    _id: ID;
    gameId: ID;
    reportedPlayerId: ID;
    reportedUserId: ID;
    reportedPlayerAlias: string;
    reportedByPlayerId: ID;
    reportedByUserId: ID;
    reportedByPlayerAlias: string;
    reportedConversationId: ID | null;
    reportedMessageId: ID | null;
    reasons: ReportReasons;
    actioned: boolean;
    actionedBy: ID | null;
    date: Date;
};
