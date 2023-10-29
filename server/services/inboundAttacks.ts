
import EventEmitter from "events";
import CarrierService from "./carrier";
import DiplomacyService from "./diplomacy";
import { Carrier } from "./types/Carrier";
import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { Star } from "./types/Star";
import PlayerInboundAttacksEvent from "./types/events/PlayerInboundAttacksEvent";
import StarService from "./star";
import SpecialistService from "./specialist";

export const InboundAttacksServiceEvents = {
    onPlayerInboundAttacks: 'onPlayerInboundAttacks',
}

export interface InboundAttacks {
    playerId: DBObjectId,
    starsUnderAttack: {
        star: Star,
        attackers: Carrier[]
    }[]
}

export default class InboundAttacksService extends EventEmitter {

    diplomacyService: DiplomacyService;
    carrierService: CarrierService;
    starService: StarService;
    specialistService: SpecialistService;

    constructor(
        diplomacyService: DiplomacyService,
        carrierService: CarrierService,
        starService: StarService,
        specialistService: SpecialistService
    ) {
        super()
        this.diplomacyService = diplomacyService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.specialistService = specialistService;
    }

    notifyInboundAttacks(game: Game) {

        let inboundAttacks: InboundAttacks[] = this._getInboundAttacks(game);

        for (let playerUnderAttack of inboundAttacks) {
            let e: PlayerInboundAttacksEvent = {
                gameId: game._id,
                gameTick: game.state.tick,
                playerId: playerUnderAttack.playerId,
                inboundAttacks: playerUnderAttack
            }
            this.emit(InboundAttacksServiceEvents.onPlayerInboundAttacks, e);
        }
    }

    // Sets carrier->star notification flag
    // Don't do this directly from notifyInboundAttacks, let notificationService do it after success
    async setNotificationFlag(game: Game, carrier: Carrier) {
        let destinationStar = this._getCarrierDestination(game, carrier)
        if (!destinationStar) return
        await this.starService.addInboundAttackNotified(game, destinationStar, carrier._id)
    }

    // Unsets carrier->star notification flag
    // gameTickService knows when ships move, so call it from there
    async unsetNotificationFlag(game: Game, carrier: Carrier) {
        let destinationStar = this._getCarrierDestination(game, carrier)
        if (!destinationStar) return
        await this.starService.removeInboundAttackNotified(game, destinationStar, carrier._id)
    }

    _getInboundAttacks(game: Game): InboundAttacks[] {
        let movingCarriers = game.galaxy.carriers.filter(c => c.waypoints.length);

        let attackingCarriers = movingCarriers
            .filter(c => this._checkForVisibleAttack(game, c))
            .filter(c => !this._checkForAlreadyNotified(game, c))

        let inboundAttacks: InboundAttacks[] = []
        // Build inboundAttacks struct
        for (let carrier of attackingCarriers) {

            let destinationStar = this._getCarrierDestination(game, carrier)
            if (!destinationStar) continue;

            let defenderPlayerId = destinationStar!.ownedByPlayerId

            let playerUnderAttack = inboundAttacks!.find(p => p.playerId.toString() === defenderPlayerId?.toString())

            if (!playerUnderAttack) {
                playerUnderAttack = {
                    playerId: destinationStar.ownedByPlayerId!,
                    starsUnderAttack: []
                }
                inboundAttacks.push(playerUnderAttack)
            }

            let starUnderAttack = inboundAttacks
                .find(p => p.playerId.toString() === defenderPlayerId?.toString())?.starsUnderAttack
                .find(s => s.star._id.toString() === destinationStar!._id.toString())

            if (!starUnderAttack) {
                starUnderAttack = {
                    star: destinationStar,
                    attackers: []
                }
                inboundAttacks.find(p => p.playerId.toString() === defenderPlayerId?.toString())?.starsUnderAttack.push(starUnderAttack)
            }

            // Have to manually load specialist here for client?
            if (carrier.specialistId) {
                carrier = JSON.parse(JSON.stringify(carrier)) // some better way to get the carrier to load it's specialist data?
                carrier.specialist = this.specialistService.getByIdCarrier(carrier.specialistId)
            }

            inboundAttacks
                .find(p => p.playerId.toString() === defenderPlayerId?.toString())?.starsUnderAttack
                .find(s => s.star._id.toString() === destinationStar!._id.toString())?.attackers
                .push(carrier)
        }

        return inboundAttacks
    }

    _checkForVisibleAttack(game: Game, carrier: Carrier): boolean {
        let destinationStar = this._getCarrierDestination(game, carrier)
        if (!destinationStar) return false

        let carrierOwner = carrier.ownedByPlayerId
        let destinationOwner = destinationStar?.ownedByPlayerId

        // Check if the star and carrier are owned by the same player
        if (!destinationOwner || (carrierOwner === destinationOwner)) return false

        // Check if the carrier is a gift
        if (carrier.isGift) return false

        // Check if the carrier hasn't left yet
        if(carrier.orbiting) return false

        // Check if the players are allied
        if (this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, [carrierOwner!, destinationOwner!])) return false

        // Check if the attacked player cannot see the carrier
        let visibleCarriers = this.carrierService.filterCarriersByScanningRange(game, [destinationOwner!]) ?? []
        if (!visibleCarriers.some(c => c._id.toString() === carrier._id.toString())) return false

        // If a carrier fights and dies (carrier to carrier seems possible) on the same tick it would be visible, do we want to send notification still? 
        // or are waypoints cleared already for a newly dead carrier?
        return true

    }

    _checkForAlreadyNotified(game: Game, carrier: Carrier) {
        let destinationStar = this._getCarrierDestination(game, carrier)
        return destinationStar?.inboundAttacksNotified?.some(c => c.toString() === carrier._id.toString())
    }

    _getCarrierDestination(game: Game, carrier: Carrier): Star | undefined {
        if (!carrier?.waypoints?.[0]) return undefined
        return game.galaxy.stars.find(s => s._id.toString() === carrier.waypoints[0].destination.toString());
    }

}
