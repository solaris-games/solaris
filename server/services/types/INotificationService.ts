import { TradeEventTechnology } from "@solaris/common";
import { DBObjectId } from "./DBObjectId";
import { Player } from "./Player";
import InternalConversationMessageSentEvent from "./internalEvents/ConversationMessageSent";
import { InternalGameEvent } from "./internalEvents/InternalGameEvent";
import InternalGameEndedEvent from "./internalEvents/GameEnded";
import InternalGameTurnEndedEvent from "./internalEvents/GameTurnEnded";
import PlayerGalacticCycleCompletedEvent from "./internalEvents/PlayerGalacticCycleComplete";

export interface INotificationService {
    onGameStarted(args: InternalGameEvent): Promise<void>;
    onGameEnded(args: InternalGameEndedEvent): Promise<void>;
    onGameTurnEnded(args: InternalGameTurnEndedEvent): Promise<void>;
    trySendLastPlayerTurnReminder(gameId: DBObjectId): Promise<void>;
    onPlayerGalacticCycleCompleted(
        args: PlayerGalacticCycleCompletedEvent,
    ): Promise<void>;
    onPlayerResearchCompleted(
        gameId: DBObjectId,
        playerId: DBObjectId,
        technologyKey: string,
        technologyLevel: number,
        technologyKeyNext: string,
        technologyLevelNext: number,
    ): Promise<void>;
    onPlayerCreditsReceived(
        gameId: DBObjectId,
        fromPlayer: Player,
        toPlayer: Player,
        amount: number,
    ): Promise<void>;
    onPlayerCreditsSpecialistsReceived(
        gameId: DBObjectId,
        fromPlayer: Player,
        toPlayer: Player,
        amount: number,
    ): Promise<void>;
    onPlayerTechnologyReceived(
        gameId: DBObjectId,
        fromPlayer: Player,
        toPlayer: Player,
        technology: TradeEventTechnology,
    ): Promise<void>;
    onPlayerRenownReceived(
        gameId: DBObjectId,
        fromPlayer: Player,
        toPlayer: Player,
        amount: number,
    ): Promise<void>;
    onConversationMessageSent(
        args: InternalConversationMessageSentEvent,
    ): Promise<void>;
}
