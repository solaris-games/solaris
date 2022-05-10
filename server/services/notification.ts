import DatabaseRepository from '../models/DatabaseRepository';
import { Config } from '../types/Config';
import { Conversation } from '../types/Conversation';
import { ConversationMessageSentResult } from '../types/ConversationMessage';
import { DBObjectId } from '../types/DBObjectId';
import { Game } from '../types/Game';
import { Player } from '../types/Player';
import { User } from '../types/User';
import AuthService from './auth';
import ConversationService from './conversation';
import GameService from './game';
import GameTickService from './gameTick';
import ResearchService from './research';
import TradeService from './trade';
import PlayerGalacticCycleCompletedEvent from './events/playerGalacticCycleComplete';

const Discord = require('discord.js');
const client = new Discord.Client();

// Note: We only support discord subscriptions at this point, if any new ones are added
// this class will need to be refactored to use something like the strategy pattern.
type SubscriptionType = 'discord';
type SubscriptionEvent = 'gameStarted'|
    'gameEnded'|
    'playerGalacticCycleComplete'|
    'playerResearchComplete'|
    'playerTechnologyReceived'|
    'playerCreditsReceived'|
    'playerCreditsSpecialistsReceived'|
    'playerRenownReceived';

export default class NotificationService {
    config: Config;
    userRepo: DatabaseRepository<User>;
    gameRepo: DatabaseRepository<Game>;
    authService: AuthService;
    conversationService: ConversationService;
    gameService: GameService;
    gameTickService: GameTickService;
    researchService: ResearchService;
    tradeService: TradeService;

    constructor(
        config: Config,
        userRepo: DatabaseRepository<User>,
        gameRepo: DatabaseRepository<Game>,
        authService: AuthService,
        conversationService: ConversationService,
        gameService: GameService,
        gameTickService: GameTickService,
        researchService: ResearchService,
        tradeService: TradeService
    ) {
        this.config = config;
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
        this.authService = authService;
        this.conversationService = conversationService;
        this.gameService = gameService;
        this.gameTickService = gameTickService;
        this.researchService = researchService;
        this.tradeService = tradeService;

        if (config.discord.botToken) { // Don't initialize the notification service if there's no token configured.
            client.login(config.discord.botToken);
    
            this.authService.on('onDiscordOAuthConnected', (e) => this.onDiscordOAuthConnected(e));

            // TODO: This can be easily abused.
            // TODO: The game id needs to be passed into the data
            // this.conversationService.on('onConversationMessageSent', (e) => this.onConversationMessageSent(e));

            this.gameService.on('onGameStarted', (args) => this.onGameStarted(args.gameId));
            this.gameTickService.on('onGameEnded', (args) => this.onGameEnded(args.gameId));
            this.gameTickService.on('onPlayerGalacticCycleCompleted', (args: PlayerGalacticCycleCompletedEvent) => this.onPlayerGalacticCycleCompleted(args));
            this.researchService.on('onPlayerResearchCompleted', (args) => this.onPlayerResearchCompleted(args.gameId, args.playerId, args.technologyKey, args.technologyLevel, args.technologyKeyNext, args.technologyLevelNext));
            this.tradeService.on('onPlayerCreditsReceived', (args) => this.onPlayerCreditsReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
            this.tradeService.on('onPlayerCreditsSpecialistsReceived', (args) => this.onPlayerCreditsSpecialistsReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
            this.tradeService.on('onPlayerRenownReceived', (args) => this.onPlayerRenownReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
            this.tradeService.on('onPlayerTechnologyReceived', (args) => this.onPlayerTechnologyReceived(args.gameId, args.fromPlayer, args.toPlayer, args.technology));
        }
    }

    async _getNotificationContext(gameId: DBObjectId, playerIds: string[] | null) {
        // Get the game that the players are in.
        const game = (await this.gameRepo.findOne({
            _id: gameId
        }, {
            '_id': 1,
            'settings.general.name': 1,
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1
        }))!;

        // Filter to get the user ids for the players in this context.
        const userIds = game?.galaxy.players
            .filter(p => !playerIds || playerIds.includes(p._id.toString()))
            .map(p => p.userId);

        // Get the user profiles for the filtered users in the context
        const users = await this.userRepo.find({
            $and: [
                { _id: { $in: userIds } },
                { 'oauth': { $ne: null } },
                { 'subscriptions': { $ne: null } }
            ]
        }, {
            _id: 1,
            'oauth': 1,
            'subscriptions': 1
        });

        return {
            game,
            users
        };
    }

    async _trySendNotifications(gameId: DBObjectId, playerIds: string[] | null, type: SubscriptionType, event: SubscriptionEvent, sendNotificationCallback: (game: Game, user: User) => any) {
        // Get the context of the notification; the game, users and their subscriptions.
        const context = await this._getNotificationContext(gameId, playerIds);

        // Try to send a notification to each user in the context
        for (let user of context.users) {
            if (
                !user.oauth || !user.oauth[type] ||                             // User doesn't have oauth or no oauth for the given type
                !user.subscriptions[type] || !user.subscriptions[type]![event]  // User doesn't have subscriptions for the type or no subscriptions for the given event
            ) {
                continue;
            }

            await sendNotificationCallback(context.game, user);
        }
    }

    async _trySendDiscordNotification(user: User, messageTemplate: any) {
        const duser = await client.users.fetch(user.oauth.discord!.userId);

        if (!duser) {
            return;
        }

        duser.send({
            embed: messageTemplate
        });
    }

    _generateBaseDiscordMessageTemplate(game: Game, title: string, description: string) {
        return {
            title,
            url: `${this.config.clientUrl}/#/game/?id=${game._id}`,
            author: {
                name: game.settings.general.name
            },
            description,
            fields: [] as any[],
            timestamp: new Date(),
            footer: {
                text: `Solaris`
            }
        }
    }

    async onDiscordOAuthConnected(e) {
        const user = await client.users.fetch(e.discordUserId);

        user.send(`Hello there, you've just connected your Solaris account to Discord!\r\n\r\n We'll start sending notifications to you for in-game events. To change your subscriptions, head over to your user account page.`);
    }

    async onGameStarted(gameId: DBObjectId) {
        // Send the game started notification for Discord subscription to all players.
        await this._trySendNotifications(gameId, null, 'discord', 'gameStarted',
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Game Started', 'The game has started. Good luck and have fun!');

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onGameEnded(gameId: DBObjectId) {
        // Send the game ended notification for Discord subscription to all players.
        await this._trySendNotifications(gameId, null, 'discord', 'gameEnded', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Game Ended', 'The game has ended.');

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onPlayerGalacticCycleCompleted(args: PlayerGalacticCycleCompletedEvent) {
        // Send the galactic cycle completed notification for Discord subscription to the player.
        await this._trySendNotifications(args.gameId, [args.playerId!.toString()], 'discord', 'playerGalacticCycleComplete', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Galactic Cycle Complete', 'A galactic cycle has finished! You have received new funds to spend upgrading your empire.');

                if (args.creditsEconomy) {
                    template.fields.push({
                        name: 'Credits from Economy',
                        value: args.creditsEconomy,
                        inline: true
                    });
                }

                if (args.creditsBanking) {
                    template.fields.push({
                        name: 'Credits from Banking',
                        value: args.creditsBanking,
                        inline: true
                    });
                }

                if (args.creditsSpecialists) {
                    template.fields.push({
                        name: 'Specialist Tokens',
                        value: args.creditsSpecialists,
                        inline: true
                    });
                }

                if (args.experimentTechnology) {
                    template.fields.push({
                        name: 'Experimentation',
                        value: `${args.experimentTechnology} (${args.experimentAmount} points)`,
                        inline: true
                    });
                }

                if (args.experimentLevelUp) {
                    template.fields.push({
                        name: 'Now Researching',
                        value: `${args.experimentResearchingNext}`,
                        inline: true
                    });
                }

                if (args.carrierUpkeep && (args.carrierUpkeep.carrierCount || args.carrierUpkeep.totalCost)) {
                    template.fields.push({
                        name: 'Carrier Upkeep',
                        value: `$${args.carrierUpkeep.totalCost} (${args.carrierUpkeep.carrierCount} carriers)`,
                        inline: true
                    });
                }

                if (args.allianceUpkeep && (args.allianceUpkeep.allianceCount || args.allianceUpkeep.totalCost)) {
                    template.fields.push({
                        name: 'Alliance Upkeep',
                        value: `$${args.allianceUpkeep.totalCost} (${args.allianceUpkeep.allianceCount} alliances)`,
                        inline: true
                    });
                }

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onPlayerResearchCompleted(gameId: DBObjectId, playerId: DBObjectId, technologyKey: string, technologyLevel: number, technologyKeyNext: string, technologyLevelNext: number) {
        // Send the research completed notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [playerId.toString()], 'discord', 'playerResearchComplete', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Research Complete', 'You have finished researching a technology.');

                template.fields.push({
                    name: 'Technology',
                    value: `${technologyKey} level ${technologyLevel}`,
                    inline: false
                });

                template.fields.push({
                    name: 'Now Researching',
                    value: `${technologyKeyNext} level ${technologyLevelNext}`,
                    inline: false
                });

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onPlayerCreditsReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number) {
        // Send the credits received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerCreditsReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Credits Received', `You have received **$${amount}** credit(s) from **${fromPlayer.alias}(()).`);

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onPlayerCreditsSpecialistsReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number) {
        // Send the specialist tokens received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerCreditsSpecialistsReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Specialist Tokens Received', `You have received **${amount}** specialist token(s) from **${fromPlayer.alias}**.`);

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onPlayerTechnologyReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, technology: any) {
        // Send the specialist tokens received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerTechnologyReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Technology Received', `You have received **Level ${technology.level} ${technology.name}** from **${fromPlayer.alias}**.`);

                await this._trySendDiscordNotification(user, template);
            });
    }

    async onPlayerRenownReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number) {
        // Send the renown received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerRenownReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Renown Received', `You have received **${amount}** renown from **${fromPlayer.alias}**.`);

                await this._trySendDiscordNotification(user, template);
            });
    }

    // TODO: All the other subscriptions

    // async onConversationMessageSent(e) {
    //     const gameId: DBObjectId = e.gameId;
    //     const convo: Conversation = e.conversation;
    //     const result: ConversationMessageSentResult = e.sentMessageResult;

    //     const toPlayerIds = result.toPlayerIds.map(id => id.toString());
    //     const readBy = result.readBy.map(id => id.toString());

    //     // Get the oauth settings for users who have not auto-read the message.
    //     const playerIdsToCheck = toPlayerIds.filter(pid => !readBy.includes(pid));

    //     const context = await this._getNotificationContext(gameId, playerIdsToCheck);

    //     // Attempt to send a message to each player
    //     for (let user of context.users) {
    //         const duser = await client.users.fetch(user.oauth.discord!.userId);

    //         if (!duser) {
    //             continue;
    //         }

    //         const template = this._generateConversationMessageTemplate(context.game, convo, result);

    //         duser.send(template);
    //     }
    // }

    // _generateConversationMessageTemplate(game: Game, convo: Conversation, result: ConversationMessageSentResult) {
    //     const footer = game.settings.general.name === convo.name ? 
    //         convo.name : `${game.settings.general.name} - ${convo.name}`;

    //     return new Discord.MessageEmbed()
    //         .setTitle(`New Message Received`)
    //         .setURL(`${this.config.clientUrl}/#/game/?id=${game._id}`)
    //         .setAuthor(result.fromPlayerAlias)
    //         .setDescription(result.message)
    //         .setTimestamp()
    //         .setFooter(footer);
    // }
}