import type {
    PlayerBulkInfrastructureUpgradedEvent,
    PlayerCarrierSpecialistHiredEvent,
    PlayerCombatCarrierEvent,
    PlayerCombatStarEvent,
    PlayerConversationCreatedEvent,
    PlayerConversationInvitedEvent,
    PlayerConversationLeftEvent,
    PlayerCreditsReceivedEvent,
    PlayerCreditsSentEvent,
    PlayerDebtForgivenEvent,
    PlayerDebtSettledEvent,
    PlayerDiplomacyStatusChangedEvent, PlayerGalacticCycleCompleteEvent,
    PlayerGiftReceivedEvent,
    PlayerGiftSentEvent, PlayerRenownReceivedEvent, PlayerRenownSentEvent, PlayerResearchCompleteEvent,
    PlayerSpecialistTokensReceivedEvent,
    PlayerSpecialistTokensSentEvent, PlayerStarAbandonedEvent, PlayerStarDiedEvent,
    PlayerStarReignitedEvent, PlayerStarSpecialistHiredEvent, PlayerTechnologyReceivedEvent, PlayerTechnologySentEvent
} from "./player";
import type {
    GameDiplomacyPeaceDeclaredEvent, GameDiplomacyWarDeclaredEvent,
    GameEndedEvent,
    GamePlayerAfkEvent, GamePlayerBadgePurchasedEvent,
    GamePlayerDefeatedEvent,
    GamePlayerJoinedEvent,
    GamePlayerQuitEvent,
    GameStartedEvent
} from "./game";

export const EVENT_TYPES = {
    GAME_PLAYER_JOINED: 'gamePlayerJoined',
    GAME_PLAYER_QUIT: 'gamePlayerQuit',
    GAME_PLAYER_DEFEATED: 'gamePlayerDefeated',
    GAME_PLAYER_AFK: 'gamePlayerAFK',
    GAME_STARTED: 'gameStarted',
    GAME_ENDED: 'gameEnded',
    GAME_PLAYER_BADGE_PURCHASED: 'gamePlayerBadgePurchased',
    GAME_DIPLOMACY_PEACE_DECLARED: 'gameDiplomacyPeaceDeclared',
    GAME_DIPLOMACY_WAR_DECLARED: 'gameDiplomacyWarDeclared',
    PLAYER_GALACTIC_CYCLE_COMPLETE: 'playerGalacticCycleComplete',
    PLAYER_COMBAT_STAR: 'playerCombatStar',
    PLAYER_COMBAT_CARRIER: 'playerCombatCarrier',
    PLAYER_RESEARCH_COMPLETE: 'playerResearchComplete',
    PLAYER_TECHNOLOGY_RECEIVED: 'playerTechnologyReceived',
    PLAYER_TECHNOLOGY_SENT: 'playerTechnologySent',
    PLAYER_CREDITS_RECEIVED: 'playerCreditsReceived',
    PLAYER_CREDITS_SENT: 'playerCreditsSent',
    PLAYER_CREDITS_SPECIALISTS_RECEIVED: 'playerCreditsSpecialistsReceived',
    PLAYER_CREDITS_SPECIALISTS_SENT: 'playerCreditsSpecialistsSent',
    PLAYER_RENOWN_RECEIVED: 'playerRenownReceived',
    PLAYER_RENOWN_SENT: 'playerRenownSent',
    PLAYER_GIFT_RECEIVED: 'playerGiftReceived',
    PLAYER_GIFT_SENT: 'playerGiftSent',
    PLAYER_STAR_ABANDONED: 'playerStarAbandoned',
    PLAYER_STAR_DIED: 'playerStarDied',
    PLAYER_STAR_REIGNITED: 'playerStarReignited',
    PLAYER_BULK_INFRASTRUCTURE_UPGRADED: 'playerBulkInfrastructureUpgraded',
    PLAYER_DEBT_SETTLED: 'playerDebtSettled',
    PLAYER_DEBT_FORGIVEN: 'playerDebtForgiven',
    PLAYER_STAR_SPECIALIST_HIRED: 'playerStarSpecialistHired',
    PLAYER_CARRIER_SPECIALIST_HIRED: 'playerCarrierSpecialistHired',
    PLAYER_CONVERSATION_CREATED: 'playerConversationCreated',
    PLAYER_CONVERSATION_INVITED: 'playerConversationInvited',
    PLAYER_CONVERSATION_LEFT: 'playerConversationLeft',
    PLAYER_DIPLOMACY_STATUS_CHANGED: 'playerDiplomacyStatusChanged',
}

export type GameEvent<ID> =
    | GamePlayerJoinedEvent<ID>
    | GamePlayerQuitEvent<ID>
    | GamePlayerDefeatedEvent<ID>
    | GamePlayerAfkEvent<ID>
    | GameStartedEvent<ID>
    | GameEndedEvent<ID>
    | GameDiplomacyPeaceDeclaredEvent<ID>
    | GameDiplomacyWarDeclaredEvent<ID>
    | GamePlayerBadgePurchasedEvent<ID>
    | PlayerCombatStarEvent<ID>
    | PlayerCombatCarrierEvent<ID>
    | PlayerBulkInfrastructureUpgradedEvent<ID>
    | PlayerCreditsReceivedEvent<ID>
    | PlayerCreditsSentEvent<ID>
    | PlayerSpecialistTokensReceivedEvent<ID>
    | PlayerSpecialistTokensSentEvent<ID>
    | PlayerDebtForgivenEvent<ID>
    | PlayerDebtSettledEvent<ID>
    | PlayerGiftReceivedEvent<ID>
    | PlayerGiftSentEvent<ID>
    | PlayerCarrierSpecialistHiredEvent<ID>
    | PlayerConversationCreatedEvent<ID>
    | PlayerConversationInvitedEvent<ID>
    | PlayerConversationLeftEvent<ID>
    | PlayerDiplomacyStatusChangedEvent<ID>
    | PlayerGalacticCycleCompleteEvent<ID>
    | PlayerStarSpecialistHiredEvent<ID>
    | PlayerRenownReceivedEvent<ID>
    | PlayerRenownSentEvent<ID>
    | PlayerResearchCompleteEvent<ID>
    | PlayerStarAbandonedEvent<ID>
    | PlayerStarDiedEvent<ID>
    | PlayerStarReignitedEvent<ID>
    | PlayerTechnologyReceivedEvent<ID>
    | PlayerTechnologySentEvent<ID>

export type PlayerEvent<ID> =
    | PlayerCombatStarEvent<ID>
    | PlayerCombatCarrierEvent<ID>
    | PlayerBulkInfrastructureUpgradedEvent<ID>
    | PlayerCreditsReceivedEvent<ID>
    | PlayerCreditsSentEvent<ID>
    | PlayerSpecialistTokensReceivedEvent<ID>
    | PlayerSpecialistTokensSentEvent<ID>
    | PlayerDebtForgivenEvent<ID>
    | PlayerDebtSettledEvent<ID>
    | PlayerGiftReceivedEvent<ID>
    | PlayerGiftSentEvent<ID>
    | PlayerCarrierSpecialistHiredEvent<ID>
    | PlayerConversationCreatedEvent<ID>
    | PlayerConversationInvitedEvent<ID>
    | PlayerConversationLeftEvent<ID>
    | PlayerDiplomacyStatusChangedEvent<ID>
    | PlayerGalacticCycleCompleteEvent<ID>
    | PlayerStarSpecialistHiredEvent<ID>
    | PlayerRenownReceivedEvent<ID>
    | PlayerRenownSentEvent<ID>
    | PlayerResearchCompleteEvent<ID>
    | PlayerStarAbandonedEvent<ID>
    | PlayerStarDiedEvent<ID>
    | PlayerStarReignitedEvent<ID>
    | PlayerTechnologyReceivedEvent<ID>
    | PlayerTechnologySentEvent<ID>
