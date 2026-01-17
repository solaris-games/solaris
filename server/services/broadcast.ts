import { GameState } from 'solaris-common';
import { ConversationMessageSentResult } from "solaris-common";
import { DiplomaticStatus } from 'solaris-common';
import { LedgerType } from 'solaris-common';
import { DiplomacyServerSocketEmitter } from '../sockets/socketEmitters/diplomacy';
import { GameServerSocketEmitter } from '../sockets/socketEmitters/game';
import { PlayerServerSocketEmitter } from '../sockets/socketEmitters/player';
import AvatarService from "./avatar";
import { Avatar } from './types/Avatar';
import { Conversation } from "./types/Conversation";
import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { Player } from "./types/Player";
import { TradeEventTechnology } from "solaris-common";
import {UserServerSocketEmitter} from "../sockets/socketEmitters/user";


export default class BroadcastService {

    constructor(private gameServerSocketEmitter: GameServerSocketEmitter,
                private playerServerSocketEmitter: PlayerServerSocketEmitter,
                private diplomacyServerSocketEmitter: DiplomacyServerSocketEmitter,
                private userServerSocketEmitter: UserServerSocketEmitter,
                private avatarService: AvatarService) {
    }

    gameStarted(game: Game) {
        this.gameServerSocketEmitter.emitGameStarted(game._id.toString(), {
            state: this.mapGameStateObjectIds(game.state)
        });
    }

    gamePlayerJoined(game: Game, playerId: DBObjectId, alias: string, avatar: number) {

        const avatars: Avatar[] = this.avatarService.listAllAvatars();

        this.playerServerSocketEmitter.emitGamePlayerJoined(game._id.toString(), {
            playerId: playerId.toString(),
            alias,
            avatar: avatars.find(a => a.id.toString() === avatar.toString())!.file
        });
    }

    gamePlayerQuit(game: Game, player: Player) {
        this.playerServerSocketEmitter.emitGamePlayerQuit(game._id.toString(), {
            playerId: player._id.toString()
        });
    }

    gamePlayerConcededDefeat(game: Game, player: Player) {
        this.playerServerSocketEmitter.emitGamePlayerConcededDefeat(game._id.toString(), {
            playerId: player._id.toString(),
        });
    }

    gamePlayerReady(game: Game, player: Player) {
        this.playerServerSocketEmitter.emitGamePlayerReady(game._id.toString(), {
            playerId: player._id.toString()
        });
    }

    gamePlayerNotReady(game: Game, player: Player) {
        this.playerServerSocketEmitter.emitGamePlayerNotReady(game._id.toString(), {
            playerId: player._id.toString()
        });
    }

    gamePlayerReadyToQuit(game: Game, player: Player | null) {
        this.playerServerSocketEmitter.emitGamePlayerReadyToQuit(game._id.toString(), {
            playerId: player?._id.toString()
        });
    }

    gamePlayerNotReadyToQuit(game: Game, player: Player | null) {
        this.playerServerSocketEmitter.emitGamePlayerNotReadyToQuit(game._id.toString(), {
            playerId: player?._id.toString()
        });
    }

    gameMessageSent(game: Game, message: ConversationMessageSentResult<DBObjectId>) {
        // Note: We need to ensure we send to the user's socket,
        // not the player's, as the player one can be spoofed.
        const toUserIds = game.galaxy.players
            .filter(p => message.toPlayerIds.find(m => m.toString() === p._id.toString()) != null)
            .filter(p => p.userId != null)
            .map(p => p.userId!);

        toUserIds.forEach(u => this.userServerSocketEmitter.emitGameMessageSent(u.toString(), this.mapConversationMessageSentResultObjectIds(message)));
    }

    gameConversationRead(game: Game, conversation: Conversation, readByPlayerId: DBObjectId) {
        this.playerServerSocketEmitter.emitGameConversationRead(readByPlayerId.toString(), {
            conversationId: conversation._id.toString(),
            readByPlayerId: readByPlayerId.toString()
        });
    }

    gameConversationLeft(game: Game, conversation: Conversation, playerId: DBObjectId) {
        conversation.participants.forEach(p => this.playerServerSocketEmitter.emitGameConversationLeft(p.toString(), {
            conversationId: conversation._id.toString(),
            playerId: playerId.toString()
        }));
    }

    gameConversationMessagePinned(game: Game, conversation: Conversation, messageId: DBObjectId) {
        conversation.participants.forEach(p => this.playerServerSocketEmitter.emitGameConversationMessagePinned(p.toString(), {
            conversationId: conversation._id.toString(),
            messageId: messageId.toString()
        }));
    }

    gameConversationMessageUnpinned(game: Game, conversation: Conversation, messageId: DBObjectId) {
        conversation.participants.forEach(p => this.playerServerSocketEmitter.emitGameConversationMessageUnpinned(p.toString(), {
            conversationId: conversation._id.toString(),
            messageId: messageId.toString()
        }));
    }

    // gameMessagesAllRead(game, playerId) {
    //     this.io.to(playerId).emit('gameMessagesAllRead');
    // }

    playerEventRead(game: Game, playerId: DBObjectId, eventId: DBObjectId) {
        this.playerServerSocketEmitter.emitPlayerEventRead(playerId.toString(), {
            eventId: eventId.toString()
        });
    }

    playerAllEventsRead(game: Game, playerId: DBObjectId) {
        this.playerServerSocketEmitter.emitPlayerAllEventsRead(playerId.toString(), {});
    }

    gamePlayerCreditsReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, credits: number, date: Date) {
        this.playerServerSocketEmitter.emitPlayerCreditsReceived(toPlayerId.toString(), {
            playerId: toPlayerId.toString(),
            type: 'playerCreditsReceived',
            date,
            data: {
                fromPlayerId: fromPlayerId.toString(),
                toPlayerId: toPlayerId.toString(),
                credits
            }
        });
    }

    gamePlayerCreditsSpecialistsReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, creditsSpecialists: number, date: Date) {
        this.playerServerSocketEmitter.emitPlayerCreditsSpecialistsReceived(toPlayerId.toString(), {
            playerId: toPlayerId.toString(),
            type: 'playerCreditsSpecialistsReceived',
            date,
            data: {
                fromPlayerId: fromPlayerId.toString(),
                toPlayerId: toPlayerId.toString(),
                creditsSpecialists
            }
        });
    }

    gamePlayerRenownReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, renown: number, date: Date) {
        this.playerServerSocketEmitter.emitPlayerRenownReceived(toPlayerId.toString(), {
            playerId: toPlayerId.toString(),
            type: 'playerRenownReceived',
            date,
            data: {
                fromPlayerId: fromPlayerId.toString(),
                toPlayerId: toPlayerId.toString(),
                renown
            }
        });
    }

    gamePlayerTechnologyReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, technology: TradeEventTechnology, date: Date) {
        this.playerServerSocketEmitter.emitPlayerTechnologyReceived(toPlayerId.toString(), {
            playerId: toPlayerId.toString(),
            type: 'playerTechnologyReceived',
            date,
            data: {
                fromPlayerId: fromPlayerId.toString(),
                toPlayerId: toPlayerId.toString(),
                technology
            }
        });
    }

    gamePlayerDebtAdded(debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId: debtorPlayerId.toString(),
            creditorPlayerId: creditorPlayerId.toString(),
            amount,
            ledgerType
        };

        this.playerServerSocketEmitter.emitPlayerDebtAdded(debtorPlayerId.toString(), data);
        this.playerServerSocketEmitter.emitPlayerDebtAdded(creditorPlayerId.toString(), data);
    }

    gamePlayerDebtForgiven(debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId: debtorPlayerId.toString(),
            creditorPlayerId: creditorPlayerId.toString(),
            amount,
            ledgerType
        };

        this.playerServerSocketEmitter.emitPlayerDebtForgiven(debtorPlayerId.toString(), data);
        this.playerServerSocketEmitter.emitPlayerDebtForgiven(creditorPlayerId.toString(), data);
    }

    gamePlayerDebtSettled(debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId: debtorPlayerId.toString(),
            creditorPlayerId: creditorPlayerId.toString(),
            amount,
            ledgerType
        };

        this.playerServerSocketEmitter.emitPlayerDebtSettled(debtorPlayerId.toString(), data);
        this.playerServerSocketEmitter.emitPlayerDebtSettled(creditorPlayerId.toString(), data);
    }

    gamePlayerDiplomaticStatusChanged(playerIdFrom: DBObjectId, playerIdTo: DBObjectId, diplomaticStatus: DiplomaticStatus<DBObjectId>) {
        let data = {
            diplomaticStatus: this.mapDiplomaticStatusObjectIds(diplomaticStatus)
        };

        this.diplomacyServerSocketEmitter.emitPlayerDiplomaticStatusChanged(playerIdFrom.toString(), data);
        this.diplomacyServerSocketEmitter.emitPlayerDiplomaticStatusChanged(playerIdTo.toString(), data);
    }

    // userRenownReceived(game, toUserId, renown) {
    //     this.io.to(toUserId).emit('playerRenownReceived', renown); // TODO: Do we have a socket for the user?
    // }

    private mapGameStateObjectIds(gameState: GameState<DBObjectId>): GameState<string> {
        const { winner, winningTeam, leaderboard, teamLeaderboard, ...gs } = gameState

        const newGameState = gs as GameState<string>;

        newGameState.winner = winner?.toString() ?? null;
        newGameState.winningTeam = winningTeam?.toString() ?? null;
        newGameState.leaderboard = leaderboard?.map(id => id.toString()) ?? null;
        newGameState.teamLeaderboard = teamLeaderboard?.map(id => id.toString()) ?? null;

        return newGameState;
    }

    mapConversationMessageSentResultObjectIds(conversationMessageSentResult: ConversationMessageSentResult<DBObjectId>): ConversationMessageSentResult<string> {
        const { _id, fromPlayerId, readBy, conversationId, toPlayerIds, gameId, ...cmsr } = conversationMessageSentResult;

        return {
            _id: _id?.toString(),
            fromPlayerId: fromPlayerId?.toString() ?? null,
            readBy: readBy.map(id => id.toString()),
            conversationId: conversationId.toString(),
            toPlayerIds: toPlayerIds.map(id => id.toString()),
            gameId: gameId.toString(),
            ...cmsr
        }
    }

    mapDiplomaticStatusObjectIds(diplomaticStatus: DiplomaticStatus<DBObjectId>): DiplomaticStatus<string> {
        const { playerIdFrom, playerIdTo, ...ds } = diplomaticStatus

        const newDiplomaticStatus = ds as DiplomaticStatus<string>;

        newDiplomaticStatus.playerIdFrom = playerIdFrom.toString();
        newDiplomaticStatus.playerIdTo = playerIdTo.toString();

        return newDiplomaticStatus;
    }
};
