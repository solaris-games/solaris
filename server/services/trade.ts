import EventEmitter from "events";
import moment from "moment";
import { LedgerType } from 'solaris-common';
import { ValidationError } from "solaris-common";
import UserAchievementService from './userAchievement';
import DiplomacyService from './diplomacy';
import { GameTypeService, ResearchTypeNotRandom } from 'solaris-common'
import LedgerService from './ledger';
import PlayerService from './player';
import PlayerAfkService from './playerAfk';
import PlayerCreditsService from './playerCredits';
import RandomService from './random';
import Repository from './repository';
import ReputationService from './reputation';
import { DBObjectId } from './types/DBObjectId';
import { Game } from './types/Game';
import { GameEvent } from './types/GameEvent';
import { Player, PlayerReputation } from './types/Player';
import { TradeEvent, TradeEventTechnology, TradeTechnology } from './types/Trade';
import { User } from './types/User';
import UserService from './user';
import StatisticsService from './statistics';

export const TradeServiceEvents = {
    onPlayerCreditsReceived: 'onPlayerCreditsReceived',
    onPlayerCreditsSent: 'onPlayerCreditsSent',
    onPlayerCreditsSpecialistsReceived: 'onPlayerCreditsSpecialistsReceived',
    onPlayerCreditsSpecialistsSent: 'onPlayerCreditsSpecialistsSent',
    onPlayerRenownReceived: 'onPlayerRenownReceived',
    onPlayerRenownSent: 'onPlayerRenownSent',
    onPlayerTechnologyReceived: 'onPlayerTechnologyReceived',
    onPlayerTechnologySent: 'onPlayerTechnologySent'
}

export default class TradeService extends EventEmitter {
    gameRepo: Repository<Game>;
    eventRepo: Repository<GameEvent>;
    userService: UserService;
    playerService: PlayerService;
    diplomacyService: DiplomacyService;
    ledgerService: LedgerService;
    achievementService: UserAchievementService;
    reputationService: ReputationService;
    gameTypeService: GameTypeService;
    randomService: RandomService;
    playerCreditsService: PlayerCreditsService;
    playerAfkService: PlayerAfkService;
    statisticsService: StatisticsService;

    constructor(
        gameRepo: Repository<Game>,
        eventRepo: Repository<GameEvent>,
        userService: UserService,
        playerService: PlayerService,
        diplomacyService: DiplomacyService,
        ledgerService: LedgerService,
        achievementService: UserAchievementService,
        reputationService: ReputationService,
        gameTypeService: GameTypeService,
        randomService: RandomService,
        playerCreditsService: PlayerCreditsService,
        playerAfkService: PlayerAfkService,
        statisticsService: StatisticsService,
    ) {
        super();

        this.gameRepo = gameRepo;
        this.eventRepo = eventRepo;
        this.userService = userService;
        this.playerService = playerService;
        this.diplomacyService = diplomacyService;
        this.ledgerService = ledgerService;
        this.achievementService = achievementService;
        this.reputationService = reputationService;
        this.gameTypeService = gameTypeService;
        this.randomService = randomService;
        this.playerCreditsService = playerCreditsService;
        this.playerAfkService = playerAfkService;
        this.statisticsService = statisticsService;
    }

    isTradingCreditsDisabled(game: Game) {
        return game.settings.player.tradeCredits === false;
    }

    isTradingAllyRestricted(game: Game) {
        return this.diplomacyService.isFormalAlliancesEnabled(game) && this.diplomacyService.isTradeRestricted(game);
    }

    isTradingCreditsSpecialistsDisabled(game: Game) {
        return game.settings.player.tradeCreditsSpecialists === false;
    }

    isTradingTechnologyDisabled(game: Game) {
        return game.settings.player.tradeCost === 0;
    }

    async sendCredits(game: Game, fromPlayer: Player, toPlayerId: DBObjectId, amount: number) {
        if (this.isTradingCreditsDisabled(game)) {
            throw new ValidationError(`Trading credits is disabled.`);
        }

        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot trade credits, the game has not started yet.`);
        }

        if (amount <= 0) {
            throw new ValidationError(`Amount must be greater than 0.`);
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId)!;

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send credits to yourself.`);
        }

        if (this.isTradingAllyRestricted(game) &&
            this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayerId).actualStatus !== 'allies') {
            throw new ValidationError(`You are only allowed to trade with allies.`);
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        if (fromPlayer.credits < amount) {
            throw new ValidationError(`You do not own ${amount} credits.`);
        }

        let dbWrites = [
            await this.playerCreditsService.addCredits(game, fromPlayer, -amount, false),
            await this.playerCreditsService.addCredits(game, toPlayer, amount, false)
        ];

        await this.gameRepo.bulkWrite(dbWrites);

        await this.ledgerService.addDebt(game, fromPlayer, toPlayer, amount, LedgerType.Credits);

        if (!this.gameTypeService.isTutorialGame(game)) {
            if (fromPlayer.userId && !fromPlayer.defeated) {
                await this.statisticsService.modifyStats(game._id, fromPlayer._id, (stats) => {
                    stats.trade.creditsSent += amount;
                });
            }

            if (toPlayer.userId && !toPlayer.defeated) {
                await this.statisticsService.modifyStats(game._id, toPlayer._id, (stats) => {
                    stats.trade.creditsReceived += amount;
                });}
        }

        let reputationResult = await this.reputationService.tryIncreaseReputationCredits(game, toPlayer, fromPlayer, amount);

        if (reputationResult.increased) {
            await this.tryTradeBack(game, toPlayer, fromPlayer, reputationResult.rep.reputation);
        }

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            amount,
            reputation: reputationResult.rep.reputation,
            date: moment().utc()
        };

        this.emit(TradeServiceEvents.onPlayerCreditsReceived, eventObject);
        this.emit(TradeServiceEvents.onPlayerCreditsSent, eventObject);

        return eventObject;
    }

    async sendCreditsSpecialists(game: Game, fromPlayer: Player, toPlayerId: DBObjectId, amount: number) {
        if (this.isTradingCreditsSpecialistsDisabled(game)) {
            throw new ValidationError(`Trading specialist tokens is disabled.`);
        }

        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot trade specialist tokens, the game has not started yet.`);
        }

        if (amount <= 0) {
            throw new ValidationError(`Amount must be greater than 0.`);
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId)!;

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send specialist tokens to yourself.`);
        }

        if (this.isTradingAllyRestricted(game) &&
            this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayerId).actualStatus !== 'allies') {
            throw new ValidationError(`You are only allowed to trade with allies.`);
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        if (fromPlayer.creditsSpecialists < amount) {
            throw new ValidationError(`You do not own ${amount} specialist tokens.`);
        }

        let dbWrites = [
            await this.playerCreditsService.addCreditsSpecialists(game, fromPlayer, -amount, false),
            await this.playerCreditsService.addCreditsSpecialists(game, toPlayer, amount, false)
        ];

        await this.gameRepo.bulkWrite(dbWrites);

        await this.ledgerService.addDebt(game, fromPlayer, toPlayer, amount, LedgerType.CreditsSpecialists);

        if (!this.gameTypeService.isTutorialGame(game)) {
            if (fromPlayer.userId && !fromPlayer.defeated) {
                await this.statisticsService.modifyStats(game._id, fromPlayer._id, (stats) => {
                    stats.trade.creditsSpecialistsSent += amount;
                });
            }

            if (toPlayer.userId && !toPlayer.defeated && toPlayer.userId) {
                await this.statisticsService.modifyStats(game._id, toPlayer._id, (stats) => {
                    stats.trade.creditsSpecialistsReceived += amount;
                });
            }
        }

        let reputationResult = await this.reputationService.tryIncreaseReputationCreditsSpecialists(game, toPlayer, fromPlayer, amount);

        if (reputationResult.increased) {
            await this.tryTradeBack(game, toPlayer, fromPlayer, reputationResult.rep.reputation);
        }

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            amount,
            reputation: reputationResult.rep.reputation,
            date: moment().utc()
        };

        this.emit(TradeServiceEvents.onPlayerCreditsSpecialistsReceived, eventObject);
        this.emit(TradeServiceEvents.onPlayerCreditsSpecialistsSent, eventObject);

        return eventObject;
    }

    async sendRenown(game: Game, fromPlayer: Player, toPlayerId: DBObjectId, amount: number) {
        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot award renown, the game has not started yet.`);
        }

        if (amount <= 0) {
            throw new ValidationError(`Amount must be greater than 0.`);
        }

        // If its a anonymous game, then do not allow renown to be sent until the game ends.
        if (game.settings.general.anonymity === 'extra' && !game.state.endDate) {
            throw new ValidationError(`Renown cannot be sent to players in anonymous games until the game has finished.`);
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId)!;

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot award renown to yourself.`);
        }

        if (fromPlayer.renownToGive < amount) {
            throw new ValidationError(`You do not have ${amount} renown to award.`);
        }

        if (!toPlayer.userId) {
            throw new ValidationError(`Cannot award renown to an empty slot.`);
        }

        // The receiving player has to be a legit user otherwise
        // renown should not be sent. It's possible that players can delete their accounts.
        let toUser: User | null = await this.userService.getById(toPlayer.userId);

        if (!toUser) {
            throw new ValidationError(`There is no user associated with this player.`);
        }

        // Note: AI will never ever send renown so no need to check
        // if players are AI controlled here.
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': fromPlayer._id
        }, {
            $inc: {
                'galaxy.players.$.renownToGive': -amount
            }
        });

        if (!this.gameTypeService.isTutorialGame(game)) {
            if (fromPlayer.userId) {
                await this.achievementService.incrementRenownSent(fromPlayer.userId, amount);
            }

            if (toPlayer.userId) {
                await this.achievementService.incrementRenown(toPlayer.userId, amount);
            }
        }

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            amount,
            date: moment().utc()
        };

        this.emit(TradeServiceEvents.onPlayerRenownReceived, eventObject);
        this.emit(TradeServiceEvents.onPlayerRenownSent, eventObject);

        return eventObject;
    }

    async sendTechnology(game: Game, fromPlayer: Player, toPlayerId: DBObjectId, technology: ResearchTypeNotRandom, techLevel: number) {
        if (this.isTradingTechnologyDisabled(game)) {
            throw new ValidationError(`Trading technology is disabled.`);
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId)!;

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot trade technology with yourself.`);
        }

        if (this.isTradingAllyRestricted(game) &&
            this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayerId).actualStatus !== 'allies') {
            throw new ValidationError(`You are only allowed to trade with allies.`);
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        let tradeTechs = this.listTradeableTechnologies(game, fromPlayer, toPlayerId);

        let tradeTech = tradeTechs.find(t => t.name === technology && t.level === techLevel);

        if (!tradeTech) {
            throw new ValidationError(`The technology ${technology} cannot be traded with this player.`);
        }

        let toPlayerTech = toPlayer.research[tradeTech.name];

        if (toPlayerTech.level >= tradeTech.level) {
            throw new ValidationError(`The recipient already owns technology ${technology} level ${tradeTech.level} or greater.`);
        }

        if (fromPlayer.credits < tradeTech.cost) {
            throw new ValidationError(`You cannot afford to trade this technology.`);
        }

        let levelDifference = tradeTech.level - toPlayerTech.level;

        // toPlayerTech.level = tradeTech.level;
        // toPlayerTech.progress = 0;
        // fromPlayer.credits -= tradeTech.cost;

        const updateResearchQuery = {};
        updateResearchQuery['galaxy.players.$.research.' + tradeTech.name + '.level'] = tradeTech.level;
        updateResearchQuery['galaxy.players.$.research.' + tradeTech.name + '.progress'] = 0;

        const dbWrites = [
            await this.playerCreditsService.addCredits(game, fromPlayer, -tradeTech.cost, false),
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': toPlayer._id
                    },
                    update: updateResearchQuery
                }
            }
        ];

        await this.gameRepo.bulkWrite(dbWrites);

        await this.ledgerService.addDebt(game, fromPlayer, toPlayer, tradeTech.cost, LedgerType.Credits);

        if (!this.gameTypeService.isTutorialGame(game)) {
            // Need to assert that the trading players aren't controlled by AI
            // and the player user has an account.

            if (toPlayer.userId && !toPlayer.defeated) {
                await this.statisticsService.modifyStats(game._id, toPlayer._id, (stats) => {
                    stats.trade.technologyReceived += 1;
                });
            }

            if (fromPlayer.userId && !fromPlayer.defeated) {
                await this.statisticsService.modifyStats(game._id, fromPlayer._id, (stats) => {
                    stats.trade.technologySent += 1;
                });
            }
        }

        const eventTechnology: TradeEventTechnology = {
            name: tradeTech.name,
            level: tradeTech.level,
            difference: levelDifference
        };

        const reputationResult = await this.reputationService.tryIncreaseReputationTechnology(game, toPlayer, fromPlayer, eventTechnology);

        if (reputationResult.increased) {
            await this.tryTradeBack(game, toPlayer, fromPlayer, reputationResult.rep.reputation);
        }

        const eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            technology: eventTechnology,
            reputation: reputationResult.rep.reputation,
            date: moment().utc()
        };

        this.emit(TradeServiceEvents.onPlayerTechnologyReceived, eventObject);
        this.emit(TradeServiceEvents.onPlayerTechnologySent, eventObject);

        return eventObject;
    }

    listTradeableTechnologies(game: Game, fromPlayer: Player, toPlayerId: DBObjectId) {
        if (this.isTradingTechnologyDisabled(game)) {
            return [];
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId)!;

        if (fromPlayer._id.toString() === toPlayer._id.toString()) {
            throw new ValidationError('Cannot trade with the same player');
        }

        // Get all of the technologies that the from player has that have a higher
        // level than the to player.
        let techKeys: ResearchTypeNotRandom[] = Object.keys(fromPlayer.research)
            .filter(k => {
                return k.match(/^[^_\$]/) != null;
            }) as ResearchTypeNotRandom[];

        let tradeTechs: TradeTechnology[] = [];

        for (let i = 0; i < techKeys.length; i++) {
            let techKey = techKeys[i];
            let techFromPlayer = fromPlayer.research[techKey];
            let techToPlayer = toPlayer.research[techKey];

            let techLevel = techFromPlayer.level

            while (techLevel > techToPlayer.level) {
                tradeTechs.push({
                    name: techKey,
                    level: techLevel,
                    cost: techLevel * game.settings.player.tradeCost
                });

                techLevel--;
            }
        }

        return tradeTechs;
    }

    _canPlayersTradeInRange(game: Game, fromPlayer: Player, toPlayer: Player) {
        if (game.settings.player.tradeScanning === 'scanned') {
            return this.playerService.isInScanningRangeOfPlayer(game, fromPlayer, toPlayer);
        }

        return true;
    }

    _tradeScanningCheck(game: Game, fromPlayer: Player, toPlayer: Player) {
        if (game.settings.player.tradeScanning === 'scanned') {
            let isInRange = this.playerService.isInScanningRangeOfPlayer(game, fromPlayer, toPlayer);

            if (!isInRange) {
                throw new ValidationError(`You cannot trade with this player, they are not within scanning range.`);
            }
        }
    }

    async listTradeEventsBetweenPlayers(game: Game, playerId: DBObjectId, playerIds: DBObjectId[]): Promise<TradeEvent[]> {
        let events = await this.eventRepo.find({
            gameId: game._id,
            playerId: playerId,
            type: {
                $in: [
                    'playerCreditsReceived',
                    'playerCreditsSpecialistsReceived',
                    'playerRenownReceived',
                    'playerTechnologyReceived',
                    'playerGiftReceived',
                    'playerCreditsSent',
                    'playerCreditsSpecialistsSent',
                    'playerRenownSent',
                    'playerTechnologySent',
                    'playerGiftSent',
                    'playerDebtSettled',
                    'playerDebtForgiven'
                ]
            },
            $or: [
                { 'data.fromPlayerId': { $in: playerIds } },
                { 'data.toPlayerId': { $in: playerIds } },
                {
                    $and: [
                        { 'data.debtorPlayerId': { $in: playerIds } },
                        { 'data.creditorPlayerId': { $in: playerIds } }
                    ]
                }
            ]
        });

        return events
        .map(e => {
            return {
                playerId: e.playerId!,
                type: e.type,
                data: e.data,
                sentDate: moment(e._id.getTimestamp()).toDate(),
                sentTick: e.tick
            }
        });
    }

    async tryTradeBack(game: Game, fromPlayer: Player, toPlayer: Player, reputation: PlayerReputation) {
        // Note: Trade backs can only occur from AI to player
        if (!this.playerAfkService.isAIControlled(game, fromPlayer, true)) {
            return;
        }

        const TRADE_CHANCE_BASE = 50;
        const TRADE_CHANCE_STEP = 5;
        const TRADE_CHANCE_MIN_REPUTATION = 1;

        if (reputation.score < TRADE_CHANCE_MIN_REPUTATION) {
            return;
        }

        if (!this._canPlayersTradeInRange(game, fromPlayer, toPlayer)) {
            return;
        }

        let tradeChance = TRADE_CHANCE_BASE + (TRADE_CHANCE_STEP * reputation.score);
        let tradeRoll = this.randomService.getRandomNumber(99);
        let canPerformTrade = tradeRoll <= tradeChance || true;

        if (!canPerformTrade) {
            return;
        }
        
        // TODO: Consider scanning range trade setting.

        // Get the differences in tech levels between the two players that the AI can afford.
        let tradeTechs = await this.listTradeableTechnologies(game, fromPlayer, toPlayer._id);

        tradeTechs = tradeTechs.filter(t => t.cost <= fromPlayer.credits);

        if (!tradeTechs.length) {
            return;
        }

        // Pick a random tech(?) and send it to the player.
        let tradeTech = tradeTechs[this.randomService.getRandomNumber(tradeTechs.length - 1)];
        
        await this.sendTechnology(game, fromPlayer, toPlayer._id, tradeTech.name, tradeTech.level);
    }

};
