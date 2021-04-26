const EventEmitter = require('events');
const moment = require('moment');
const ValidationError = require('../errors/validation');

module.exports = class TradeService extends EventEmitter {

    constructor(gameModel, userService, playerService, ledgerService, achievementService) {
        super();
        
        this.gameModel = gameModel;
        this.userService = userService;
        this.playerService = playerService;
        this.ledgerService = ledgerService;
        this.achievementService = achievementService;
    }

    isTradingCreditsDisabled(game) {
        return game.settings.player.tradeCredits === false;
    }

    isTradingTechnologyDisabled(game) {
        return game.settings.player.tradeCost === 0;
    }

    async sendCredits(game, fromPlayer, toPlayerId, amount) {
        if (this.isTradingCreditsDisabled(game)) {
            throw new ValidationError(`Trading credits is disabled.`);
        }

        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot award renown, the game has not started yet.`);
        }
        
        // Get the players.
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send credits to yourself.`);
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        if (fromPlayer.credits < amount) {
            throw new ValidationError(`The player does not own ${amount} credits.`);
        }

        let fromPlayerUser = await this.userService.getById(fromPlayer.userId);
        let toPlayerUser = await this.userService.getById(toPlayer.userId);

        if (!toPlayerUser) {
            throw new ValidationError(`There is no user associated with this player.`);
        }

        let dbWrites = [
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': fromPlayer._id
                    },
                    update: {
                        $inc: {
                            'galaxy.players.$.credits': -amount
                        }
                    }
                }
            },
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': toPlayer._id
                    },
                    update: {
                        $inc: {
                            'galaxy.players.$.credits': amount
                        }
                    }
                }
            }
        ];

        await this.gameModel.bulkWrite(dbWrites);

        // fromPlayer.credits -= amount;
        // toPlayer.credits += amount;

        if (!fromPlayer.defeated) {
            await this.achievementService.incrementTradeCreditsSent(fromPlayerUser._id, amount);
        }

        if (!toPlayer.defeated) {
            await this.achievementService.incrementTradeCreditsReceived(fromPlayerUser._id, amount);
        }

        await this.ledgerService.addDebt(game, fromPlayer, toPlayer, amount);
        
        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            amount,
            date: moment().utc()
        };

        this.emit('onPlayerCreditsReceived', eventObject);
        this.emit('onPlayerCreditsSent', eventObject);

        return eventObject;
    }

    async sendRenown(game, fromPlayer, toPlayerId, amount) {
        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot award renown, the game has not started yet.`);
        }

        // If its a anonymous game, then do not allow renown to be sent until the game ends.
        if (game.settings.general.anonymity === 'extra' && !game.state.endDate) {
            throw new ValidationError(`Renown cannot be sent to players in anonymous games until the game has finished.`);
        }

        // Get the players.
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot award renown to yourself.`);
        }

        if (fromPlayer.renownToGive < amount) {
            throw new ValidationError(`The player does not own ${amount} renown to award.`);
        }

        if (!toPlayer.userId) {
            throw new ValidationError(`Cannot award renown to an empty slot.`);
        }

        // Get the user of the player to award renown to.
        let fromUser = await this.userService.getById(fromPlayer.userId);
        let toUser = await this.userService.getById(toPlayer.userId);

        if (!toUser) {
            throw new ValidationError(`There is no user associated with this player.`);
        }

        // Note: AI will never ever send renown so no need to check
        // if players are AI controlled here.
        fromPlayer.renownToGive -= amount;

        fromUser.achievements.trade.renownSent += amount;
        toUser.achievements.renown += amount; // TODO: Refactor into trade?

        await game.save();
        await fromUser.save();
        await toUser.save();

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

    async sendTechnology(game, fromPlayer, toPlayerId, technology, techLevel) {
        if (this.isTradingTechnologyDisabled(game)) {
            throw new ValidationError(`Trading technology is disabled.`);
        }

        // Get the players.
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot trade technology with yourself.`);
        }

        this._tradeScanningCheck(game, fromPlayer, toPlayer);

        let tradeTechs = this.getTradeableTechnologies(game, fromPlayer, toPlayerId);

        let tradeTech = tradeTechs.find(t => t.name === technology && t.level === techLevel);

        if (!tradeTech) {
            throw new ValidationError(`The technology ${technology} cannot be traded with this player.`);
        }
        
        let toPlayerTech = toPlayer.research[tradeTech.name];

        if (toPlayerTech.level >= tradeTech.level) {
            throw new ValidationError(`The player already owns technology ${technology} level ${tradeTech.level} or greater.`);
        }

        if (fromPlayer.credits < tradeTech.cost) {
            throw new ValidationError('The player cannot afford to trade this technology.');
        }

        let fromUser = await this.userService.getById(fromPlayer.userId);
        let toUser = await this.userService.getById(toPlayer.userId);

        if (!toUser) {
            throw new ValidationError(`There is no user associated with this player.`);
        }

        let levelDifference = tradeTech.level - toPlayerTech.level;

        toPlayerTech.level = tradeTech.level;
        toPlayerTech.progress = 0;

        // Need to assert that the trading players aren't controlled by AI.
        if (!toPlayer.defeated) {
            toUser.achievements.trade.technologyReceived++;
        }

        fromPlayer.credits -= tradeTech.cost;

        if (!fromPlayer.defeated) {
            fromUser.achievements.trade.technologySent++;
        }

        this.ledgerService.addDebt(game, fromPlayer, toPlayer, tradeTech.cost);

        await game.save();
        await fromUser.save();
        await toUser.save();

        let eventObject = {
            gameId: game._id,
            gameTick: game.state.tick,
            fromPlayer,
            toPlayer,
            technology: {
                name: tradeTech.name,
                level: tradeTech.level,
                difference: levelDifference
            },
            date: moment().utc()
        };

        this.emit('onPlayerTechnologyReceived', eventObject);
        this.emit('onPlayerTechnologySent', eventObject);

        return eventObject;
    }

    getTradeableTechnologies(game, fromPlayer, toPlayerId) {
        if (this.isTradingTechnologyDisabled(game)) {
            return [];
        }

        // Get the players.
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer._id.equals(toPlayer._id)) {
            throw new ValidationError('Cannot trade with the same player');
        }
        
        // Get all of the technologies that the from player has that have a higher
        // level than the to player.
        let techKeys = Object.keys(fromPlayer.research)
            .filter(k => {
                return k.match(/^[^_\$]/) != null;
            });

        let tradeTechs = [];

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

    _tradeScanningCheck(game, fromPlayer, toPlayer) {
        if (game.settings.player.tradeScanning === 'scanned') {
            let isInRange = this.playerService.isInScanningRangeOfPlayer(game, fromPlayer, toPlayer);
    
            if (!isInRange) {
                throw new ValidationError(`You cannot trade with this player, they are not within scanning range.`);
            }
        }
    }

};
