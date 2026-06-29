import { PostRoute } from "./index";

export type ReportCreateReportRequest<ID> = {
    playerId: ID;
    reasons: {
        abuse: boolean;
        spamming: boolean;
        multiboxing: boolean;
        inappropriateAlias: boolean;
    };
    conversation?: {
        conversationId: ID;
        messageId: ID;
    };
};

export const createReportRoutes = <ID>() => ({
    createReport: new PostRoute<
        { gameId: ID },
        {},
        ReportCreateReportRequest<ID>,
        {}
    >("/api/game/:gameId/report"),
});
