const moment = require('moment');
const ValidationError = require('../errors/validation');
const mongoose = require('mongoose');
const EventEmitter = require('events');

function arrayIsEqual(a, b) {
    if (a.length !== b.length) return false;

    const uniqueValues = new Set([...a, ...b]);

    for (const v of uniqueValues) {
        const aCount = a.filter(e => e === v).length;
        const bCount = b.filter(e => e === v).length;

        if (aCount !== bCount) return false;
    }

    return true;
}

function getNewConversation(game, playerId, name, participantIds) {
    if (name == null || !name.length || name.length > 100) {
        throw new ValidationError(`Name is required and must not exceed 100 characters.`);
    }

    // TODO: Check if a convo already exists with this name?

    // Append the current player ID to the participants if it isn't there already.
    if (playerId && !participantIds.find(x => x.toString() === playerId.toString())) {
        participantIds.unshift(playerId.toString());
    }

    if (participantIds.length < 2) {
        throw new ValidationError(`There must be at least 2 participants including yourself.`);
    }

    // Validate that another conversation doesn't already exist with the same participants.
    let existingConvo = game.conversations
        .filter(c => c.participants.length === participantIds.length)
        .find(c => arrayIsEqual(c.participants.map(p => p.toString()), participantIds));

    if (existingConvo) {
        throw new ValidationError(`A conversation already exists with the selected participants named [${existingConvo.name}].`);
    }

    let convoId = new mongoose.Types.ObjectId();

    let newConvo = {
        _id: convoId,
        name,
        createdBy: playerId,
        participants: participantIds
    };

    return newConvo;
}

module.exports = class ConversationService extends EventEmitter {

    constructor(gameModel, eventModel) {
        super();

        this.gameModel = gameModel;
        this.eventModel = eventModel;
    }

    async create(game, playerId, name, participantIds) {
        let newConvo = getNewConversation(game, playerId, name, participantIds);

        // Create the convo.
        await this.gameModel.updateOne({
            _id: game._id
        }, {
            $push: {
                conversations: newConvo
            }
        });

        this.emit('onConversationCreated', {
            game,
            convo: newConvo,
            playerId
        });

        for (let i = 1; i < newConvo.participants.length; i++) {
            this.emit('onConversationInvited', {
                game,
                convo: newConvo,
                playerId: newConvo.participants[i]
            });
        }

        return newConvo;
    }

    createConversationAllPlayers(game) {
        let name = game.settings.general.name;
        let participantIds = game.galaxy.players.map(p => p._id.toString());

        let newConvo = getNewConversation(game, null, name, participantIds);

        game.conversations.push(newConvo);
    }

    async list(game, playerId) {
        // List all conversations the player is participating in
        // and the last message that was sent
        // and the count of unread messages
        let convos = game.conversations.filter(c => c.participants.find(p => p.equals(playerId)));

        convos.forEach(c => {
            // Only return the last message
            c.lastMessage = c.messages.slice(-1)[0] || null;

            // Calculate how many messages in this conversation the player has NOT read.
            c.unreadCount = c.messages.filter(m => m.readBy.find(r => r.equals(playerId)) == null).length;

            delete c.messages;
        });

        return convos;
    }

    // Gets the summary of a single chat (if exists) between two players
    async privateChatSummary(game, playerIdA, playerIdB) {
        let convos = await this.list(game, playerIdA)

        // Find the chat with the other participant
        let convo = convos
            .filter(c => c.participants.length === 2)
            .find(c => {
                return c.participants.find(a => a.toString() === playerIdA.toString())
                    && c.participants.find(b => b.toString() === playerIdB.toString())
            });

        return convo || null;
    }

    async detail(game, playerId, conversationId, includeEvents = true) {
        // Get the conversation that the player has requested in full.
        let convo = game.conversations.find(c => c._id.toString() === conversationId.toString());

        if (convo == null) {
            throw new ValidationError(`The conversation requested does not exist.`);
        }

        if (convo.participants.find(p => p.equals(playerId) == null)) {
            throw new ValidationError(`You are not participating in this conversation.`);
        }

        convo.messages.forEach(m => {
            m.type = 'message'; // Append the type of message as we may add trade events.
        });

        // If there are only two participants, then include any trade events that occurred
        // between the players.
        if (includeEvents && convo.participants.length === 2) {
            let events = await this._getTradeEventsBetweenParticipants(game, playerId, convo.participants);

            convo.messages = convo.messages.concat(events);
        }

        // Sort by sent date ascending.
        convo.messages = convo.messages.sort((a, b) => a.sentDate - b.sentDate);
        
        return convo;
    }

    async send(game, playerId, conversationId, message) {
        message = message.trim()

        if (message === '') {
            throw new ValidationError(`Message must not be empty.`);
        }

        let convo = await this.detail(game, playerId, conversationId, false); // Call this for the validation.

        let newMessage = {
            fromPlayerId: playerId,
            message,
            sentDate: moment().utc(),
            sentTick: game.state.tick,
            readBy: [playerId]
        };

        // Push a new message into the conversation messages array.
        await this.gameModel.updateOne({
            _id: game._id,
            'conversations._id': conversationId
        }, {
            $push: {
                'conversations.$.messages': newMessage
            }
        });

        newMessage.conversationId = conversationId;
        newMessage.type = 'message';
        newMessage.toPlayerIds = convo.participants.filter(p => p.toString() !== playerId.toString());

        return newMessage;
    }

    async markConversationAsRead(game, playerId, conversationId) {
        let convo = await this.detail(game, playerId, conversationId, false);

        // Note: This is the best way as it may save a DB call
        // if there are no unread messages.
        let unreadMessages = convo.messages
            .filter(m => m.type === 'message')
            .filter(m => m.readBy.find(r => r.equals(playerId)) == null);
            //.map(m => m._id);

        if (unreadMessages.length) {
            // TODO: Fix this to use the straight DB method asap.
            unreadMessages.forEach(u => u.readBy.push(playerId));

            await game.save();

            // TODO: This doesn't work in prod because prod is running an older
            // version of MongoDB that doesn't support $[]
            // await this.gameModel.updateOne({
            //     _id: game._id,
            //     'conversations._id': conversationId,
            //     'conversations.messages._id': {
            //         $in: unreadMessages
            //     }
            // },
            // {
            //     $addToSet: {
            //         'conversations.$.messages.$[].readBy': playerId
            //     }
            // });
        }

        return convo;
    }

    async leave(game, playerId, conversationId) {
        let convo = await this.detail(game, playerId, conversationId, false);

        if (convo.createdBy == null) {
            throw new ValidationError(`Cannot leave this conversation.`);
        }

        await this.gameModel.updateOne({
            _id: game._id,
            'conversations._id': conversationId
        }, {
            $pull: {
                'conversations.$.participants': playerId
            }
        });

        // TODO: Delete the conversation if no longer any participants?

        this.emit('onConversationLeft', {
            game,
            convo,
            playerId
        });

        return convo;
    }

    async _getTradeEventsBetweenParticipants(game, playerId, participants) {
        let events = await this.eventModel.find({
            gameId: game._id,
            playerId: playerId,
            type: {
                $in: [
                    'playerCreditsReceived',
                    'playerRenownReceived',
                    'playerTechnologyReceived',
                    'playerCreditsSent',
                    'playerRenownSent',
                    'playerTechnologySent'
                ]
            },
            $or: [
                { 'data.fromPlayerId': { $in: participants } },
                { 'data.toPlayerId': { $in: participants } }
            ]
        })
        .lean({ defaults: true })
        .exec();

        return events
        .map(e => {
            return {
                playerId: e.playerId,
                type: e.type,
                data: e.data,
                sentDate: moment(e._id.getTimestamp()),
                sentTick: game.state.tick
            }
        });
    }

    getUnreadCount(game, playerId) {
        return game.conversations
            .filter(c => c.participants.find(p => p.equals(playerId)))
            .reduce((sum, c) => {
                return sum + c.messages.filter(m => m.readBy.find(r => r.equals(playerId)) == null).length
            }, 0);
    }

}