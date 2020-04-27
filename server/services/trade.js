const ValidationError = require('../errors/validation');

module.exports = class TradeService {

    constructor(userService, playerService) {
        this.userService = userService;
        this.playerService = playerService;
    }

    async sendCredits(game, userId, toPlayerId, amount) {
        // Get the players.
        let fromPlayer = this.playerService.getByUserId(game, userId);
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot send credits to yourself.`);
        }

        if (fromPlayer.credits < amount) {
            throw new ValidationError(`The player does not own ${amount} credits.`);
        }

        fromPlayer.credits -= amount;
        toPlayer.credits += amount;

        await game.save();
    }

    async sendRenown(game, userId, toPlayerId, amount) {
        // Get the players.
        let fromPlayer = this.playerService.getByUserId(game, userId);
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot award renown to yourself.`);
        }

        if (fromPlayer.renownToGive < amount) {
            throw new ValidationError(`The player does not own ${amount} renown to award.`);
        }

        // Get the user of the player to award renown to.
        let toUser = await this.userService.getById(toPlayer.userId);

        fromPlayer.renownToGive -= amount;
        toUser.achievements.renown += amount;

        await game.save();
        await toUser.save();
    }

    async sendTechnology(game, userId, toPlayerId, technology) {
        // Get the players.
        let fromPlayer = this.playerService.getByUserId(game, userId);
        let toPlayer = this.playerService.getById(game, toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new ValidationError(`Cannot trade technology with yourself.`);
        }

        let tradeTechs = this.getTradeableTechnologies(game, userId, toPlayerId);

        let tradeTech = tradeTechs.find(t => t.name === technology);

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

        toPlayerTech.level = tradeTech.level;
        toPlayerTech.progress = 0;

        fromPlayer.credits -= tradeTech.cost;

        await game.save();
    }

    getTradeableTechnologies(game, userId, toPlayerId) {
        // Get the players.
        let fromPlayer = this.playerService.getByUserId(game, userId);
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

            if (techFromPlayer.level > techToPlayer.level) {
                tradeTechs.push({
                    name: techKey,
                    level: techFromPlayer.level,
                    cost: techFromPlayer.level * 15
                });
            }
        }

        return tradeTechs;
    }

};
