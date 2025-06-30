import Repository from './repository';
import { Config } from '../config/types/Config';
import { DBObjectId } from './types/DBObjectId';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { User } from './types/User';
import DiscordService from './discord';
import ConversationService, { ConversationServiceEvents } from './conversation';
import GameService from './game';
import GameTickService, { GameTickServiceEvents } from './gameTick';
import ResearchService, { ResearchServiceEvents } from './research';
import TradeService, { TradeServiceEvents } from './trade';
import PlayerGalacticCycleCompletedEvent from './types/events/PlayerGalacticCycleComplete';
import { BaseGameEvent } from './types/events/BaseGameEvent';
import GameEndedEvent from './types/events/GameEnded';
import GameTurnEndedEvent from './types/events/GameTurnEnded';
import ConversationMessageSentEvent from './types/events/ConversationMessageSent';
import GameJoinService, { GameJoinServiceEvents } from './gameJoin';
import {logger} from "../utils/logging";
import PlayerReadyService, { PlayerReadyServiceEvents } from './playerReady';
import GameTypeService from './gameType';
import GameStateService from './gameState';

const log = logger("Notification Service");

// Note: We only support discord subscriptions at this point, if any new ones are added
// this class will need to be refactored to use something like the strategy pattern.
type SubscriptionType = 'discord';
type SubscriptionEvent = 'gameStarted'|
    'gameEnded'|
    'gameTurnEnded'|
    'playerGalacticCycleComplete'|
    'playerResearchComplete'|
    'playerTechnologyReceived'|
    'playerCreditsReceived'|
    'playerCreditsSpecialistsReceived'|
    'playerRenownReceived'|
    'conversationMessageSent';

export default class NotificationService {
    config: Config;
    userRepo: Repository<User>;
    gameRepo: Repository<Game>;
    discordService: DiscordService;
    conversationService: ConversationService;
    gameService: GameService;
    gameJoinService: GameJoinService;
    gameTickService: GameTickService;
    researchService: ResearchService;
    tradeService: TradeService;
    playerReadyService: PlayerReadyService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;

    constructor(
        config: Config,
        userRepo: Repository<User>,
        gameRepo: Repository<Game>,
        discordService: DiscordService,
        conversationService: ConversationService,
        gameService: GameService,
        gameJoinService: GameJoinService,
        gameTickService: GameTickService,
        researchService: ResearchService,
        tradeService: TradeService,
        playerReadyService: PlayerReadyService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
    ) {
        this.config = config;
        this.userRepo = userRepo;
        this.gameRepo = gameRepo;
        this.discordService = discordService;
        this.conversationService = conversationService;
        this.gameService = gameService;
        this.gameJoinService = gameJoinService;
        this.gameTickService = gameTickService;
        this.researchService = researchService;
        this.tradeService = tradeService;
        this.playerReadyService = playerReadyService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
    }

    initialize() {
        if (this.discordService.isConnected()) { // Don't initialize the notification service if there's no token configured.
            this.conversationService.on(ConversationServiceEvents.onConversationMessageSent, (args) => this.onConversationMessageSent(args));

            this.gameJoinService.on(GameJoinServiceEvents.onGameStarted, (args) => this.onGameStarted(args));
            this.gameTickService.on(GameTickServiceEvents.onGameEnded, (args) => this.onGameEnded(args));
            this.gameTickService.on(GameTickServiceEvents.onGameTurnEnded, (args) => this.onGameTurnEnded(args));
            this.gameTickService.on(GameTickServiceEvents.onPlayerGalacticCycleCompleted, (args) => this.onPlayerGalacticCycleCompleted(args));
            this.researchService.on(ResearchServiceEvents.onPlayerResearchCompleted, (args) => this.onPlayerResearchCompleted(args.gameId, args.playerId, args.technologyKey, args.technologyLevel, args.technologyKeyNext, args.technologyLevelNext));
            this.tradeService.on(TradeServiceEvents.onPlayerCreditsReceived, (args) => this.onPlayerCreditsReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
            this.tradeService.on(TradeServiceEvents.onPlayerCreditsSpecialistsReceived, (args) => this.onPlayerCreditsSpecialistsReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
            this.tradeService.on(TradeServiceEvents.onPlayerRenownReceived, (args) => this.onPlayerRenownReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
            this.tradeService.on(TradeServiceEvents.onPlayerTechnologyReceived, (args) => this.onPlayerTechnologyReceived(args.gameId, args.fromPlayer, args.toPlayer, args.technology));

            this.playerReadyService.on(PlayerReadyServiceEvents.onGamePlayerReady, (data) => this.trySendLastPlayerTurnReminder(data.gameId));

            log.info('Notifications initialized.')
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
            'galaxy.players.userId': 1,
            'galaxy.players.defeated': 1
        }))!;

        // Filter to get the user ids for the players in this context.
        const players = game.galaxy.players.filter(p => !playerIds || playerIds.includes(p._id.toString()))
        const userIds = players.map(p => p.userId);

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
            players,
            users
        };
    }

    async _trySendNotifications(gameId: DBObjectId, playerIds: string[] | null, type: SubscriptionType, event: SubscriptionEvent, sendNotificationCallback: (game: Game, user: User) => any) {
        // Get the context of the notification; the game, users and their subscriptions.
        const context = await this._getNotificationContext(gameId, playerIds);

        // Try to send a notification to each user in the context
        for (let user of context.users) {
            // User doesn't have subscriptions for the type or no subscriptions for the given event
            if (!user.subscriptions[type] || !user.subscriptions[type]![event]) {
                continue;
            }

            // Check for if the user does not want to be notified if they are defeated.
            if (user.subscriptions.settings.notifyActiveGamesOnly &&
                context.players.find(p => p.userId && p.userId.toString() === user._id.toString())!.defeated) {
                continue;
            }

            await sendNotificationCallback(context.game, user);
        }
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

    async onGameStarted(args: BaseGameEvent) {
        // Send the game started notification for Discord subscription to all players.
        await this._trySendNotifications(args.gameId, null, 'discord', 'gameStarted',
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Game Started', 'The game has started. Good luck and have fun!');

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onGameEnded(args: GameEndedEvent) {
        // Send the game ended notification for Discord subscription to all players.
        await this._trySendNotifications(args.gameId, null, 'discord', 'gameEnded', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Game Ended', 'The game has ended.');

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onGameTurnEnded(args: GameTurnEndedEvent) {
        // Send the game turn ended notification for Discord subscription to all players.
        await this._trySendNotifications(args.gameId, null, 'discord', 'gameTurnEnded', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Game Turn Ended', 'A turn has finished, it\'s your turn to play!');

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async trySendLastPlayerTurnReminder(gameId: DBObjectId) {
        // TODO: Partially duplicate with email functionality, refactor!
        let game = (await this.gameService.getById(gameId))!;

        if (!this.gameTypeService.isTurnBasedGame(game)) {
            throw new Error('Cannot send a last turn reminder for non turn based games.');
        }

        if (!this.gameStateService.isInProgress(game)) {
            return;
        }

        const undefeatedPlayers = game.galaxy.players.filter((p: Player) => !p.defeated && p.userId);

        if (undefeatedPlayers.length <= 2) { // No need to send a turn reminder in a 2-player game
            return;
        }

        const undefeatedUnreadyPlayers = undefeatedPlayers.filter(p => !p.ready);

        if (undefeatedUnreadyPlayers.length === 1) {
            const player = undefeatedUnreadyPlayers[0];

            const gameName = game.settings.general.name;

            await this._trySendNotifications(gameId, [player._id.toString()], 'discord', 'gameTurnEnded', 
                async (game: Game, user: User) => {
                    const template = this._generateBaseDiscordMessageTemplate(game, 'It\'s your turn', `The players in ${gameName} are waiting for you to make your move!`);

                    await this.discordService.sendMessageOAuth(user, template);
            });
        }
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

                await this.discordService.sendMessageOAuth(user, template);
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

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onPlayerCreditsReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number) {
        // Send the credits received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerCreditsReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Credits Received', `You have received **$${amount}** credits from **${fromPlayer.alias}**.`);

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onPlayerCreditsSpecialistsReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number) {
        // Send the specialist tokens received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerCreditsSpecialistsReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Specialist Tokens Received', `You have received **${amount}** specialist token(s) from **${fromPlayer.alias}**.`);

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onPlayerTechnologyReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, technology: any) {
        // Send the specialist tokens received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerTechnologyReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Technology Received', `You have received **Level ${technology.level} ${technology.name}** from **${fromPlayer.alias}**.`);

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onPlayerRenownReceived(gameId: DBObjectId, fromPlayer: Player, toPlayer: Player, amount: number) {
        // Send the renown received notification for Discord subscription to the player.
        await this._trySendNotifications(gameId, [toPlayer._id.toString()], 'discord', 'playerRenownReceived', 
            async (game: Game, user: User) => {
                const template = this._generateBaseDiscordMessageTemplate(game, 'Renown Received', `You have received **${amount}** renown from **${fromPlayer.alias}**.`);

                await this.discordService.sendMessageOAuth(user, template);
            });
    }

    async onConversationMessageSent(args: ConversationMessageSentEvent) {
        const toPlayerIds = args.sentMessageResult.toPlayerIds.map(id => id.toString());
        const readBy = args.sentMessageResult.readBy.map(id => id.toString());

        // Filter the players who haven't auto-read the message.
        const playerIdsToCheck = toPlayerIds.filter(pid => !readBy.includes(pid));

        await this._trySendNotifications(args.gameId, playerIdsToCheck, 'discord', 'conversationMessageSent',
            async (game: Game, user: User) => {
                // Note: We have fancy mentions on the UI so we need to account for that here.
                // Surround any mentions with square brackets.
                const formattedMessage = args.sentMessageResult.message.replace(/{{(\w)\/(\w+?)\/(.+?)}}/g, (match, type, id, name) => `{${name}}`);

                const template = this._generateBaseDiscordMessageTemplate(game, `Message from ${args.sentMessageResult.fromPlayerAlias}`, formattedMessage);

                template.fields.push({
                    name: 'Conversation',
                    value: args.conversation.name,
                })

                await this.discordService.sendMessageOAuth(user, template);
            });
    }
}