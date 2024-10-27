import AvatarService from "./avatar";
import { LedgerType } from "./ledger";
import { Conversation } from "./types/Conversation";
import { ConversationMessageSentResult } from "./types/ConversationMessage";
import { DBObjectId } from "./types/DBObjectId";
import { DiplomaticStatus } from "./types/Diplomacy";
import { Game } from "./types/Game";
import { Player } from "./types/Player";
import { TradeEventTechnology } from "./types/Trade";


export default class BroadcastService {
    io: any;

    constructor(private avatarService: AvatarService) {
    }

    setIOController(io) {
        this.io = io;
    }

    roomExists(socketId: DBObjectId) {
        return this.io && this.io.sockets.adapter.rooms[socketId.toString()] != null;
    }

    playerRoomExists(player: Player) {
        return this.io && this.io.sockets.adapter.rooms[player._id.toString()] != null;
    }

    getOnlinePlayers(game: Game) {
        return game.galaxy.players.filter(p => this.playerRoomExists(p));
    }

    gameStarted(game: Game) {
        this.io.to(game._id).emit('gameStarted', {
            state: game.state
        });
    }

    gamePlayerJoined(game: Game, playerId: DBObjectId, alias: string, avatar: number) {

        const avatars = this.avatarService.listAllAvatars();

        this.io.to(game._id).emit('gamePlayerJoined', {
            playerId,
            alias,
            avatar: avatars.find(a => a.id.toString() === avatar.toString())!.file
        });
    }

    gamePlayerQuit(game: Game, player: Player) {
        this.io.to(game._id).emit('gamePlayerQuit', {
            playerId: player._id
        });
    }

    gamePlayerReady(game: Game, player: Player) {
        this.io.to(game._id).emit('gamePlayerReady', {
            playerId: player._id
        });
    }

    gamePlayerNotReady(game: Game, player: Player) {
        this.io.to(game._id).emit('gamePlayerNotReady', {
            playerId: player._id
        });
    }

    gamePlayerReadyToQuit(game: Game, player: Player) {
        this.io.to(game._id).emit('gamePlayerReadyToQuit', {
            playerId: player._id
        });
    }

    gamePlayerNotReadyToQuit(game: Game, player: Player) {
        this.io.to(game._id).emit('gamePlayerNotReadyToQuit', {
            playerId: player._id
        });
    }

    gameMessageSent(game: Game, message: ConversationMessageSentResult) {
        // Note: We need to ensure we send to the users' socket, not the players as the player one
        // can be spoofed.
        const toUserIds = game.galaxy.players
            .filter(p => message.toPlayerIds.find(m => m.toString() === p._id.toString()) != null)
            .filter(p => p.userId != null)
            .map(p => p.userId!);

        toUserIds.forEach(p => this.io.to(p.toString()).emit('gameMessageSent', message));
    }

    gameConversationRead(game: Game, conversation: Conversation, readByPlayerId: DBObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationRead', {
            conversationId: conversation._id,
            readByPlayerId
        }));
    }

    gameConversationLeft(game: Game, conversation: Conversation, playerId: DBObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationLeft', {
            conversationId: conversation._id,
            playerId
        }));
    }

    gameConversationMessagePinned(game: Game, conversation: Conversation, messageId: DBObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationMessagePinned', {
            conversationId: conversation._id,
            messageId: messageId
        }));
    }

    gameConversationMessageUnpinned(game: Game, conversation: Conversation, messageId: DBObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationMessageUnpinned', {
            conversationId: conversation._id,
            messageId: messageId
        }));
    }

    // gameMessagesAllRead(game, playerId) {
    //     this.io.to(playerId).emit('gameMessagesAllRead');
    // }

    playerEventRead(game: Game, playerId: DBObjectId, eventId: DBObjectId) {
        this.io.to(playerId).emit('playerEventRead', {
            eventId
        })
    }

    playerAllEventsRead(game: Game, playerId: DBObjectId) {
        this.io.to(playerId).emit('playerAllEventsRead', {})
    }

    gamePlayerCreditsReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, credits: number, date: Date) {
        this.io.to(toPlayerId).emit('playerCreditsReceived', {
            playerId: toPlayerId,
            type: 'playerCreditsReceived',
            date,
            data: {
                fromPlayerId,
                toPlayerId,
                credits
            }
        });
    }

    gamePlayerCreditsSpecialistsReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, creditsSpecialists: number, date: Date) {
        this.io.to(toPlayerId).emit('playerCreditsSpecialistsReceived', {
            playerId: toPlayerId,
            type: 'playerCreditsSpecialistsReceived',
            date,
            data: {
                fromPlayerId,
                toPlayerId,
                creditsSpecialists
            }
        });
    }

    gamePlayerRenownReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, renown: number, date: Date) {
        this.io.to(toPlayerId).emit('playerRenownReceived', {
            playerId: toPlayerId,
            type: 'playerRenownReceived',
            date,
            data: {
                fromPlayerId,
                toPlayerId,
                renown
            }
        });
    }

    gamePlayerTechnologyReceived(game: Game, fromPlayerId: DBObjectId, toPlayerId: DBObjectId, technology: TradeEventTechnology, date: Date) {
        this.io.to(toPlayerId).emit('playerTechnologyReceived', {
            playerId: toPlayerId,
            type: 'playerTechnologyReceived',
            date,
            data: {
                fromPlayerId,
                toPlayerId,
                technology
            }
        });
    }

    gamePlayerDebtAdded(debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        this.io.to(debtorPlayerId).emit('playerDebtAdded', data);
        this.io.to(creditorPlayerId).emit('playerDebtAdded', data);
    }

    gamePlayerDebtForgiven(debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        this.io.to(debtorPlayerId).emit('playerDebtForgiven', data);
        this.io.to(creditorPlayerId).emit('playerDebtForgiven', data);
    }

    gamePlayerDebtSettled(debtorPlayerId: DBObjectId, creditorPlayerId: DBObjectId, amount: number, ledgerType: LedgerType) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount,
            ledgerType
        };

        this.io.to(debtorPlayerId).emit('playerDebtSettled', data);
        this.io.to(creditorPlayerId).emit('playerDebtSettled', data);
    }

    gamePlayerDiplomaticStatusChanged(playerIdFrom: DBObjectId, playerIdTo: DBObjectId, diplomaticStatus: DiplomaticStatus) {
        let data = {
            diplomaticStatus
        };

        this.io.to(playerIdFrom).emit('playerDiplomaticStatusChanged', data);
        this.io.to(playerIdTo).emit('playerDiplomaticStatusChanged', data);
    }

    // userRenownReceived(game, toUserId, renown) {
    //     this.io.to(toUserId).emit('playerRenownReceived', renown); // TODO: Do we have a socket for the user?
    // }

};
