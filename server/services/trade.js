const EventEmitter = require('events');
const ValidationError = require('../errors/validation');

module.exports = class TradeService extends EventEmitter {

    constructor(userService, playerService, ledgerService) {
        super();
        
        this.userService = userService;
        this.playerService = playerService;
        this.ledgerService = ledgerService;
    }

    async sendCredits(game, fromPlayer, toPlayerId, amount) {
        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot award renown, the game has not started yet.`);
        }
        
        // Get the players.
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send credits to yourself.`);
        }

        if (fromPlayer.credits < amount) {
            throw new ValidationError(`The player does not own ${amount} credits.`);
        }

        let fromPlayerUser = await this.userService.getById(fromPlayer.userId);
        let toPlayerUser = await this.userService.getById(toPlayer.userId);

        fromPlayer.credits -= amount;
        fromPlayerUser.achievements.trade.creditsSent += amount;

        toPlayer.credits += amount;
        toPlayerUser.achievements.trade.creditsReceived += amount;

        this.ledgerService.addDebt(game, fromPlayer, toPlayer, amount);

        await game.save();
        await fromPlayerUser.save();
        await toPlayerUser.save();

        this.emit('onPlayerCreditsReceived', {
            game,
            fromPlayer,
            toPlayer,
            amount
        });

        this.emit('onPlayerCreditsSent', {
            game,
            fromPlayer,
            toPlayer,
            amount
        });
    }

    async sendRenown(game, fromPlayer, toPlayerId, amount) {
        // TODO: Maybe this validation needs to be in the middleware?
        if (!game.state.startDate) {
            throw new ValidationError(`Cannot award renown, the game has not started yet.`);
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

        fromPlayer.renownToGive -= amount;

        fromUser.achievements.trade.renownSent += amount;
        toUser.achievements.renown += amount; // TODO: Refactor into trade?

        await game.save();
        await fromUser.save();
        await toUser.save();

        this.emit('onPlayerRenownReceived', {
            game,
            fromPlayer,
            toPlayer,
            amount
        });

        this.emit('onPlayerRenownSent', {
            game,
            fromPlayer,
            toPlayer,
            amount
        });
    }

    async sendTechnology(game, fromPlayer, toPlayerId, technology, techLevel) {
        // Get the players.
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot trade technology with yourself.`);
        }

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

        toPlayerTech.level = tradeTech.level;
        toPlayerTech.progress = 0;
        toUser.achievements.trade.technologyReceived++;

        fromPlayer.credits -= tradeTech.cost;
        fromUser.achievements.trade.technologySent++;

        this.ledgerService.addDebt(game, fromPlayer, toPlayer, tradeTech.cost);

        await game.save();
        await fromUser.save();
        await toUser.save();

        let eventTech = {
            name: tradeTech.name,
            level: tradeTech.level
        };

        this.emit('onPlayerTechnologyReceived', {
            game,
            fromPlayer,
            toPlayer,
            technology: eventTech
        });

        this.emit('onPlayerTechnologySent', {
            game,
            fromPlayer,
            toPlayer,
            technology: eventTech
        });
    }

    getTradeableTechnologies(game, fromPlayer, toPlayerId) {
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

};
