import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { User } from "./types/User";
import { Carrier, CarrierPosition } from "./types/Carrier";

import CarrierMovementService from "./carrierMovement";
import DiplomacyService from "./diplomacy";
import DistanceService from "./distance";
import PlayerService from "./player";
import StarService from "./star";
import CombatService from "./combat";
import SpecialistService from "./specialist";

export default class CarrierCombatService {

    carrierMovementService: CarrierMovementService;
    combatService: CombatService;
    diplomacyService: DiplomacyService;
    distanceService: DistanceService;
    playerService: PlayerService;
    specialistService: SpecialistService;
    starService: StarService;

    constructor(
        carrierMovementService: CarrierMovementService,
        combatService: CombatService,
        diplomacyService: DiplomacyService,
        distanceService: DistanceService,
        playerService: PlayerService,
        specialistService: SpecialistService,
        starService: StarService
    ) {
        this.carrierMovementService = carrierMovementService;
        this.combatService = combatService;
        this.diplomacyService = diplomacyService;
        this.distanceService = distanceService;
        this.playerService = playerService;
        this.specialistService = specialistService;
        this.starService = starService;
    }

    async combatCarriers(game: Game, gameUsers: User[]) {
        const isAlliancesEnabled = this.diplomacyService.isFormalAlliancesEnabled(game);
    
        // Get all carriers that are in transit, their current locations
        // and where they will be moving to.
        const carrierPositions: CarrierPosition[] = game.galaxy.carriers
            .filter(x => 
                (
                    this.carrierMovementService.isInTransit(x)      // Carrier is already in transit
                    || this.carrierMovementService.isLaunching(x)   // Or the carrier is just about to launch (this prevent carrier from hopping over attackers)
                )
                && !this.specialistService.getAvoidCombatCarrierToCarrier(x)    // Check if the carrier is eligable for c2cc.
            )
            .map(c => {
                let waypoint = c.waypoints[0];
                let locationNext = this.carrierMovementService.getNextLocationToWaypoint(game, c);
    
                let sourceStar = this.starService.getById(game, waypoint.source);
                let destinationStar = this.starService.getById(game, waypoint.destination);
    
                // Note: There should never be a scenario where a carrier is travelling to a
                // destroyed star.
                let distanceToDestinationCurrent = this.distanceService.getDistanceBetweenLocations(c.location, destinationStar.location);
                let distanceToDestinationNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, destinationStar.location);
                let speed = this.carrierMovementService.getSpeedOfCarrier(game, c);
    
                let distanceToSourceCurrent,
                    distanceToSourceNext;
    
                // TODO: BUG: Its possible that a carrier is travelling from a star that has been destroyed
                // and is no longer in the game, this will cause carrier to carrier combat to be actioned.
                // RESOLUTION: Ideally store the source and destination locations instead of a reference to the stars
                // and then we still have a reference to the location of the now destroyed star.
                if (sourceStar) {
                    distanceToSourceCurrent = this.distanceService.getDistanceBetweenLocations(c.location, sourceStar.location);
                    distanceToSourceNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, sourceStar.location);
                } else {
                    distanceToSourceCurrent = 0;
                    distanceToSourceNext = distanceToSourceCurrent + locationNext.distance;
                }
    
                return {
                    carrier: c,
                    source: waypoint.source,
                    destination: waypoint.destination,
                    locationCurrent: c.location,
                    locationNext: locationNext.location,
                    distanceToSourceCurrent,
                    distanceToDestinationCurrent,
                    distanceToSourceNext,
                    distanceToDestinationNext,
                    speed
                };
            });
    
        const positionGraph = this._getCarrierPositionGraph(carrierPositions);
    
        for (let carrierPath in positionGraph) {
            let positions: CarrierPosition[] = positionGraph[carrierPath];
    
            if (positions.length <= 1) {
                continue;
            }
            
            let collisions: any = this._getDualCollisionsInPath(positions);
            this._mergeCollisionsinPath(collisions);

            // A collision will at this point be cleaned up to a list of carriers
            for(let collision of collisions) {
                // It could very well be that in a previous collision, carriers were destroyed/reduced to 0 ships.
                collision.filter(c => c.ships > 0)

                // This gets all the player ids of the players involved, and removes duplicates.
                let playersIds = [...new Set(collision.map(c => c.ownedByPlayerId.toString()))]

                // Now if we have little carriers remaining due to a previous filter, or if all are owned by the same player,
                // we quit the process here as no combat has to occur.
                if(playersIds.length <= 1) continue;
                if(isAlliancesEnabled) {
                    // Check if combat has to happen with the players involved
                }

                // TODO: Code how this works ;D
                await this._performCarrierCombat(game, gameUsers, collision)
            }

            /*
            for (let i = 0; i < positions.length; i++) {
                let friendlyCarrier = positions[i];
    
                if (friendlyCarrier.carrier.ships! <= 0) {
                    continue;
                }
    
                let collisionCarriers: CarrierPosition[] = positions
                    .filter((c: CarrierPosition) => {
                        return (c.carrier.ships! > 0 && !c.carrier.isGift) // Is still alive and not a gift
                            && (
                                // Head to head combat:
                                (
                                    c.destination.toString() === friendlyCarrier.source.toString()
                                    && c.distanceToSourceCurrent <= friendlyCarrier.distanceToDestinationCurrent
                                    && c.distanceToSourceNext >= friendlyCarrier.distanceToDestinationNext
                                )
                                ||
                                // Combat from behind: 
                                (
                                    c.destination.toString() === friendlyCarrier.destination.toString()
                                    && (
                                        // 
                                        (
                                            c.distanceToDestinationCurrent <= friendlyCarrier.distanceToDestinationCurrent
                                            && c.distanceToDestinationNext >= friendlyCarrier.distanceToDestinationNext
                                        )
                                        ||
                                        (
                                            c.distanceToDestinationCurrent <= friendlyCarrier.distanceToDestinationCurrent
                                            && c.distanceToDestinationNext >= friendlyCarrier.distanceToDestinationNext
                                        )
                                    )
                                )
                            )
                    });
    
                // Filter any carriers that avoid carrier-to-carrier combat.
                collisionCarriers = this._filterAvoidCarrierToCarrierCombatCarriers(collisionCarriers);
    
                if (!collisionCarriers.length) {
                    continue;
                }
    
                // If all of the carriers that have collided are friendly then no need to do combat.
                let friendlyCarriers = collisionCarriers
                    .filter(c => c.carrier.ships! > 0 && c.carrier.ownedByPlayerId!.toString() === friendlyCarrier.carrier.ownedByPlayerId.toString());
    
                // If all other carriers are friendly then skip.
                if (friendlyCarriers.length === collisionCarriers.length) {
                    continue;
                }
    
                const friendlyPlayer = this.playerService.getById(game, friendlyCarrier.carrier.ownedByPlayerId)!;
                
                const combatCarriers = collisionCarriers
                    .map(c => c.carrier)
                    .filter(c => c.ships! > 0);
    
                // Double check that there are carriers that can fight.
                if (!combatCarriers.length) {
                    continue;
                }
    
                // If alliances is enabled then ensure that only enemies fight.
                // TODO: Alliance combat here is very complicated when more than 2 players are involved.
                // For now, we will perform normal combat if any participant is an enemy of the others.
                if (isAlliancesEnabled) {
                    const playerIds: DBObjectId[] = [...new Set(combatCarriers.map(x => x.ownedByPlayerId!))];
    
                    const isAllPlayersAllied = this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, playerIds);
    
                    if (isAllPlayersAllied) {
                        continue;
                    }
                }
    
                // TODO: Check for specialists that affect pre-combat.
    
                await this.combatService.performCombat(game, gameUsers, friendlyPlayer, null, combatCarriers);
                
            }
            */
        }
    }
    
    _getCarrierPositionGraph(carrierPositions: CarrierPosition[]) {
        const graph = {};
    
        for (let carrierPosition of carrierPositions) {
            const graphKeyA = carrierPosition.destination.toString() + carrierPosition.source.toString();
            const graphKeyB = carrierPosition.source.toString() + carrierPosition.destination.toString();
    
            // If the source and distination are the same, we ignore c2cc.
            if (graphKeyA === graphKeyB) {
                continue;
            }
    
            // If the key already exists, we want to add this carrier to it, otherwise we create a new one.
            const graphObj = graph[graphKeyA] || graph[graphKeyB];
            
            if (graphObj) {
                graphObj.push(carrierPosition);
            } else {
                graph[graphKeyA] = [ carrierPosition ];
            }
        }
    
        return graph;
    }

    _getDualCollisionsInPath(positions: CarrierPosition[]) {
        let collisionList: any = [];

        // In order to be able to check if carriers intersect at the same place, we need the distance to a fixed star, which must exist.
        // As the source star can be destroyed we need a destination for that. Now the distance to that star can be used to check if carriers are in the same place.
        const pathDirection = positions[0].destination.toString()

        for(let i = 0; i < positions.length - 1; i++) {
            let carrierPositionA = positions[i];

            // Only consider carriers with ships that are not gifts
            if(carrierPositionA.carrier.ships! <= 0 || carrierPositionA.carrier.isGift) continue;

            for(let j = i + 1; j < positions.length; j++) {
                let carrierPositionB = positions[j];

                // Only consider carriers with ships
                if(carrierPositionB.carrier.ships! <= 0 || carrierPositionA.carrier.isGift) continue;

                // Check if carriers collide in this tick, if not, continue
                if(!this._collisionThisTick(carrierPositionA, carrierPositionB)) continue;

                // Check whether it is head_to_head (true) or by catching up (false)
                let head_to_head = carrierPositionA.destination.toString() === carrierPositionB.source.toString()

                // If carrier are moving towards each other, the speed adds, otherwise we need the difference.
                let relativeSpeed = head_to_head ? carrierPositionA.speed + carrierPositionB.speed : Math.abs(carrierPositionA.speed - carrierPositionB.speed)

                // The time we need is the distance devided by the relative speed.
                // Important is that carriers may overlap, getting them intercepting with a relative speed of 0.
                // Therefore we must filter out this problem. Time will always be between 0 and 1. (It can be 0 or 1 itself)
                let time = 0;
                if(head_to_head) {
                    // Now relative speed is definitely not 0.
                    time = (carrierPositionA.distanceToDestinationCurrent - carrierPositionB.distanceToSourceCurrent)/relativeSpeed
                } else if(relativeSpeed >= 10**-10) { // This gives enough of a safety margin so we know that the carriers are intersecting
                    time = Math.abs(carrierPositionA.distanceToDestinationCurrent - carrierPositionB.distanceToDestinationCurrent)/relativeSpeed
                }

                // Location is the distance to the "direction star" at the location where combat occurs
                let location = carrierPositionA.destination.toString() === pathDirection ? carrierPositionA.distanceToDestinationCurrent + time * carrierPositionA.speed : carrierPositionA.distanceToSourceCurrent - time * carrierPositionA.speed

                collisionList.push({
                    time,
                    location,
                    carriers: [carrierPositionA.carrier, carrierPositionB.carrier]
                })
            }
        }

        return collisionList;
    }

    _mergeCollisionsinPath(collisionList) {
        // If there is just 1 or fewer collisions, we still need to merge, as the format changes.
        let newCollisionList: any[] = []

        // As long as there are still ungrouped dual collisions, we continue to group.
        while(collisionList.length > 0) {
            // Everything that happens at the same time and place should be merged.
            let toMergeCollision = collisionList.filter(c => (Math.abs(collisionList[0].time - c.time) < 10**-10) && (Math.abs(collisionList[0].location - c.location) < 10**-10));
            let newCollision = this._mergeCollisions(toMergeCollision);
            newCollisionList.push(newCollision);

            // Continue with all elements that do not fall under the previous collision, repeat untill all collisions have been checked and removed.
            collisionList = collisionList.filter(c => !((Math.abs(collisionList[0].time - c.time) < 10**-10) && (Math.abs(collisionList[0].location - c.location) < 10**-10)));
        }

        // Make sure that the combat that should happen first is first in the list.
        collisionList = newCollisionList.sort((a, b) => a.time - b.time);      
    }

    _mergeCollisions(collisionList) {
        // Here we merge the carriers that will for sure all be at the same time and place together.
        // We cannot simply paste the carrier arrays after one another. This as some carriers can occur in multiple collisions.
        let carrierList: Carrier[] = []
        collisionList.forEach(c => {
            // If no carrier is yet in the list with this id, we still have to add it. This prevents doubles in the collisionlist.
            if(!carrierList.find(c.carrier._id.toString())) {
                carrierList.push(c.carrier)
            }
        });

        return {
            time: collisionList[0].time,
            location: collisionList[0].location,
            carriers: carrierList
        }
    }

    _collisionThisTick(cPosA: CarrierPosition, cPosB: CarrierPosition) {
        // At this point we know that they are in the same path (travelling between the same two stars)
        return (
            // Head to head combat:
            (
                cPosA.destination.toString() === cPosB.source.toString()
                && cPosA.distanceToSourceCurrent <= cPosB.distanceToDestinationCurrent
                && cPosA.distanceToSourceNext >= cPosB.distanceToDestinationNext
            )
            ||
            // Combat from behind: 
            (
                cPosA.destination.toString() === cPosB.destination.toString()
                && (
                    // Carrier B catches up to carrier A
                    (
                        cPosA.distanceToDestinationCurrent <= cPosB.distanceToDestinationCurrent
                        && cPosA.distanceToDestinationNext >= cPosB.distanceToDestinationNext
                    )
                    ||
                    // Carrier A catches up to B
                    (
                        cPosA.distanceToDestinationCurrent <= cPosB.distanceToDestinationCurrent
                        && cPosA.distanceToDestinationNext >= cPosB.distanceToDestinationNext
                    )
                )
            )
        )
    }
}