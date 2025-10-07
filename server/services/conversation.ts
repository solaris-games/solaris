import BroadcastService from "./broadcast";

const moment = require('moment');
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Conversation } from './types/Conversation';
import { ConversationMessage, ConversationMessageSentResult } from './types/ConversationMessage';
import { Game } from './types/Game';
import { Player } from './types/Player';
import TradeService from './trade';
import ConversationMessageSentEvent from './types/events/ConversationMessageSent';
import DiplomacyService from './diplomacy';
import mongoose from 'mongoose';
const EventEmitter = require('events');

function arrayIsEqual(a, b): boolean {
    if (a.length !== b.length) return false;

    const uniqueValues = new Set([...a, ...b]);

    for (const v of uniqueValues) {
        const aCount = a.filter(e => e === v).length;
        const bCount = b.filter(e => e === v).length;

        if (aCount !== bCount) return false;
    }

    return true;
}

function getNewConversation(game: Game, playerId: DBObjectId | null, name: string, participantIds: DBObjectId[]): Conversation {
    if (name == null || !name.length || name.length > 100) {
        throw new ValidationError(`Name is required and must not exceed 100 characters.`);
    }

    // TODO: Check if a convo already exists with this name?

    // Append the current player ID to the participants if it isn't there already.
    if (playerId && !participantIds.find(x => x.toString() === playerId.toString())) {
        participantIds.unshift(playerId);
    }

    if (participantIds.length < 2) {
        throw new ValidationError(`There must be at least 2 participants including yourself.`);
    }

    // Validate that another conversation doesn't already exist with the same participants.
    const existingConvo = game.conversations
        .filter(c => c.participants.length === participantIds.length)
        .find(c => arrayIsEqual(c.participants.map(p => p.toString()), participantIds.map(pid => pid.toString())));

    if (existingConvo && existingConvo.name === name) {
        throw new ValidationError(`A conversation already exists with the same participants and name.`);
    }

    let convoId = new mongoose.Types.ObjectId();

    let newConvo: Conversation = {
        _id: convoId,
        name,
        createdBy: playerId,
        participants: participantIds,
        mutedBy: [],
        messages: []
    };

    return newConvo;
}

export const ConversationServiceEvents = {
    onConversationCreated: 'onConversationCreated',
    onConversationInvited: 'onConversationInvited',
    onConversationMessageSent: 'onConversationMessageSent',
    onConversationLeft: 'onConversationLeft'
}

export default class ConversationService extends EventEmitter {
    gameRepo: Repository<Game>;
    tradeService: TradeService;
    diplomacyService: DiplomacyService;
    broadcastService: BroadcastService;

    constructor(
        gameRepo: Repository<Game>,
        tradeService: TradeService,
        diplomacyService: DiplomacyService,
        broadcastService: BroadcastService,
    ) {
        super();

        this.gameRepo = gameRepo;
        this.tradeService = tradeService;
        this.diplomacyService = diplomacyService;
        this.broadcastService = broadcastService;
    }

    async create(game: Game, playerId: DBObjectId, name: string, participantIds: DBObjectId[]): Promise<Conversation> {
        let newConvo = getNewConversation(game, playerId, name, participantIds);

        // Create the convo.
        await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $push: {
                conversations: newConvo
            }
        });

        this.emit(ConversationServiceEvents.onConversationCreated, {
            gameId: game._id,
            gameTick: game.state.tick,
            convo: newConvo,
            playerId
        });

        for (let i = 1; i < newConvo.participants.length; i++) {
            this.emit(ConversationServiceEvents.onConversationInvited, {
                gameId: game._id,
                gameTick: game.state.tick,
                convo: newConvo,
                playerId: newConvo.participants[i]
            });
        }

        return newConvo;
    }

    createConversationAllPlayers(game: Game): void {
        let name = game.settings.general.name;
        let participantIds: DBObjectId[] = game.galaxy.players.map(p => p._id);

        let newConvo = getNewConversation(game, null, name, participantIds);
        
        let newMessage: ConversationMessage = {
            fromPlayerId: null,
            fromPlayerAlias: "Solaris",
            message: "Welcome to " + name + "!\n\nThis is the global chat. Any messages sent here will be delivered to all players in the game!\nPlease take a moment to familiarise yourself with our community guidelines.\n\nGood Luck, Commanders!",
            sentDate: moment().utc(),
            sentTick: game.state.tick,
            pinned: false,
            readBy: [],
        };
        newConvo.messages.push(newMessage);
        
        game.conversations.push(newConvo);

    }

    getGeneralConversation(game: Game): Conversation | undefined {
        return game.conversations.find(c => c.createdBy == null);
    }

    async list(game: Game, playerId: DBObjectId) {
        // List all conversations the player is participating in
        // and the last message that was sent
        // and the count of unread messages
        let convos = game.conversations.filter(c => c.participants.find(p => p.toString() === playerId.toString()));

        return convos.map(c => {
            const msgs: ConversationMessage[] = c.messages as ConversationMessage[];

            // Only return the last message
            const lastMessage = msgs.slice(-1)[0] || null;

            // Calculate how many messages in this conversation the player has NOT read.
            const unreadCount = msgs.filter(m => m.readBy.find(r => r.toString() === playerId.toString()) == null).length;
            const isMuted = c.mutedBy!.find(m => m.toString() === playerId.toString()) != null;

            return {
                _id: c._id,
                participants: c.participants,
                createdBy: c.createdBy,
                name: c.name,
                lastMessage,
                unreadCount,
                isMuted
            }
        });
    }

    // Gets the summary of a single chat (if exists) between two players
    async privateChatSummary(game: Game, playerIdA: DBObjectId, playerIdB: DBObjectId) {
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

    _getConversationForPlayer(game: Game, conversationId: DBObjectId, playerId: DBObjectId) {
        // Get the conversation that the player has requested in full.
        let convo = game.conversations.find(c => c._id.toString() === conversationId.toString());

        if (convo == null) {
            throw new ValidationError(`The conversation requested does not exist.`);
        }

        if (convo.participants.find(p => p.toString() === playerId.toString()) == null) {
            throw new ValidationError(`You are not participating in this conversation.`);
        }

        convo.messages.forEach(cm => {
            cm = <ConversationMessage>cm;
            cm.readBy = cm.readBy.filter(pid => pid.toString() === playerId.toString());
        })

        if (convo.lastMessage != null) {
            convo.lastMessage.readBy = convo.lastMessage.readBy.filter(pid => pid.toString() === playerId.toString());
        }

        return convo;
    }

    async detail(game: Game, playerId: DBObjectId, conversationId: DBObjectId) {
        let convo = this._getConversationForPlayer(game, conversationId, playerId);

        convo.isMuted = convo.mutedBy!.find(m => m.toString() === playerId.toString()) != null;
        delete convo.mutedBy;

        convo.messages.forEach(m => {
            m.type = 'message'; // Append the type of message as we may add trade events.
        });

        // If there are only two participants, then include any trade events that occurred
        // between the players.
        if (convo.participants.length === 2) {
            const playerIdA = playerId
            const playerIdB = convo.participants.filter(p => p.toString() !== playerIdA.toString())[0]

            // TODO: This needs to be refactored like the diplomacy service diplo events function as to not pass in an array of participants
            // because it doesnt make sense to do so, instead just pass in player A and player B.
            let tradeEvents = await this.tradeService.listTradeEventsBetweenPlayers(game, playerId, convo.participants);

            convo.messages = convo.messages.concat(tradeEvents);

            let diploEvents = await this.diplomacyService.listDiplomacyEventsBetweenPlayers(game, playerIdA, playerIdB)

            convo.messages = convo.messages.concat(diploEvents)
        }

        // Sort by sent date ascending.
        convo.messages = convo.messages.sort((a, b) => moment(a.sentDate).valueOf() - moment(b.sentDate).valueOf());
        
        return convo;
    }

    async sendSystemMessage(game: Game, conversation: Conversation, message: string): Promise<ConversationMessageSentResult> {
        message = message.trim()

        const newMessage: ConversationMessage = {
            fromPlayerId: null,
            fromPlayerAlias: "Solaris",
            message: message,
            sentDate: moment().utc(),
            sentTick: game.state.tick,
            pinned: false,
            readBy: [],
        }

        const toPlayerIds = conversation.participants;

        return await this._pushMessage(game, conversation, toPlayerIds, newMessage);
    }

    async send(game: Game, player: Player, conversationId: DBObjectId, message: string): Promise<ConversationMessageSentResult> {
        message = message.trim()

        if (message === '') {
            throw new ValidationError(`Message must not be empty.`);
        }

        // Get the conversation that the player has requested in full.
        let convo = game.conversations.find(c => c._id.toString() === conversationId.toString());

        if (convo == null) {
            throw new ValidationError(`The conversation requested does not exist.`);
        }

        if (convo.participants.find(p => p.toString() === player._id.toString()) == null) {
            throw new ValidationError(`You are not participating in this conversation.`);
        }

        let newMessage: ConversationMessage = {
            _id: new mongoose.Types.ObjectId(),
            fromPlayerId: player._id,
            fromPlayerAlias: player.alias!,
            message,
            sentDate: moment().utc(),
            sentTick: game.state.tick,
            pinned: false,
            readBy: convo.mutedBy!
        };

        if (!newMessage.readBy.find(r => r.toString() === player._id.toString())) {
            newMessage.readBy.push(player._id);
        }

        const toPlayerIds = convo.participants.filter(p => p.toString() !== player._id.toString());

        return await this._pushMessage(game, convo, toPlayerIds, newMessage);
    }

    async _pushMessage(game: Game, conversation: Conversation, toPlayerIds: DBObjectId[], newMessage: ConversationMessage) {
        // Push a new message into the conversation messages array.
        await this.gameRepo.updateOne({
            _id: game._id,
            'conversations._id': conversation._id,
        }, {
            $push: {
                'conversations.$.messages': newMessage
            }
        });


        const sentMessageResult: ConversationMessageSentResult = {
            ...newMessage,
            conversationId: conversation._id,
            type: 'message',
            toPlayerIds,
            gameId: game._id,
            gameName: game.settings.general.name,
        }

        let e: ConversationMessageSentEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            conversation,
            sentMessageResult
        };

        this.emit(ConversationServiceEvents.onConversationMessageSent, e);

        this.broadcastService.gameMessageSent(game, sentMessageResult);

        return sentMessageResult;
    }

    async markConversationAsRead(game: Game, playerId: DBObjectId, conversationId: DBObjectId) {
        let convo = this._getConversationForPlayer(game, conversationId, playerId);

        // Note: This is the best way as it may save a DB call
        // if there are no unread messages.
        let unreadMessages = (convo.messages as ConversationMessage[])
            .filter(m => m.readBy.find(r => r.toString() === playerId.toString()) == null)
            .map(m => m._id);

        if (unreadMessages.length) {
            await this.gameRepo.updateOne({
                _id: game._id,
                'conversations._id': conversationId,
                'conversations.messages._id': {
                    $in: unreadMessages
                }
            },
            {
                $addToSet: {
                    'conversations.$.messages.$[].readBy': playerId
                }
            });
        }

        return convo;
    }

    async leave(game: Game, playerId: DBObjectId, conversationId: DBObjectId) {
        let convo = this._getConversationForPlayer(game, conversationId, playerId);

        if (convo.createdBy == null) {
            throw new ValidationError(`Cannot leave this conversation.`);
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'conversations._id': conversationId
        }, {
            $pull: {
                'conversations.$.participants': playerId
            }
        });

        // TODO: Delete the conversation if no longer any participants?

        this.emit(ConversationServiceEvents.onConversationLeft, {
            gameId: game._id,
            gameTick: game.state.tick,
            convo,
            playerId
        });

        return convo;
    }

    leaveAll(game: Game, playerId: DBObjectId) {
        let convos = game.conversations.filter(c => c.createdBy && c.participants.indexOf(playerId) > -1);

        for (let convo of convos) {
            convo.participants.splice(
                convo.participants.indexOf(playerId),
                1
            );
        }
    }

    getUnreadCount(game: Game, playerId: DBObjectId) {
        return (game.conversations || [])
            .filter(c => c.participants.find(p => p.toString() === playerId.toString()))
            .reduce((sum, c) => {
                return sum + (c.messages as ConversationMessage[]).filter(m => m.readBy.find(r => r.toString() === playerId.toString()) == null).length
            }, 0);
    }

    async pinMessage(game: Game, conversationId: DBObjectId, messageId: DBObjectId) {
        return await this.setPinnedMessage(game, conversationId, messageId, true);
    }

    async unpinMessage(game: Game, conversationId: DBObjectId, messageId: DBObjectId) {
        return await this.setPinnedMessage(game, conversationId, messageId, false);
    }

    async setPinnedMessage(game: Game, conversationId: DBObjectId, messageId: DBObjectId, isPinned: boolean) {
        return await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $set: {
                'conversations.$[c].messages.$[m].pinned': isPinned
            }
        }, {
            arrayFilters: [
                {
                    'c._id': conversationId,
                    'c.createdBy': { $ne: null } // Not the global chat
                },
                {
                    'm._id': messageId
                }
            ]
        });
    }

    async mute(game: Game, playerId: DBObjectId, conversationId: DBObjectId) {
        return await this.gameRepo.updateOne({
            _id: game._id,
            'conversations._id': conversationId
        }, {
            $addToSet: {
                'conversations.$.mutedBy': playerId
            }
        });
    }

    async unmute(game: Game, playerId: DBObjectId, conversationId: DBObjectId) {
        return await this.gameRepo.updateOne({
            _id: game._id,
            'conversations._id': conversationId
        }, {
            $pull: {
                'conversations.$.mutedBy': playerId
            }
        });
    }

}