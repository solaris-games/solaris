const EventEmitter = require('events');
const moment = require('moment');
import { DBObjectId } from '../types/DBObjectId';
import ValidationError from '../errors/validation';
import DatabaseRepository from '../models/DatabaseRepository';
import { Game } from '../types/Game';
import { GameEvent } from '../types/GameEvent';
import { Player, ResearchType } from '../types/Player';
import { TradeEvent, TradeEventTechnology, TradeTechnology } from '../types/Trade';
import AchievementService from './achievement';
import GameTypeService from './gameType';
import DiplomacyService from './diplomacy';
import { DiplomaticState, DiplomaticStatus } from "../types/Diplomacy";
import LedgerService from './ledger';
import PlayerService from './player';
import ReputationService from './reputation';
import UserService from './user';
import { User } from '../types/User';

export default class TradeService extends EventEmitter {
    gameRepo: DatabaseRepository<Game>;
    eventRepo: DatabaseRepository<GameEvent>;
    userService: UserService;
    playerService: PlayerService;
    diplomacyService: DiplomacyService;
    ledgerService: LedgerService;
    achievementService: AchievementService;
    reputationService: ReputationService;
    gameTypeService: GameTypeService;

    constructor(
        gameRepo: DatabaseRepository<Game>,
        eventRepo: DatabaseRepository<GameEvent>,
        userService: UserService,
        playerService: PlayerService,
        diplomacyService: DiplomacyService,
        ledgerService: LedgerService,
        achievementService: AchievementService,
        reputationService: ReputationService,
        gameTypeService: GameTypeService
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
    }

    isTradingCreditsDisabled(game: Game) {
        return game.settings.player.tradeCredits === false;
    }

    isTradingAllyRestricted(game: Game) {
      return game.settings.alliances.enabled === 'enabled' && game.settings.alliances.allianceOnlyTrading === 'enabled';
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
        let toPlayer: Player = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send credits to yourself.`);
        }

        if (fromPlayer.userId && this.isTradingAllyRestricted(game)) {
          let diplomaticStatus: DiplomaticStatus = this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayerId);
          if (diplomaticStatus.actualStatus != 'allies') {
            throw new ValidationError(`Cannot send credits to non-allies.`);
          }
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        if (fromPlayer.credits < amount) {
            throw new ValidationError(`You not own ${amount} credits.`);
        }

        let dbWrites = [
            await this.playerService.addCredits(game, fromPlayer, -amount, false),
            await this.playerService.addCredits(game, toPlayer, amount, false)
        ];

        await this.gameRepo.bulkWrite(dbWrites);

        await this.ledgerService.addDebt(game, fromPlayer, toPlayer, amount);

        if (!this.gameTypeService.isTutorialGame(game)) {
            if (fromPlayer.userId && !fromPlayer.defeated) {
                await this.achievementService.incrementTradeCreditsSent(fromPlayer.userId, amount);
            }

            if (toPlayer.userId && !toPlayer.defeated) {
                await this.achievementService.incrementTradeCreditsReceived(toPlayer.userId, amount);
            }

        }

        let reputation = await this.reputationService.tryIncreaseReputationCredits(game, fromPlayer, toPlayer, amount);

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            amount,
            reputation,
            date: moment().utc()
        };

        this.emit('onPlayerCreditsReceived', eventObject);
        this.emit('onPlayerCreditsSent', eventObject);

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
        let toPlayer: Player = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send specialist tokens to yourself.`);
        }

        if (fromPlayer._id && this.isTradingAllyRestricted(game)) {
          let diplomaticStatus: DiplomaticStatus = this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayerId);
          if (diplomaticStatus.actualStatus != 'allies') {
            throw new ValidationError(`Cannot send specialist tokens to non-allies.`);
          }
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        if (fromPlayer.creditsSpecialists < amount) {
            throw new ValidationError(`You do not own ${amount} specialist tokens.`);
        }

        let dbWrites = [
            await this.playerService.addCreditsSpecialists(game, fromPlayer, -amount, false),
            await this.playerService.addCreditsSpecialists(game, toPlayer, amount, false)
        ];

        await this.gameRepo.bulkWrite(dbWrites);

        if (!this.gameTypeService.isTutorialGame(game)) {
            if (fromPlayer.userId && !fromPlayer.defeated) {
                await this.achievementService.incrementTradeCreditsSpecialistsSent(fromPlayer.userId, amount);
            }

            if (toPlayer.userId && !toPlayer.defeated && toPlayer.userId) {
                await this.achievementService.incrementTradeCreditsSpecialistsReceived(toPlayer.userId, amount);
            }
        }

        let reputation = await this.reputationService.tryIncreaseReputationCreditsSpecialists(game, fromPlayer, toPlayer, amount);

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            amount,
            reputation,
            date: moment().utc()
        };

        this.emit('onPlayerCreditsSpecialistsReceived', eventObject);
        this.emit('onPlayerCreditsSpecialistsSent', eventObject);

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
        let toPlayer: Player = this.playerService.getById(game, toPlayerId);

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
                await this.achievementService.incrementRenownReceived(toPlayer.userId, amount);
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

        this.emit('onPlayerRenownReceived', eventObject);
        this.emit('onPlayerRenownSent', eventObject);

        return eventObject;
    }

    async sendTechnology(game: Game, fromPlayer: Player, toPlayerId: DBObjectId, technology: ResearchType, techLevel: number) {
        if (this.isTradingTechnologyDisabled(game)) {
            throw new ValidationError(`Trading technology is disabled.`);
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot trade technology with yourself.`);
        }

        if (fromPlayer._id && this.isTradingAllyRestricted(game)) {
          let diplomaticStatus: DiplomaticStatus = this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayerId);
          if (diplomaticStatus.actualStatus != 'allies') {
            throw new ValidationError(`Cannot send technology to non-allies.`);
          }
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        let tradeTechs = this.getTradeableTechnologies(game, fromPlayer, toPlayerId);

        let tradeTech = tradeTechs.find(t => t.name === technology && t.level === techLevel);

        if (!tradeTech) {
            throw new ValidationError(`The technology ${technology} cannot be traded with this player.`);
        }

        let toPlayerTech = toPlayer.research[tradeTech.name];

        if (toPlayerTech.level >= tradeTech.level) {
            throw new ValidationError(`The recipient already owns technology ${technology} level ${tradeTech.level} or greater.`);
        }

        if (fromPlayer.credits < tradeTech.cost) {
            throw new ValidationError('You cannot afford to trade this technology.');
        }

        let levelDifference = tradeTech.level - toPlayerTech.level;

        // toPlayerTech.level = tradeTech.level;
        // toPlayerTech.progress = 0;
        // fromPlayer.credits -= tradeTech.cost;

        let updateResearchQuery = {};
        updateResearchQuery['galaxy.players.$.research.' + tradeTech.name + '.level'] = tradeTech.level;
        updateResearchQuery['galaxy.players.$.research.' + tradeTech.name + '.progress'] = 0;

        let dbWrites = [
            await this.playerService.addCredits(game, fromPlayer, -tradeTech.cost, false),
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

        await this.ledgerService.addDebt(game, fromPlayer, toPlayer, tradeTech.cost);

        if (!this.gameTypeService.isTutorialGame(game)) {
            // Need to assert that the trading players aren't controlled by AI
            // and the player user has an account.
            if (toPlayer.userId && !toPlayer.defeated) {
                await this.achievementService.incrementTradeTechnologyReceived(toPlayer.userId, 1);
            }

            if (fromPlayer.userId && !fromPlayer.defeated) {
                await this.achievementService.incrementTradeTechnologySent(fromPlayer.userId, 1);
            }
        }

        let eventTechnology: TradeEventTechnology = {
            name: tradeTech.name,
            level: tradeTech.level,
            difference: levelDifference
        };

        let reputation = await this.reputationService.tryIncreaseReputationTechnology(game, fromPlayer, toPlayer, eventTechnology);

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            technology: eventTechnology,
            reputation,
            date: moment().utc()
        };

        this.emit('onPlayerTechnologyReceived', eventObject);
        this.emit('onPlayerTechnologySent', eventObject);

        return eventObject;
    }

    getTradeableTechnologies(game: Game, fromPlayer: Player, toPlayerId: DBObjectId) {
        if (this.isTradingTechnologyDisabled(game)) {
            return [];
        }

        // Get the players.
        let toPlayer: Player = this.playerService.getById(game, toPlayerId);

        if (fromPlayer._id.toString() === toPlayer._id.toString()) {
            throw new ValidationError('Cannot trade with the same player');
        }

        // Get all of the technologies that the from player has that have a higher
        // level than the to player.
        let techKeys = Object.keys(fromPlayer.research)
            .filter(k => {
                return k.match(/^[^_\$]/) != null;
            });

        let tradeTechs: TradeTechnology[] = [];

        for (let i = 0; i < techKeys.length; i++) {
            let techKey = techKeys[i];
            let techFromPlayer = fromPlayer.research[techKey];
            let techToPlayer = toPlayer.research[techKey];

            let techLevel = techFromPlayer.level

            while (techLevel > techToPlayer.level) {
                tradeTechs.push({
                    name: techKey as ResearchType,
                    level: techLevel,
                    cost: techLevel * game.settings.player.tradeCost
                });

                techLevel--;
            }
        }

        return tradeTechs;
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
                sentDate: moment(e._id.getTimestamp()) as Date,
                sentTick: game.state.tick
            }
        });
    }

};
