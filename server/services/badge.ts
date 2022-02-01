import ValidationError from '../errors/validation';
const EventEmitter = require('events');

export default class BadgeService extends EventEmitter {

    constructor(userRepo, userService, playerService) {
        super();

        this.userRepo = userRepo;
        this.userService = userService;
        this.playerService = playerService;
    }

    listBadges() {
        return require('../config/game/badges').slice();
    }

    async listBadgesByUser(userId) {
        const badges = this.listBadges();

        const user = await this.userService.getById(userId, {
            'achievements.badges': 1
        });

        if (!user) {
            return [];
        }

        for (let badge of badges) {
            badge.awarded = user.achievements.badges[badge.key] || 0;
        }

        return badges.filter(b => b.awarded);
    }

    async listBadgesByPlayer(game, playerId) {
        let player = this.playerService.getById(game, playerId);

        if (!player) {
            throw new ValidationError(`Could not find the player in this game.`);
        }

        if (!player.userId) {
            return null;
        }

        return await this.listBadgesByUser(player.userId);
    }

    async purchaseBadgeForUser(purchasedByUserId, purchasedForUserId, badgeKey) {
        if (purchasedByUserId.toString() === purchasedForUserId.toString()) {
            throw new ValidationError(`Cannot purchased a badge for yourself.`);
        }

        const badge = this.listBadges().find(b => b.key === badgeKey);

        if (!badge) {
            throw new ValidationError(`Badge ${badgeKey} does not exist.`);
        }

        const recipient = await this.userService.getById(purchasedForUserId, { _id: 1 });
        
        if (!recipient) {
            throw new ValidationError(`Recipient user ${purchasedForUserId} does not exist.`);
        }

        // Check if the buyer can afford the badge.
        const creditsOwned = await this.userService.getUserCredits(purchasedByUserId);

        if (!creditsOwned || creditsOwned < badge.price) {
            throw new ValidationError(`You cannot afford to purchase this badge.`);
        }

        // TODO: This would be better in a bulk update.
        await this.userService.incrementCredits(purchasedByUserId, -1);

        let updateQuery = {
            $inc: {}
        };

        updateQuery.$inc['achievements.badges.' + badgeKey] = 1;

        await this.userRepo.updateOne({
            _id: purchasedForUserId
        }, updateQuery);

        return badge;
    }

    async purchaseBadgeForPlayer(game, purchasedByUserId, purchasedForPlayerId, badgeKey) {
        let buyer = this.playerService.getByUserId(game, purchasedByUserId);
        let recipient = this.playerService.getById(game, purchasedForPlayerId);

        if (!recipient) {
            throw new ValidationError(`Could not find the player in this game.`);
        }

        if (!recipient.userId) {
            throw new ValidationError(`The player slot has not been filled by a user.`);
        }

        const badge = await this.purchaseBadgeForUser(purchasedByUserId, recipient.userId, badgeKey);

        this.emit('onGamePlayerBadgePurchased', {
            gameId: game._id,
            gameTick: game.state.tick,
            purchasedByPlayerId: buyer._id,
            purchasedByPlayerAlias: buyer.alias,
            purchasedForPlayerId: recipient._id,
            purchasedForPlayerAlias: recipient.alias,
            badgeKey,
            badgeName: badge.name
        });
    }

};
