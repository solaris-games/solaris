import { DBObjectId } from './types/DBObjectId';
import ValidationError from '../errors/validation';
import Repository from './repository';
import { Badge, UserBadge } from './types/Badge';
import { Game } from './types/Game';
import { User } from './types/User';
import PlayerService from './player';
import UserService from './user';
import GamePlayerBadgePurchasedEvent from './types/events/GamePlayerBadgePurchased';
const EventEmitter = require('events');

export const BadgeServiceEvents = {
    onGamePlayerBadgePurchased: 'onGamePlayerBadgePurchased'
}

export default class BadgeService extends EventEmitter {
    userRepo: Repository<User>;
    userService: UserService;
    playerService: PlayerService;

    constructor(
        userRepo: Repository<User>,
        userService: UserService,
        playerService: PlayerService
    ) {
        super();

        this.userRepo = userRepo;
        this.userService = userService;
        this.playerService = playerService;
    }

    listBadges(): Badge[] {
        return require('../config/game/badges').slice();
    }

    listPurchasableBadges(): Badge[] {
        return this.listBadges().filter(b => b.price);
    }

    async listBadgesByUser(userId: DBObjectId): Promise<UserBadge[]> {
        const badges = this.listBadges();

        const user = await this.userService.getById(userId, {
            'achievements.badges': 1
        });

        if (!user) {
            return [];
        }

        const userBadges: UserBadge[] = [];

        for (let badge of badges) {
            userBadges.push({
                ...badge,
                awarded: user.achievements.badges[badge.key] || 0
            });
        }

        return userBadges.filter(b => b.awarded);
    }

    async listBadgesByPlayer(game: Game, playerId: DBObjectId) {
        let player = this.playerService.getById(game, playerId);

        if (!player) {
            throw new ValidationError(`Could not find the player in this game.`);
        }

        if (!player.userId) {
            return null;
        }

        // Do not reveal badges for anon games.
        if (game.settings.general.anonymity === 'extra') {
            return []
        }

        return await this.listBadgesByUser(player.userId);
    }

    async purchaseBadgeForUser(purchasedByUserId: DBObjectId, purchasedForUserId: DBObjectId, badgeKey: string) {
        if (purchasedByUserId.toString() === purchasedForUserId.toString()) {
            throw new ValidationError(`Cannot purchased a badge for yourself.`);
        }

        const badge = this.listPurchasableBadges().find(b => b.key === badgeKey);

        if (!badge) {
            throw new ValidationError(`Badge ${badgeKey} does not exist.`);
        }

        const recipient = await this.userService.getById(purchasedForUserId, { _id: 1 });
        
        if (!recipient) {
            throw new ValidationError(`Recipient user ${purchasedForUserId} does not exist.`);
        }

        // Check if the buyer can afford the badge.
        const creditsOwned = await this.userService.getCredits(purchasedByUserId);

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

    async purchaseBadgeForPlayer(game: Game, purchasedByUserId: DBObjectId, purchasedForPlayerId: DBObjectId, badgeKey: string) {
        let buyer = this.playerService.getByUserId(game, purchasedByUserId)!;
        let recipient = this.playerService.getById(game, purchasedForPlayerId);

        if (!recipient) {
            throw new ValidationError(`Could not find the player in this game.`);
        }

        if (!recipient.userId) {
            throw new ValidationError(`The player slot has not been filled by a user.`);
        }

        const badge = await this.purchaseBadgeForUser(purchasedByUserId, recipient.userId, badgeKey);

        let e: GamePlayerBadgePurchasedEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            purchasedByPlayerId: buyer._id,
            purchasedByPlayerAlias: buyer.alias,
            purchasedForPlayerId: recipient._id,
            purchasedForPlayerAlias: recipient.alias,
            badgeKey,
            badgeName: badge.name
        };

        this.emit(BadgeServiceEvents.onGamePlayerBadgePurchased, e);
    }

    awardBadgeForUser(user: User, badgeKey: string): void {
        const badge = this.listBadges().find(b => b.key === badgeKey);

        if (!badge) {
            throw new ValidationError(`Badge ${badgeKey} does not exist.`);
        }

        user.achievements.badges[badgeKey]++;
    }

    awardBadgeForUserVictor32PlayerGame(user: User): void {
        this.awardBadgeForUser(user, 'victor32');
    }

    awardBadgeForUserVictorySpecialGame(user: User, game: Game): void {
        this.awardBadgeForUser(user, game.settings.general.type);
    }
};
