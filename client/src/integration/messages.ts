export type MessageData = {
  gameID: string,
  gameName: string,
  fromPlayerId: string | null,
  fromPlayerAlias: string,
}

export interface MessageIntegration {
  onConversationMessageReceived: (message: MessageData) => void;
}
