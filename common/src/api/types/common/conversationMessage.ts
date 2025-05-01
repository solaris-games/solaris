export interface ConversationMessage<ID> {
    _id?: ID;
    fromPlayerId: ID | null;
    fromPlayerAlias: string;
    message: string;
    sentDate: Date;
    sentTick: number | null;
    pinned: boolean;
    readBy: ID[];
    type?: 'message'|'event';
};

export interface ConversationMessageSentResult<ID> extends ConversationMessage<ID> {
    conversationId: ID;
    toPlayerIds: ID[];
    gameId: ID;
    gameName: string;
};
