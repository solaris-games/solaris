const mongoose = require('mongoose');
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "@solaris-common";
import Repository from './repository';
import { Carrier } from './types/Carrier';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import { User } from './types/User';
import DiplomacyService from './diplomacy';
import StatisticsService from './statistics';
const EventEmitter = require('events');

export const CarrierGiftServiceEvents = {
    onPlayerGiftReceived: 'onPlayerGiftReceived',
    onPlayerGiftSent: 'onPlayerGiftSent'
}

export default class CarrierGiftService extends EventEmitter {
    gameRepo: Repository<Game>;
    diplomacyService: DiplomacyService;
    statisticsService: StatisticsService;

    constructor(
        gameRepo: Repository<Game>,
        diplomacyService: DiplomacyService,
        statisticsService: StatisticsService,
    ) {
        super();

        this.gameRepo = gameRepo;
        this.diplomacyService = diplomacyService;
        this.statisticsService = statisticsService;
    }

    async convertToGift(game: Game, player: Player, carrierId: DBObjectId) {
        let carrier = game.galaxy.carriers.find(c => c._id.toString() === carrierId.toString())!;

        if (game.settings.specialGalaxy.giftCarriers === 'disabled') {
            throw new ValidationError(`Gifting carriers has been disabled in this game.`);
        }

        if (carrier.ownedByPlayerId!.toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot convert carrier into a gift, you do not own this carrier.`);
        }

        if (carrier.isGift) {
            throw new ValidationError(`The carrier has already been converted into a gift.`);
        }

        // Convert the carrier into a gift.
        carrier.isGift = true;
        carrier.waypointsLooped = false;

        if (carrier.waypoints?.length) {
            const firstWaypoint = carrier.waypoints[0];

            firstWaypoint.action = 'nothing';
            firstWaypoint.actionShips = 0;
            firstWaypoint.delayTicks = 0;

            carrier.waypoints = [firstWaypoint];
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrier._id
        }, {
            $set: {
                'galaxy.carriers.$.isGift': true,
                'galaxy.carriers.$.waypointsLooped': false,
                'galaxy.carriers.$.waypoints': carrier.waypoints
            }
        });
    }

    transferGift(game: Game, gameUsers: User[], star: Star, carrier: Carrier) {
        if (!star.ownedByPlayerId) {
            throw new ValidationError(`Cannot transfer ownership of a gifted carrier to this star, no player owns the star.`);
        }

        const starPlayer = game.galaxy.players.find(p => star.ownedByPlayerId && p._id.toString() === star.ownedByPlayerId.toString())!;
        const starUser = gameUsers.find(u => starPlayer.userId && u._id.toString() === starPlayer.userId.toString());

        const carrierPlayer = game.galaxy.players.find(p => p._id.toString() === carrier.ownedByPlayerId!.toString())!;
        const carrierUser = gameUsers.find(u => carrierPlayer.userId && u._id.toString() === carrierPlayer.userId.toString());

        const isSamePlayer = starPlayer._id.toString() === carrierPlayer._id.toString();

        if (!isSamePlayer) {
            // If the star is not owned by the same player then increment player achievements.
            if (starUser && !starPlayer.defeated) {
                this.statisticsService.modifyStats(game._id, starPlayer._id, (stats) => {
                    stats.trade.giftsReceived += carrier.ships!;
                });
            }
    
            if (carrierUser && !carrierPlayer.defeated) {
                this.statisticsService.modifyStats(game._id, carrierPlayer._id, (stats) => {
                    stats.trade.giftsSent += carrier.ships!;
                });
            }

            carrier.ownedByPlayerId = star.ownedByPlayerId; // Transfer ownership
            
            // Remove the specialist. Note that this is required to get around an exploit where players can use a gift just before a battle to weaken the opponent.
            if (!this.diplomacyService.isFormalAlliancesEnabled(game) || !this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, [carrierPlayer._id, starPlayer._id])) {
                carrier.specialistId = null;
            }
            
            const eventObject = {
                gameId: game._id,
                gameTick: game.state.tick,
                fromPlayer: carrierPlayer,
                toPlayer: starPlayer,
                carrier,
                star
            };
    
            this.emit(CarrierGiftServiceEvents.onPlayerGiftReceived, eventObject);
            this.emit(CarrierGiftServiceEvents.onPlayerGiftSent, eventObject);

            carrier.isGift = false;
        } else if (!carrier.waypoints.length) {
            // Note: If the carrier has landed at a star the player already owns and
            // there are still waypoints then this means the carrier is passing
            // through owned territory and therefore should not be ungifted.
            // We should ungift in owned territory only if there are no remaining waypoints.
            carrier.isGift = false;
        }
    }

};
