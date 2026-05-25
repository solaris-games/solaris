import { TradeEventTechnology } from '@solaris/common';
import { DBObjectId } from '../types/DBObjectId';
import { INotificationService } from '../types/INotificationService';
import { Player } from '../types/Player';
import InternalConversationMessageSentEvent from '../types/internalEvents/ConversationMessageSent';
import InternalGameEndedEvent from '../types/internalEvents/GameEnded';
import { InternalGameEvent } from '../types/internalEvents/InternalGameEvent';
import InternalGameTurnEndedEvent from '../types/internalEvents/GameTurnEnded';
import InternalPlayerGalacticCycleCompleteEvent from '../types/internalEvents/PlayerGalacticCycleComplete';

type ProcessingNotification =
    | ({ kind: 'gameStarted' } & InternalGameEvent)
    | ({ kind: 'gameEnded' } & InternalGameEndedEvent)
    | ({ kind: 'gameTurnEnded' } & InternalGameTurnEndedEvent)
    | ({ kind: 'trySendLastPlayerTurnReminder'; gameId: DBObjectId })
    | ({ kind: 'playerGalacticCycleCompleted' } & InternalPlayerGalacticCycleCompleteEvent)
    | ({ kind: 'playerResearchCompleted'; gameId: DBObjectId; playerId: DBObjectId; technologyKey: string; technologyLevel: number; technologyKeyNext: string; technologyLevelNext: number })
    | ({ kind: 'playerCreditsReceived'; gameId: DBObjectId; fromPlayer: Player; toPlayer: Player; amount: number })
    | ({ kind: 'playerCreditsSpecialistsReceived'; gameId: DBObjectId; fromPlayer: Player; toPlayer: Player; amount: number })
    | ({ kind: 'playerTechnologyReceived'; gameId: DBObjectId; fromPlayer: Player; toPlayer: Player; technology: TradeEventTechnology })
    | ({ kind: 'playerRenownReceived'; gameId: DBObjectId; fromPlayer: Player; toPlayer: Player; amount: number })
    | ({ kind: 'conversationMessageSent' } & InternalConversationMessageSentEvent);

export class ProcessingNotificationService implements INotificationService {
    private _notifications: ProcessingNotification[] = [];

    onGameStarted(args: InternalGameEvent): Promise<void> {
        this._notifications.push({ kind: 'gameStarted', ...args });
        return Promise.resolve();
    }

    onGameEnded(args: InternalGameEndedEvent): Promise<void> {
        this._notifications.push({ kind: 'gameEnded', ...args });
        return Promise.resolve();
    }

    onGameTurnEnded(args: InternalGameTurnEndedEvent): Promise<void> {
        this._notifications.push({ kind: 'gameTurnEnded', ...args });
        return Promise.resolve();
    }

    trySendLastPlayerTurnReminder(gameId: DBObjectId): Promise<void> {
        this._notifications.push({ kind: 'trySendLastPlayerTurnReminder', gameId });
        return Promise.resolve();
    }

    onPlayerGalacticCycleCompleted(args: InternalPlayerGalacticCycleCompleteEvent): Promise<void> {
        this._notifications.push({ kind: 'playerGalacticCycleCompleted', ...args });
        return Promise.resolve();
    }

    onPlayerResearchCompleted(gameId: DBObjectId, playerId: DBObjectId, technologyKey: string, technologyLevel: number, technologyKeyNext: string, technologyLevelNext: number): Promise<void> {
        this._notifications.push({ kind: 'playerResearchCompleted', gameId, playerId, technologyKey, technologyLevel, technologyKeyNext, technologyLevelNext });
        return Promise.resolve();
    }

    onPlayerCreditsReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number): Promise<void> {
        this._notifications.push({ kind: 'playerCreditsReceived', gameId, fromPlayer, toPlayer, amount });
        return Promise.resolve();
    }

    onPlayerCreditsSpecialistsReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number): Promise<void> {
        this._notifications.push({ kind: 'playerCreditsSpecialistsReceived', gameId, fromPlayer, toPlayer, amount });
        return Promise.resolve();
    }

    onPlayerTechnologyReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, technology: TradeEventTechnology): Promise<void> {
        this._notifications.push({ kind: 'playerTechnologyReceived', gameId, fromPlayer, toPlayer, technology });
        return Promise.resolve();
    }

    onPlayerRenownReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number): Promise<void> {
        this._notifications.push({ kind: 'playerRenownReceived', gameId, fromPlayer, toPlayer, amount });
        return Promise.resolve();
    }

    onConversationMessageSent(args: InternalConversationMessageSentEvent): Promise<void> {
        this._notifications.push({ kind: 'conversationMessageSent', ...args });
        return Promise.resolve();
    }

    async process(notificationService: INotificationService): Promise<void> {
        const notifications = this._notifications;
        this._notifications = [];

        for (const n of notifications) {
            switch (n.kind) {
                case 'gameStarted': {
                    const { kind, ...args } = n;
                    await notificationService.onGameStarted(args);
                    break;
                }
                case 'gameEnded': {
                    const { kind, ...args } = n;
                    await notificationService.onGameEnded(args);
                    break;
                }
                case 'gameTurnEnded': {
                    const { kind, ...args } = n;
                    await notificationService.onGameTurnEnded(args);
                    break;
                }
                case 'trySendLastPlayerTurnReminder':
                    await notificationService.trySendLastPlayerTurnReminder(n.gameId);
                    break;
                case 'playerGalacticCycleCompleted': {
                    const { kind, ...args } = n;
                    await notificationService.onPlayerGalacticCycleCompleted(args);
                    break;
                }
                case 'playerResearchCompleted':
                    await notificationService.onPlayerResearchCompleted(n.gameId, n.playerId, n.technologyKey, n.technologyLevel, n.technologyKeyNext, n.technologyLevelNext);
                    break;
                case 'playerCreditsReceived':
                    await notificationService.onPlayerCreditsReceived(n.gameId, n.fromPlayer, n.toPlayer, n.amount);
                    break;
                case 'playerCreditsSpecialistsReceived':
                    await notificationService.onPlayerCreditsSpecialistsReceived(n.gameId, n.fromPlayer, n.toPlayer, n.amount);
                    break;
                case 'playerTechnologyReceived':
                    await notificationService.onPlayerTechnologyReceived(n.gameId, n.fromPlayer, n.toPlayer, n.technology);
                    break;
                case 'playerRenownReceived':
                    await notificationService.onPlayerRenownReceived(n.gameId, n.fromPlayer, n.toPlayer, n.amount);
                    break;
                case 'conversationMessageSent': {
                    const { kind, ...args } = n;
                    await notificationService.onConversationMessageSent(args);
                    break;
                }
            }
        }
    }
}
