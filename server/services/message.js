const ValidationError = require('../errors/validation');

function getConversation(game, fromPlayerId, toPlayerId) {
    return game.messages || []
        .filter(m => (m.fromPlayerId.toString() === fromPlayerId.toString()
                    && m.toPlayerId.toString() === toPlayerId.toString())
                    ||
                    (m.fromPlayerId.toString() === toPlayerId.toString()
                    && m.toPlayerId.toString() === fromPlayerId.toString())
                )
        .sort((a, b) => a.sentDate - b.sentDate);
}

module.exports = class MessageService {
    
    list(game, userId, fromPlayerId) {
        let userPlayer = game.galaxy.players.find(p => p.userId.toString() === userId);

        if (!userPlayer) {
            throw new ValidationError('The user player does not exist.');
        }

        return getConversation(game, fromPlayerId, userPlayer._id);
    }

    summary(game, userId) {
        // Get the last message from all players, and null if there is none.
        let userPlayer = game.galaxy.players.find(p => p.userId.toString() === userId);

        let conversations = [];

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            if (player == userPlayer) {
                continue;
            }

            let conversation = getConversation(game, player._id, userPlayer._id);
            let lastMessage = conversation[conversation.length - 1] || null;

            conversations.push({
                playerId: player._id,
                lastMessage
            })
        }

        return conversations;
    }
    

    async send(game, userId, toPlayerId, message) {
        if (game.messages == null) {
            game.messages = [];
        }
        
        let fromPlayer = game.galaxy.players.find(p => p.userId.toString() === userId);
        let toPlayer = game.galaxy.players.find(p => p.id === toPlayerId);

        if (!fromPlayer) {
            throw new ValidationError('The from player does not exist.');
        }

        if (!toPlayer) {
            throw new ValidationError('The to player does not exist.');
        }

        let newMessage = {
            fromPlayerId: fromPlayer._id,
            toPlayerId: toPlayer._id,
            message,
            read: false,
            sentDate: new Date()
        };

        game.messages.push(newMessage);

        await game.save();
    }

}