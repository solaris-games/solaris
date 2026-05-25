import { CombatResult, Conversation, DiplomaticStatus, LedgerType, Specialist, TradeEventTechnology } from '@solaris/common';
import { DBObjectId } from '../types/DBObjectId';
import { IEventService } from '../types/IEventService';
import InternalGameDiplomacyPeaceDeclaredEvent from '../types/internalEvents/GameDiplomacyPeaceDeclared';
import InternalGameDiplomacyWarDeclaredEvent from '../types/internalEvents/GameDiplomacyWarDeclared';
import InternalGameEndedEvent from '../types/internalEvents/GameEnded';
import InternalGamePlayerBadgePurchasedEvent from '../types/internalEvents/GamePlayerBadgePurchased';
import { InternalGameEvent } from '../types/internalEvents/InternalGameEvent';
import InternalGamePlayerAFKEvent from '../types/internalEvents/GamePlayerAFK';
import InternalGamePlayerDefeatedEvent from '../types/internalEvents/GamePlayerDefeated';
import InternalPlayerGalacticCycleCompleteEvent from '../types/internalEvents/PlayerGalacticCycleComplete';
import InternalGamePlayerJoinedEvent from '../types/internalEvents/GamePlayerJoined';
import { Player } from '../types/Player';
import { Star } from '../types/Star';
import InternalGamePlayerQuitEvent from '../types/internalEvents/GamePlayerQuit';
import { Carrier } from '../types/Carrier';
import { BulkUpgradeReport } from '../types/InfrastructureUpgrade';

type ProcessingEvent =
    | ({ kind: 'creditsReceived'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; credits: number })
    | ({ kind: 'creditsSent'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; credits: number })
    | ({ kind: 'creditsSpecialistsReceived'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; creditsSpecialists: number })
    | ({ kind: 'creditsSpecialistsSent'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; creditsSpecialists: number })
    | ({ kind: 'debtAdded'; gameId: DBObjectId; gameTick: number; debtorPlayerId: DBObjectId; creditorPlayerId: DBObjectId; amount: number; ledgerType: LedgerType })
    | ({ kind: 'debtForgiven'; gameId: DBObjectId; gameTick: number; debtorPlayerId: DBObjectId; creditorPlayerId: DBObjectId; amount: number; ledgerType: LedgerType })
    | ({ kind: 'debtSettled'; gameId: DBObjectId; gameTick: number; debtorPlayerId: DBObjectId; creditorPlayerId: DBObjectId; amount: number; ledgerType: LedgerType })
    | ({ kind: 'gameDiplomacyPeaceDeclared' } & InternalGameDiplomacyPeaceDeclaredEvent)
    | ({ kind: 'gameDiplomacyWarDeclared' } & InternalGameDiplomacyWarDeclaredEvent)
    | ({ kind: 'gameEnded' } & InternalGameEndedEvent)
    | ({ kind: 'gamePlayerBadgePurchased' } & InternalGamePlayerBadgePurchasedEvent)
    | ({ kind: 'gameStarted' } & InternalGameEvent)
    | ({ kind: 'giftReceived'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; carrier: Carrier; star: Star })
    | ({ kind: 'giftSent'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; carrier: Carrier; star: Star })
    | ({ kind: 'infrastructureBulkUpgraded'; gameId: DBObjectId; gameTick: number; player: Player; upgradeReport: BulkUpgradeReport })
    | ({ kind: 'playerAfk' } & InternalGamePlayerAFKEvent)
    | ({ kind: 'playerCarrierSpecialistHired'; gameId: DBObjectId; gameTick: number; player: Player; carrier: Carrier; specialist: Specialist })
    | ({ kind: 'playerCombatCarrier'; gameId: DBObjectId; gameTick: number; combatResult: CombatResult<DBObjectId> })
    | ({ kind: 'playerCombatStar'; gameId: DBObjectId; gameTick: number; combatResult: CombatResult<DBObjectId> })
    | ({ kind: 'playerConversationCreated'; gameId: DBObjectId; gameTick: number; convo: Conversation<DBObjectId> })
    | ({ kind: 'playerConversationInvited'; gameId: DBObjectId; gameTick: number; convo: Conversation<DBObjectId>; playerId: DBObjectId })
    | ({ kind: 'playerConversationLeft'; gameId: DBObjectId; gameTick: number; convo: Conversation<DBObjectId>; playerId: DBObjectId })
    | ({ kind: 'playerDefeated' } & InternalGamePlayerDefeatedEvent)
    | ({ kind: 'playerDiplomacyStatusChanged'; gameId: DBObjectId; gameTick: number; status: DiplomaticStatus<DBObjectId> })
    | ({ kind: 'playerGalacticCycleComplete' } & InternalPlayerGalacticCycleCompleteEvent)
    | ({ kind: 'playerJoined' } & InternalGamePlayerJoinedEvent)
    | ({ kind: 'playerQuit' } & InternalGamePlayerQuitEvent)
    | ({ kind: 'playerStarSpecialistHired'; gameId: DBObjectId; gameTick: number; player: Player; star: Star; specialist: Specialist })
    | ({ kind: 'renownReceived'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; renown: number })
    | ({ kind: 'renownSent'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; renown: number })
    | ({ kind: 'researchComplete'; gameId: DBObjectId; gameTick: number; playerId: DBObjectId; technologyKey: string; technologyLevel: number; technologyKeyNext: string; technologyLevelNext: number })
    | ({ kind: 'starAbandoned'; gameId: DBObjectId; gameTick: number; player: Player; star: Star })
    | ({ kind: 'starDied'; gameId: DBObjectId; gameTick: number; playerId: DBObjectId; starId: DBObjectId; starName: string })
    | ({ kind: 'starReignited'; gameId: DBObjectId; gameTick: number; playerId: DBObjectId; starId: DBObjectId; starName: string })
    | ({ kind: 'technologyReceived'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; technology: TradeEventTechnology })
    | ({ kind: 'technologySent'; gameId: DBObjectId; gameTick: number; fromPlayer: Player; toPlayer: Player; technology: TradeEventTechnology });

export class ProcessingEventService implements IEventService {
    private _events: ProcessingEvent[] = [];

    createCreditsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number): Promise<void> {
        this._events.push({ kind: 'creditsReceived', gameId, gameTick, fromPlayer, toPlayer, credits });
        return Promise.resolve();
    }

    createCreditsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, credits: number): Promise<void> {
        this._events.push({ kind: 'creditsSent', gameId, gameTick, fromPlayer, toPlayer, credits });
        return Promise.resolve();
    }

    createCreditsSpecialistsReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number): Promise<void> {
        this._events.push({ kind: 'creditsSpecialistsReceived', gameId, gameTick, fromPlayer, toPlayer, creditsSpecialists });
        return Promise.resolve();
    }

    createCreditsSpecialistsSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, creditsSpecialists: number): Promise<void> {
        this._events.push({ kind: 'creditsSpecialistsSent', gameId, gameTick, fromPlayer, toPlayer, creditsSpecialists });
        return Promise.resolve();
    }

    createDebtAddedEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType): Promise<void> {
        this._events.push({ kind: 'debtAdded', gameId, gameTick, debtorPlayerId, creditorPlayerId, amount, ledgerType });
        return Promise.resolve();
    }

    createDebtForgivenEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType): Promise<void> {
        this._events.push({ kind: 'debtForgiven', gameId, gameTick, debtorPlayerId, creditorPlayerId, amount, ledgerType });
        return Promise.resolve();
    }

    createDebtSettledEvent(gameId: DBObjectId, gameTick: number, debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType): Promise<void> {
        this._events.push({ kind: 'debtSettled', gameId, gameTick, debtorPlayerId, creditorPlayerId, amount, ledgerType });
        return Promise.resolve();
    }

    createGameDiplomacyPeaceDeclared(args: InternalGameDiplomacyPeaceDeclaredEvent): Promise<void> {
        this._events.push({ kind: 'gameDiplomacyPeaceDeclared', ...args });
        return Promise.resolve();
    }

    createGameDiplomacyWarDeclared(args: InternalGameDiplomacyWarDeclaredEvent): Promise<void> {
        this._events.push({ kind: 'gameDiplomacyWarDeclared', ...args });
        return Promise.resolve();
    }

    createGameEndedEvent(args: InternalGameEndedEvent): Promise<void> {
        this._events.push({ kind: 'gameEnded', ...args });
        return Promise.resolve();
    }

    createGamePlayerBadgePurchased(args: InternalGamePlayerBadgePurchasedEvent): Promise<void> {
        this._events.push({ kind: 'gamePlayerBadgePurchased', ...args });
        return Promise.resolve();
    }

    createGameStartedEvent(args: InternalGameEvent): Promise<void> {
        this._events.push({ kind: 'gameStarted', ...args });
        return Promise.resolve();
    }

    createGiftReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star): Promise<void> {
        this._events.push({ kind: 'giftReceived', gameId, gameTick, fromPlayer, toPlayer, carrier, star });
        return Promise.resolve();
    }

    createGiftSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, carrier: Carrier, star: Star): Promise<void> {
        this._events.push({ kind: 'giftSent', gameId, gameTick, fromPlayer, toPlayer, carrier, star });
        return Promise.resolve();
    }

    createInfrastructureBulkUpgraded(gameId: DBObjectId, gameTick: number, player: Player, upgradeReport: BulkUpgradeReport): Promise<void> {
        this._events.push({ kind: 'infrastructureBulkUpgraded', gameId, gameTick, player, upgradeReport });
        return Promise.resolve();
    }

    createPlayerAfkEvent(args: InternalGamePlayerAFKEvent): Promise<void> {
        this._events.push({ kind: 'playerAfk', ...args });
        return Promise.resolve();
    }

    createPlayerCarrierSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, carrier: Carrier, specialist: Specialist): Promise<void> {
        this._events.push({ kind: 'playerCarrierSpecialistHired', gameId, gameTick, player, carrier, specialist });
        return Promise.resolve();
    }

    createPlayerCombatCarrierEvent(gameId: DBObjectId, gameTick: number, combatResult: CombatResult<DBObjectId>): Promise<void> {
        this._events.push({ kind: 'playerCombatCarrier', gameId, gameTick, combatResult });
        return Promise.resolve();
    }

    createPlayerCombatStarEvent(gameId: DBObjectId, gameTick: number, combatResult: CombatResult<DBObjectId>): Promise<void> {
        this._events.push({ kind: 'playerCombatStar', gameId, gameTick, combatResult });
        return Promise.resolve();
    }

    createPlayerConversationCreated(gameId: DBObjectId, gameTick: number, convo: Conversation<DBObjectId>): Promise<void> {
        this._events.push({ kind: 'playerConversationCreated', gameId, gameTick, convo });
        return Promise.resolve();
    }

    createPlayerConversationInvited(gameId: DBObjectId, gameTick: number, convo: Conversation<DBObjectId>, playerId: DBObjectId): Promise<void> {
        this._events.push({ kind: 'playerConversationInvited', gameId, gameTick, convo, playerId });
        return Promise.resolve();
    }

    createPlayerConversationLeft(gameId: DBObjectId, gameTick: number, convo: Conversation<DBObjectId>, playerId: DBObjectId): Promise<void> {
        this._events.push({ kind: 'playerConversationLeft', gameId, gameTick, convo, playerId });
        return Promise.resolve();
    }

    createPlayerDefeatedEvent(args: InternalGamePlayerDefeatedEvent): Promise<void> {
        this._events.push({ kind: 'playerDefeated', ...args });
        return Promise.resolve();
    }

    createPlayerDiplomacyStatusChanged(gameId: DBObjectId, gameTick: number, status: DiplomaticStatus<DBObjectId>): Promise<void> {
        this._events.push({ kind: 'playerDiplomacyStatusChanged', gameId, gameTick, status });
        return Promise.resolve();
    }

    createPlayerGalacticCycleCompleteEvent(data: InternalPlayerGalacticCycleCompleteEvent): Promise<void> {
        this._events.push({ kind: 'playerGalacticCycleComplete', ...data });
        return Promise.resolve();
    }

    createPlayerJoinedEvent(args: InternalGamePlayerJoinedEvent): Promise<void> {
        this._events.push({ kind: 'playerJoined', ...args });
        return Promise.resolve();
    }

    createPlayerQuitEvent(args: InternalGamePlayerQuitEvent): Promise<void> {
        this._events.push({ kind: 'playerQuit', ...args });
        return Promise.resolve();
    }

    createPlayerStarSpecialistHired(gameId: DBObjectId, gameTick: number, player: Player, star: Star, specialist: Specialist): Promise<void> {
        this._events.push({ kind: 'playerStarSpecialistHired', gameId, gameTick, player, star, specialist });
        return Promise.resolve();
    }

    createRenownReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number): Promise<void> {
        this._events.push({ kind: 'renownReceived', gameId, gameTick, fromPlayer, toPlayer, renown });
        return Promise.resolve();
    }

    createRenownSentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, renown: number): Promise<void> {
        this._events.push({ kind: 'renownSent', gameId, gameTick, fromPlayer, toPlayer, renown });
        return Promise.resolve();
    }

    createResearchCompleteEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, technologyKey: string, technologyLevel: number, technologyKeyNext: string, technologyLevelNext: number): Promise<void> {
        this._events.push({ kind: 'researchComplete', gameId, gameTick, playerId, technologyKey, technologyLevel, technologyKeyNext, technologyLevelNext });
        return Promise.resolve();
    }

    createStarAbandonedEvent(gameId: DBObjectId, gameTick: number, player: Player, star: Star): Promise<void> {
        this._events.push({ kind: 'starAbandoned', gameId, gameTick, player, star });
        return Promise.resolve();
    }

    createStarDiedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string): Promise<void> {
        this._events.push({ kind: 'starDied', gameId, gameTick, playerId, starId, starName });
        return Promise.resolve();
    }

    createStarReignitedEvent(gameId: DBObjectId, gameTick: number, playerId: DBObjectId, starId: DBObjectId, starName: string): Promise<void> {
        this._events.push({ kind: 'starReignited', gameId, gameTick, playerId, starId, starName });
        return Promise.resolve();
    }

    createTechnologyReceivedEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology): Promise<void> {
        this._events.push({ kind: 'technologyReceived', gameId, gameTick, fromPlayer, toPlayer, technology });
        return Promise.resolve();
    }

    createTechnologySentEvent(gameId: DBObjectId, gameTick: number, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology): Promise<void> {
        this._events.push({ kind: 'technologySent', gameId, gameTick, fromPlayer, toPlayer, technology });
        return Promise.resolve();
    }

    async process(eventService: IEventService): Promise<void> {
        const events = this._events;
        this._events = [];

        for (const event of events) {
            switch (event.kind) {
                case 'creditsReceived':
                    await eventService.createCreditsReceivedEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.credits);
                    break;
                case 'creditsSent':
                    await eventService.createCreditsSentEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.credits);
                    break;
                case 'creditsSpecialistsReceived':
                    await eventService.createCreditsSpecialistsReceivedEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.creditsSpecialists);
                    break;
                case 'creditsSpecialistsSent':
                    await eventService.createCreditsSpecialistsSentEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.creditsSpecialists);
                    break;
                case 'debtAdded':
                    await eventService.createDebtAddedEvent(event.gameId, event.gameTick, event.debtorPlayerId, event.creditorPlayerId, event.amount, event.ledgerType);
                    break;
                case 'debtForgiven':
                    await eventService.createDebtForgivenEvent(event.gameId, event.gameTick, event.debtorPlayerId, event.creditorPlayerId, event.amount, event.ledgerType);
                    break;
                case 'debtSettled':
                    await eventService.createDebtSettledEvent(event.gameId, event.gameTick, event.debtorPlayerId, event.creditorPlayerId, event.amount, event.ledgerType);
                    break;
                case 'gameDiplomacyPeaceDeclared': {
                    const { kind, ...args } = event;
                    await eventService.createGameDiplomacyPeaceDeclared(args);
                    break;
                }
                case 'gameDiplomacyWarDeclared': {
                    const { kind, ...args } = event;
                    await eventService.createGameDiplomacyWarDeclared(args);
                    break;
                }
                case 'gameEnded': {
                    const { kind, ...args } = event;
                    await eventService.createGameEndedEvent(args);
                    break;
                }
                case 'gamePlayerBadgePurchased': {
                    const { kind, ...args } = event;
                    await eventService.createGamePlayerBadgePurchased(args);
                    break;
                }
                case 'gameStarted': {
                    const { kind, ...args } = event;
                    await eventService.createGameStartedEvent(args);
                    break;
                }
                case 'giftReceived':
                    await eventService.createGiftReceivedEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.carrier, event.star);
                    break;
                case 'giftSent':
                    await eventService.createGiftSentEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.carrier, event.star);
                    break;
                case 'infrastructureBulkUpgraded':
                    await eventService.createInfrastructureBulkUpgraded(event.gameId, event.gameTick, event.player, event.upgradeReport);
                    break;
                case 'playerAfk': {
                    const { kind, ...args } = event;
                    await eventService.createPlayerAfkEvent(args);
                    break;
                }
                case 'playerCarrierSpecialistHired':
                    await eventService.createPlayerCarrierSpecialistHired(event.gameId, event.gameTick, event.player, event.carrier, event.specialist);
                    break;
                case 'playerCombatCarrier':
                    await eventService.createPlayerCombatCarrierEvent(event.gameId, event.gameTick, event.combatResult);
                    break;
                case 'playerCombatStar':
                    await eventService.createPlayerCombatStarEvent(event.gameId, event.gameTick, event.combatResult);
                    break;
                case 'playerConversationCreated':
                    await eventService.createPlayerConversationCreated(event.gameId, event.gameTick, event.convo);
                    break;
                case 'playerConversationInvited':
                    await eventService.createPlayerConversationInvited(event.gameId, event.gameTick, event.convo, event.playerId);
                    break;
                case 'playerConversationLeft':
                    await eventService.createPlayerConversationLeft(event.gameId, event.gameTick, event.convo, event.playerId);
                    break;
                case 'playerDefeated': {
                    const { kind, ...args } = event;
                    await eventService.createPlayerDefeatedEvent(args);
                    break;
                }
                case 'playerDiplomacyStatusChanged':
                    await eventService.createPlayerDiplomacyStatusChanged(event.gameId, event.gameTick, event.status);
                    break;
                case 'playerGalacticCycleComplete': {
                    const { kind, ...args } = event;
                    await eventService.createPlayerGalacticCycleCompleteEvent(args);
                    break;
                }
                case 'playerJoined': {
                    const { kind, ...args } = event;
                    await eventService.createPlayerJoinedEvent(args);
                    break;
                }
                case 'playerQuit': {
                    const { kind, ...args } = event;
                    await eventService.createPlayerQuitEvent(args);
                    break;
                }
                case 'playerStarSpecialistHired':
                    await eventService.createPlayerStarSpecialistHired(event.gameId, event.gameTick, event.player, event.star, event.specialist);
                    break;
                case 'renownReceived':
                    await eventService.createRenownReceivedEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.renown);
                    break;
                case 'renownSent':
                    await eventService.createRenownSentEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.renown);
                    break;
                case 'researchComplete':
                    await eventService.createResearchCompleteEvent(event.gameId, event.gameTick, event.playerId, event.technologyKey, event.technologyLevel, event.technologyKeyNext, event.technologyLevelNext);
                    break;
                case 'starAbandoned':
                    await eventService.createStarAbandonedEvent(event.gameId, event.gameTick, event.player, event.star);
                    break;
                case 'starDied':
                    await eventService.createStarDiedEvent(event.gameId, event.gameTick, event.playerId, event.starId, event.starName);
                    break;
                case 'starReignited':
                    await eventService.createStarReignitedEvent(event.gameId, event.gameTick, event.playerId, event.starId, event.starName);
                    break;
                case 'technologyReceived':
                    await eventService.createTechnologyReceivedEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.technology);
                    break;
                case 'technologySent':
                    await eventService.createTechnologySentEvent(event.gameId, event.gameTick, event.fromPlayer, event.toPlayer, event.technology);
                    break;
            }
        }
    }
}
