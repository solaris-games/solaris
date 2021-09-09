

module.exports = class BroadcastService {

    constructor(io) {
        this.io = io;
    }

    roomExists(socketId) {
        return this.io && this.io.sockets.adapter.rooms[socketId.toString()] != null;
    }

    gameRoomExists(game) {
        return this.io && this.io.sockets.adapter.rooms[roomId._id.toString()] != null;
    }

    playerRoomExists(player) {
        return this.io && this.io.sockets.adapter.rooms[player._id.toString()] != null;
    }

    getOnlinePlayers(game) {
        return game.galaxy.players.filter(p => this.playerRoomExists(p));
    }

    gameStarted(game) {
        this.io.to(game.id).emit('gameStarted', {
            state: game.state
        });
    }

    gamePlayerJoined(game, playerId, alias, avatar) {
        this.io.to(game.id).emit('gamePlayerJoined', {
            playerId,
            alias,
            avatar
        });
    }

    gamePlayerQuit(game, player) {
        this.io.to(game.id).emit('gamePlayerQuit', {
            playerId: player.id
        });
    }

    gamePlayerReady(game, player) {
        this.io.to(game.id).emit('gamePlayerReady', {
            playerId: player.id
        });
    }

    gamePlayerNotReady(game, player) {
        this.io.to(game.id).emit('gamePlayerNotReady', {
            playerId: player.id
        });
    }

    gamePlayerReadyToQuit(game, player) {
        this.io.to(game.id).emit('gamePlayerReadyToQuit', {
            playerId: player.id
        });
    }

    gamePlayerNotReadyToQuit(game, player) {
        this.io.to(game.id).emit('gamePlayerNotReadyToQuit', {
            playerId: player.id
        });
    }

    gameMessageSent(game, message) {
        message.toPlayerIds.forEach(p => this.io.to(p).emit('gameMessageSent', message));
    }

    gameConversationRead(game, conversation, readByPlayerId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationRead', {
            conversationId: conversation._id,
            readByPlayerId
        }));
    }

    gameConversationLeft(game, conversation, playerId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationLeft', {
            conversationId: conversation._id,
            playerId
        }));
    }

    gameConversationMessagePinned(game, conversation, messageId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationMessagePinned', {
            conversationId: conversation._id,
            messageId: messageId
        }));
    }

    gameConversationMessageUnpinned(game, conversation, messageId) {
        conversation.participants.forEach(p => this.io.to(p).emit('gameConversationMessageUnpinned', {
            conversationId: conversation._id,
            messageId: messageId
        }));
    }

    // gameMessagesAllRead(game, playerId) {
    //     this.io.to(playerId).emit('gameMessagesAllRead');
    // }

    playerEventRead(game, playerId, eventId) {
        this.io.to(playerId).emit('playerEventRead', {
            eventId
        })
    }

    playerAllEventsRead(game, playerId) {
        this.io.to(playerId).emit('playerAllEventsRead', {})
    }

    gamePlayerCreditsReceived(game, fromPlayerId, toPlayerId, credits, date) {
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

    gamePlayerCreditsSpecialistsReceived(game, fromPlayerId, toPlayerId, creditsSpecialists, date) {
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

    gamePlayerRenownReceived(game, fromPlayerId, toPlayerId, renown, date) {
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

    gamePlayerTechnologyReceived(game, fromPlayerId, toPlayerId, technology, date) {
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

    gamePlayerDebtAdded(debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        this.io.to(debtorPlayerId).emit('playerDebtAdded', data);
        this.io.to(creditorPlayerId).emit('playerDebtAdded', data);
    }

    gamePlayerDebtForgiven(debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        this.io.to(debtorPlayerId).emit('playerDebtForgiven', data);
        this.io.to(creditorPlayerId).emit('playerDebtForgiven', data);
    }

    gamePlayerDebtSettled(debtorPlayerId, creditorPlayerId, amount) {
        let data = {
            debtorPlayerId,
            creditorPlayerId,
            amount
        };

        this.io.to(debtorPlayerId).emit('playerDebtSettled', data);
        this.io.to(creditorPlayerId).emit('playerDebtSettled', data);
    }

    // userRenownReceived(game, toUserId, renown) {
    //     this.io.to(toUserId).emit('playerRenownReceived', renown); // TODO: Do we have a socket for the user?
    // }

};
