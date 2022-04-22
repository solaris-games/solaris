import DatabaseRepository from '../models/DatabaseRepository';
import { Config } from '../types/Config';
import { Conversation } from '../types/Conversation';
import { ConversationMessageSentResult } from '../types/ConversationMessage';
import { DBObjectId } from '../types/DBObjectId';
import { Game } from '../types/Game';
import { User } from '../types/User';
import AuthService from './auth';
import ConversationService from './conversation';

const Discord = require('discord.js');
const client = new Discord.Client();

export default class NotificationService {
    config: Config;
    userRepo: DatabaseRepository<User>;
    gameRepo: DatabaseRepository<Game>;
    authService: AuthService;
    conversationService: ConversationService;

    constructor(
        config: Config,
        userRepo: DatabaseRepository<User>,
        gameRepo: DatabaseRepository<Game>,
        authService: AuthService,
        conversationService: ConversationService
    ) {
        this.config = config;
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
        this.authService = authService;
        this.conversationService = conversationService;

        if (config.discord.botToken) { // Don't initialize the notification service if there's no token configured.
            client.login(config.discord.botToken);
    
            this.authService.on('onDiscordOAuthConnected', (e) => this.onDiscordOAuthConnected(e));

            this.conversationService.on('onConversationMessageSent', (e) => this.onConversationMessageSent(e));
        }
    }

    async _getNotificationContext(playerIds: string[]) {
        // Get the game that the players are in.
        const game = (await this.gameRepo.findOne({
            'galaxy.players._id': { $in: playerIds }
        }, {
            '_id': 1,
            'settings.general.name': 1,
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1
        }))!;

        // Filter to get the users, but only the ones
        // that have connected to Discord.
        const userIds = game?.galaxy.players
            .filter(p => playerIds.includes(p._id.toString()))
            .map(p => p.userId);

        const users = await this.userRepo.find({
            $and: [
                { _id: { $in: userIds } },
                { 'oauth.discord': { $ne: null } }
            ]
        }, {
            _id: 1,
            'oauth.discord': 1
        });

        return {
            game,
            users
        };
    }

    async onDiscordOAuthConnected(e) {
        const user = await client.users.fetch(e.discordUserId);

        user.send(`Hello there, you've just connected your Solaris account to Discord!`);
    }

    async onConversationMessageSent(e) {
        const convo: Conversation = e.conversation;
        const result: ConversationMessageSentResult = e.sentMessageResult;

        const toPlayerIds = result.toPlayerIds.map(id => id.toString());
        const readBy = result.readBy.map(id => id.toString());

        // Get the oauth settings for users who have not auto-read the message.
        const playerIdsToCheck = toPlayerIds.filter(pid => !readBy.includes(pid));

        const context = await this._getNotificationContext(playerIdsToCheck);

        // Attempt to send a message to each player
        for (let user of context.users) {
            const duser = await client.users.fetch(user.oauth.discord!.userId);

            if (!duser) {
                continue;
            }

            const template = this._generateConversationMessageTemplate(context.game, convo, result);

            duser.send(template);
        }
    }

    _generateConversationMessageTemplate(game: Game, convo: Conversation, result: ConversationMessageSentResult) {
        const footer = game.settings.general.name === convo.name ? 
            convo.name : `${game.settings.general.name} - ${convo.name}`;

        return new Discord.MessageEmbed()
            .setTitle(`New Message Received`)
            .setURL(`${this.config.clientUrl}/#/game/?id=${game._id}`)
            .setAuthor(result.fromPlayerAlias)
            .setDescription(result.message)
            .setTimestamp()
            .setFooter(footer);
    }
}