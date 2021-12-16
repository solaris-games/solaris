const ValidationError = require('../errors/validation');
const EventEmitter = require('events');

module.exports = class BadgeService extends EventEmitter {

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

        const playerBadges = await this.userService.getById(userId, {
            badges: 1
        }).badges;

        for (let badge of badges) {
            badge.awarded = playerBadges[badge.key] || 0;
        }

        return badges;
    }

    async listBadgesByPlayer(game, playerId) {
        let player = this.playerService.getById(game, playerId);

        if (!player) {
            throw new ValidationError(`Could not find the player in this game.`);
        }

        if (!player.userId) {
            return null;
        }

        return this.listBadgesByUser(player.userId);
    }

    async purchaseBadgeForUser(purchasedByUserId, purchasedForUserId, badgeKey) {
        const badge = this.listBadges()[badgeKey];

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

        const dbWrites = [
            // Purchase the badge
            {
                updateOne: {
                    filter: {
                        _id: purchasedByUserId
                    },
                    update: {
                        credits: {
                            $inc: -badge.price
                        }
                    }
                }
            },
            // Add the badge to the recipient
            {
                updateOne: {
                    filter: {
                        _id: purchasedForUserId
                    },
                    update: {
                        badges: {
                            // Temporary, value is set below.
                        }
                    }
                }
            }
        ];

        dbWrites[1].updateOne.update.badges[badgeKey] = { $inc: 1 }; // magic

        await this.userRepo.bulkWrite(dbWrites);

        return badge;
    }

    async purchaseBadgeForPlayer(game, purchasedByUserId, purchasedForPlayerId, badgeKey) {
        let buyer = this.playerService.getById(game, purchasedByUserId);
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
