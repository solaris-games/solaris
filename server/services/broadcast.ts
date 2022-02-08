import { ObjectId } from "mongoose";
import { Conversation } from "../types/Conversation";
import { ConversationMessageSentResult } from "../types/ConversationMessage";
import { Game } from "../types/Game";
import { Player } from "../types/Player";


export default class BroadcastService {
    io: any;

    constructor(io: any) {
        this.io = io;
    }

    roomExists(socketId: ObjectId) {
        return this.io && this.io.sockets.adapter.rooms[socketId.toString()] != null;
    }

    playerRoomExists(player: Player) {
        return this.io && this.io.sockets.adapter.rooms[player._id!.toString()] != null;
    }

    getOnlinePlayers(game: Game) {
        return game.galaxy.players.filter(p => this.playerRoomExists(p));
    }

    gameStarted(game: Game) {
        this.io.to(game._id).emit('gameStarted', {
            state: game.state
        });
    }

    gamePlayerJoined(game: Game, playerId: ObjectId, alias: string, avatar: number) {
        this.io.to(game._id).emit('gamePlayerJoined', {
            playerId,
            alias,
            avatar
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
        this.io.to(game.id).emit('gamePlayerReadyToQuit', {
            playerId: player.id
        });
    }

    gamePlayerNotReadyToQuit(game: Game, player: Player) {
        this.io.to(game.id).emit('gamePlayerNotReadyToQuit', {
            playerId: player.id
        });
    }

    gameMessageSent(game: Game, message: ConversationMessageSentResult) {
        message.toPlayerIds.forEach(p => this.io.to(p).emit('gameMessageSent', message));
    }

    gameConversationRead(game: Game, conversation: Conversation, readByPlayerId: ObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationRead', {
            conversationId: conversation._id,
            readByPlayerId
        }));
    }

    gameConversationLeft(game: Game, conversation: Conversation, playerId: ObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationLeft', {
            conversationId: conversation._id,
            playerId
        }));
    }

    gameConversationMessagePinned(game: Game, conversation: Conversation, messageId: ObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationMessagePinned', {
            conversationId: conversation._id,
            messageId: messageId
        }));
    }

    gameConversationMessageUnpinned(game: Game, conversation: Conversation, messageId: ObjectId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationMessageUnpinned', {
            conversationId: conversation._id,
            messageId: messageId
        }));
    }

    // gameMessagesAllRead(game, playerId) {
    //     this.io.to(playerId).emit('gameMessagesAllRead');
    // }

    playerEventRead(game: Game, playerId: ObjectId, eventId: ObjectId) {
        this.io.to(playerId).emit('playerEventRead', {
            eventId
        })
    }

    playerAllEventsRead(game: Game, playerId: ObjectId) {
        this.io.to(playerId).emit('playerAllEventsRead', {})
    }

    gamePlayerCreditsReceived(game: Game, fromPlayerId: ObjectId, toPlayerId: ObjectId, credits: number, date: Date) {
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

    gamePlayerCreditsSpecialistsReceived(game: Game, fromPlayerId: ObjectId, toPlayerId: ObjectId, creditsSpecialists: number, date: Date) {
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

    gamePlayerRenownReceived(game: Game, fromPlayerId: ObjectId, toPlayerId: ObjectId, renown: number, date: Date) {
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

    gamePlayerTechnologyReceived(game: Game, fromPlayerId: ObjectId, toPlayerId: ObjectId, technology: string, date: Date) {
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

    gamePlayerDebtAdded(debtorPlayerId: ObjectId, creditorPlayerId: ObjectId, amount: number) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        this.io.to(debtorPlayerId).emit('playerDebtAdded', data);
        this.io.to(creditorPlayerId).emit('playerDebtAdded', data);
    }

    gamePlayerDebtForgiven(debtorPlayerId: ObjectId, creditorPlayerId: ObjectId, amount: number) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        this.io.to(debtorPlayerId).emit('playerDebtForgiven', data);
        this.io.to(creditorPlayerId).emit('playerDebtForgiven', data);
    }

    gamePlayerDebtSettled(debtorPlayerId: ObjectId, creditorPlayerId: ObjectId, amount: number) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        this.io.to(debtorPlayerId).emit('playerDebtSettled', data);
        this.io.to(creditorPlayerId).emit('playerDebtSettled', data);
    }

    gamePlayerDiplomaticStatusChanged(playerIdFrom: ObjectId, playerIdTo: ObjectId, diplomaticStatus: string) {
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
