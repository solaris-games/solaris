const moment = require('moment');
const ValidationError = require('../errors/validation');

module.exports = class ConversationService {

    constructor(gameModel) {
        this.gameModel = gameModel;
    }

    async create(game, playerId, name, participantIds) {
        if (name == null || name.length > 100) {
            throw new ValidationError(`Name is required and must not exceed 100 characters.`);
        }

        // TODO: Check if a convo already exists with this name?

        // Append the current player ID to the participants if it isn't there already.
        if (!participantIds.find(x => x.toString() === playerId.toString())) {
            participantIds.push(playerId.toString());
        }

        // Create the convo.
        await this.gameModel.updateOne({
            _id: game._id
        }, {
            $push: {
                conversations: {
                    name,
                    createdBy: playerId,
                    participants: participantIds
                }
            }
        });
    }

    async list(game, playerId) {
        // List all conversations the player is participating in
        // and the last message that was sent
        // and the count of unread messages
        let convos = game.conversations.filter(c => c.participants.find(p => p.equals(playerId)));

        convos.forEach(c => {
            // Only return the last message
            c.messages = c.messages.slice(-1);

            // Calculate how many messages in this conversation the player has NOT read.
            c.unreadCount = c.messages.filter(m => m.readBy.find(r => r.equals(playerId)) == null).length;
        });

        return convos;
    }

    detail(game, playerId, conversationId) {
        // Get the conversation that the player has requested in full.
        let convo = game.conversations.find(c => c._id.toString() === conversationId.toString());

        if (convo == null) {
            throw new ValidationError(`The conversation requested does not exist.`);
        }

        if (convo.participants.find(p => p.equals(playerId) == null)) {
            throw new ValidationError(`You are not participating in this conversation.`);
        }
        
        return convo;
    }

    async send(game, playerId, conversationId, message) {
        let convo = this.detail(game, playerId, conversationId); // Call this for the validation.

        // Push a new message into the conversation messages array.
        await this.gameModel.updateOne({
            _id: game._id,
            'conversations._id': conversationId
        }, {
            $push: {
                'conversations.$.messages': {
                    fromPlayerId: playerId,
                    message,
                    sentDate: moment().utc(),
                    readBy: [playerId]
                }
            }
        });
    }

    async markMessageAsRead(game, playerId, conversationId, messageId) {
        // TODO: How to update an array in an array?
    }

    async markConversationAsRead(game, playerId, conversationId) {
        // TODO: How to update an array in an array?
    }

}