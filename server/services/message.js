const ValidationError = require('../errors/validation');

function getConversation(game, fromPlayerId, toPlayerId) {
    return (game.messages || [])
        .filter(m => {
            return (m.fromPlayerId.toString() === fromPlayerId.toString()
                    && m.toPlayerId.toString() === toPlayerId.toString())
                    ||
                    (m.fromPlayerId.toString() === toPlayerId.toString()
                    && m.toPlayerId.toString() === fromPlayerId.toString());
        })
        .sort((a, b) => a.sentDate - b.sentDate);
}

module.exports = class MessageService {
    
    list(game, toPlayer, fromPlayerId) {
        return getConversation(game, fromPlayerId, toPlayer._id);
    }

    summary(game, player) {
        // Get the last message from all players, and null if there is none.
        let conversations = [];

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let p = game.galaxy.players[i];

            if (p == player) {
                continue;
            }

            let conversation = getConversation(game, p._id, player._id);
            let lastMessage = conversation[conversation.length - 1] || null;

            conversations.push({
                playerId: p._id,
                lastMessage
            })
        }

        return conversations;
    }
    

    async send(game, fromPlayer, toPlayerId, message) {
        if (game.messages == null) {
            game.messages = [];
        }
        
        let toPlayer = game.galaxy.players.find(p => p.id === toPlayerId);

        if (!fromPlayer) {
            throw new ValidationError('The from player does not exist.');
        }

        if (!toPlayer) {
            throw new ValidationError('The to player does not exist.');
        }

        if (fromPlayer == toPlayer) {
            throw new ValidationError('Cannot send a message to yourself');
        }

        let newMessage = {
            fromPlayerId: fromPlayer._id,
            toPlayerId: toPlayer._id,
            message,
            read: false,
            sentDate: new Date()
        };

        game.messages.push(newMessage);

        newMessage.toUserId = toPlayer.userId;

        await game.save();

        return newMessage;
    }

}