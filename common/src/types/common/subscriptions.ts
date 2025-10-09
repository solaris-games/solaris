export interface UserSubscriptions {
    settings: {
        notifyActiveGamesOnly: boolean;
    },
    inapp?: {
        notificationsForOtherGames: boolean;
    },
    discord?: {
        gameStarted: boolean;
        gameEnded: boolean;
        gameTurnEnded: boolean;
        playerGalacticCycleComplete: boolean;
        playerResearchComplete: boolean;
        playerTechnologyReceived: boolean;
        playerCreditsReceived: boolean;
        playerCreditsSpecialistsReceived: boolean;
        playerRenownReceived: boolean;
        conversationMessageSent: boolean;
    }
}