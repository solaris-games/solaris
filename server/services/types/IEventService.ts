import { CombatResult, Conversation, DiplomaticStatus, LedgerType } from '@solaris/common';
import { BulkUpgradeReport } from './InfrastructureUpgrade';
import { DBObjectId } from './DBObjectId';
import { Player } from './Player';
import { Carrier } from './Carrier';
import { Specialist } from '@solaris/common';
import { Star } from './Star';
import InternalGameDiplomacyPeaceDeclaredEvent from './internalEvents/GameDiplomacyPeaceDeclared';
import InternalGameDiplomacyWarDeclaredEvent from './internalEvents/GameDiplomacyWarDeclared';
import InternalGameEndedEvent from './internalEvents/GameEnded';
import InternalGamePlayerAFKEvent from './internalEvents/GamePlayerAFK';
import InternalGamePlayerBadgePurchasedEvent from './internalEvents/GamePlayerBadgePurchased';
import InternalGamePlayerDefeatedEvent from './internalEvents/GamePlayerDefeated';
import InternalGamePlayerJoinedEvent from './internalEvents/GamePlayerJoined';
import InternalGamePlayerQuitEvent from './internalEvents/GamePlayerQuit';
import InternalPlayerGalacticCycleCompletedEvent from './internalEvents/PlayerGalacticCycleComplete';
import { InternalGameEvent } from './internalEvents/InternalGameEvent';
import { TradeEventTechnology } from '@solaris/common';

export interface IEventService {
    // Game-level events
    createPlayerJoinedEvent(args: InternalGamePlayerJoinedEvent): Promise<void>;
    createPlayerQuitEvent(args: InternalGamePlayerQuitEvent): Promise<void>;
    createPlayerDefeatedEvent(args: InternalGamePlayerDefeatedEvent): Promise<void>;
    createPlayerAfkEvent(args: InternalGamePlayerAFKEvent): Promise<void>;
    createGameStartedEvent(args: InternalGameEvent): Promise<void>;
    createGameEndedEvent(args: InternalGameEndedEvent): Promise<void>;
    createGamePlayerBadgePurchased(args: InternalGamePlayerBadgePurchasedEvent): Promise<void>;
    createGameDiplomacyPeaceDeclared(args: InternalGameDiplomacyPeaceDeclaredEvent): Promise<void>;
    createGameDiplomacyWarDeclared(args: InternalGameDiplomacyWarDeclaredEvent): Promise<void>;

    // Player-level events
    createPlayerGalacticCycleCompleteEvent(data: InternalPlayerGalacticCycleCompletedEvent): Promise<void>;
    createPlayerCombatStarEvent(gameId: DBObjectId, gameTick: number, combatResult: CombatResult<DBObjectId>): Promise<void>;
    createPlayerCombatCarrierEvent(gameId: DBObjectId, gameTick: number, combatResult: CombatResult<DBObjectId>): Promise<void>;
    createResearchCompleteEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, technologyKey: string, technologyLevel: number, technologyKeyNext: string, technologyLevelNext: number): Promise<void>;
    createTechnologyReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology): Promise<void>;
    createTechnologySentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology): Promise<void>;
    createCreditsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number): Promise<void>;
    createCreditsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number): Promise<void>;
    createCreditsSpecialistsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number): Promise<void>;
    createCreditsSpecialistsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number): Promise<void>;
    createRenownReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number): Promise<void>;
    createRenownSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number): Promise<void>;
    createGiftReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star): Promise<void>;
    createGiftSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star): Promise<void>;
    createStarAbandonedEvent(gameId: DBObjectId, gameTick: number, player: Player, star: Star): Promise<void>;
    createStarDiedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string): Promise<void>;
    createStarReignitedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string): Promise<void>;
    createInfrastructureBulkUpgraded(gameId: DBObjectId, gameTick: number, player: Player, upgradeReport: BulkUpgradeReport): Promise<void>;
    createDebtAddedEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType): Promise<void>;
    createDebtSettledEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType): Promise<void>;
    createDebtForgivenEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType): Promise<void>;
    createPlayerStarSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, star: Star, specialist: Specialist): Promise<void>;
    createPlayerCarrierSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, carrier: Carrier, specialist: Specialist): Promise<void>;
    createPlayerConversationCreated(gameId: DBObjectId, gameTick: number, convo: Conversation<DBObjectId>): Promise<void>;
    createPlayerConversationInvited(gameId: DBObjectId, gameTick: number, convo: Conversation<DBObjectId>, playerId: DBObjectId): Promise<void>;
    createPlayerConversationLeft(gameId: DBObjectId, gameTick: number, convo: Conversation<DBObjectId>, playerId: DBObjectId): Promise<void>;
    createPlayerDiplomacyStatusChanged(gameId: DBObjectId, gameTick: number, status: DiplomaticStatus<DBObjectId>): Promise<void>;
}
