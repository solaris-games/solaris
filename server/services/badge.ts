import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Badge } from './types/Badge';
import { Game } from './types/Game';
import {AwardedBadge, User} from './types/User';
import PlayerService from './player';
import UserService from './user';
import InternalGamePlayerBadgePurchasedEvent from './types/internalEvents/GamePlayerBadgePurchased';
import { GameTypeService } from 'solaris-common'
import GameStateService from "./gameState";
import EventEmitter from "events";

export const BadgeServiceEvents = {
    onGamePlayerBadgePurchased: 'onGamePlayerBadgePurchased'
}

export default class BadgeService extends EventEmitter {
    userRepo: Repository<User>;
    userService: UserService;
    playerService: PlayerService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;

    constructor(
        userRepo: Repository<User>,
        userService: UserService,
        playerService: PlayerService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
    ) {
        super();

        this.userRepo = userRepo;
        this.userService = userService;
        this.playerService = playerService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
    }

    listBadges(): Badge[] {
        return require('../config/game/badges').slice();
    }

    listPurchasableBadges(): Badge[] {
        return this.listBadges().filter(b => b.price);
    }

    async listBadgesByUser(userId: DBObjectId): Promise<AwardedBadge[]> {
        const user = await this.userService.getById(userId, {
            'achievements.badges': 1
        });

        if (!user?.achievements?.badges) {
            return [];
        }

        return user.achievements.badges;
    }

    async listBadgesByPlayer(game: Game, playerId: DBObjectId) {
        const player = this.playerService.getById(game, playerId);

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

    async purchaseBadgeForPlayer(game: Game, purchasedByUserId: DBObjectId, purchasedForPlayerId: DBObjectId, badgeKey: string) {
        let buyer = this.playerService.getByUserId(game, purchasedByUserId)!;
        let recipient = this.playerService.getById(game, purchasedForPlayerId);

        if (!recipient) {
            throw new ValidationError(`Could not find the player in this game.`);
        }

        if (!recipient.userId) {
            throw new ValidationError(`The player slot has not been filled by a user.`);
        }

        if (this.gameTypeService.isAnonymousGame(game) && !this.gameStateService.isFinished(game)) {
            throw new ValidationError(`Cannot purchase a badge in an anonymous game before it finishes.`);
        }

        const purchasedForUserId = recipient.userId;

        if (purchasedByUserId.toString() === purchasedForUserId.toString()) {
            throw new ValidationError(`Cannot purchased a badge for yourself.`);
        }

        const badge = this.listPurchasableBadges().find(b => b.key === badgeKey);

        if (!badge) {
            throw new ValidationError(`Badge ${badgeKey} does not exist.`);
        }

        const recipientUser = await this.userService.getById(purchasedForUserId, {_id: 1});

        if (!recipientUser) {
            throw new ValidationError(`Recipient user ${purchasedForUserId} does not exist.`);
        }

        // Check if the buyer can afford the badge.
        const creditsOwned = await this.userService.getCredits(purchasedByUserId);

        if (!creditsOwned || creditsOwned < badge.price) {
            throw new ValidationError(`You cannot afford to purchase this badge.`);
        }

        // TODO: This would be better in a bulk update.
        await this.userService.incrementCredits(purchasedByUserId, -1);

        const awardedBadge: AwardedBadge = {
            badge: badgeKey,
            awardedBy: buyer._id,
            awardedByName: buyer.alias,
            awardedInGame: game._id,
            awardedInGameName: game.settings.general.name,
            playerAwarded: true,
            time: new Date()
        }

        await this.userRepo.updateOne({
            _id: purchasedForUserId
        }, {
            $push: {
                'achievements.badges': awardedBadge,
            }
        });

        let e: InternalGamePlayerBadgePurchasedEvent = {
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

    awardBadgeForUser(user: User, badgeKey: string, game: Game, date: Date): void {
        const badge = this.listBadges().find(b => b.key === badgeKey);

        if (!badge) {
            throw new ValidationError(`Badge ${badgeKey} does not exist.`);
        }

        const awardedBadge: AwardedBadge = {
            badge: badgeKey,
            awardedBy: null,
            awardedByName: null,
            awardedInGame: game._id,
            awardedInGameName: game.settings.general.name,
            playerAwarded: false,
            time: date
        }

        user.achievements.badges.push(awardedBadge);
    }

    awardBadgeForUserVictor32PlayerGame(user: User, game: Game): void {
        this.awardBadgeForUser(user, 'victor32', game, game.state.endDate!);
    }

    awardBadgeForUserVictorySpecialGame(user: User, game: Game): void {
        this.awardBadgeForUser(user, game.settings.general.type, game, game.state.endDate!);
    }
};
