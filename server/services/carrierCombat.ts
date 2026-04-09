import { Carrier, CarrierPosition } from "./types/Carrier";
import { Game } from "./types/Game";
import { User } from "./types/User";

import CarrierMovementService from "./carrierMovement";
import CombatService from "./combat";
import DiplomacyService from "./diplomacy";
import PlayerService from "./player";
import SpecialistService from "./specialist";
import StarService from "./star";
import {CarrierCollision, DualCarrierCollision} from "./types/CarrierCollision";
import {CarrierTravelService, DistanceService} from "@solaris/common";
import {DBObjectId} from "./types/DBObjectId";

const EPSILON = 10**-10;

export default class CarrierCombatService {
    carrierTravelService: CarrierTravelService<DBObjectId>;
    carrierMovementService: CarrierMovementService;
    combatService: CombatService;
    diplomacyService: DiplomacyService;
    distanceService: DistanceService;
    playerService: PlayerService;
    specialistService: SpecialistService;
    starService: StarService;

    constructor(carrierTravelService: CarrierTravelService<DBObjectId>,
                carrierMovementService: CarrierMovementService,
                combatService: CombatService,
                diplomacyService: DiplomacyService,
                distanceService: DistanceService,
                playerService: PlayerService,
                specialistService: SpecialistService,
                starService: StarService) {
        this.carrierMovementService = carrierMovementService;
        this.carrierTravelService = carrierTravelService;
        this.combatService = combatService;
        this.diplomacyService = diplomacyService;
        this.distanceService = distanceService;
        this.playerService = playerService;
        this.specialistService = specialistService;
        this.starService = starService;
    }

    async combatCarriers(game: Game, gameUsers: User[]) {
        // Get all carriers that are in transit, their current locations
        // and where they will be moving to.
        const carrierPositions: CarrierPosition[] = game.galaxy.carriers
            .filter(x =>
                (
                    this.carrierTravelService.isInTransit(x)      // Carrier is already in transit
                    || this.carrierTravelService.isLaunching(x)   // Or the carrier is just about to launch (this prevent carrier from hopping over attackers)
                )
                && !this.specialistService.getAvoidCombatCarrierToCarrier(x)    // Check if the carrier is eligable for c2cc.
            )
            .map(c => {
                const waypoint = c.waypoints[0];
                const locationNext = this.carrierMovementService.getNextLocationToWaypoint(game, c);

                const sourceStar = this.starService.getById(game, waypoint.source);
                const destinationStar = this.starService.getById(game, waypoint.destination);

                // Note: There should never be a scenario where a carrier is travelling to a
                // destroyed star.
                const distanceToDestinationCurrent = this.distanceService.getDistanceBetweenLocations(c.location, destinationStar.location);
                const distanceToDestinationNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, destinationStar.location);
                const speed = this.carrierTravelService.getSpeedOfCarrier(game, c);

                let distanceToSourceCurrent: number;
                let distanceToSourceNext: number;

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
            const positions: CarrierPosition[] = positionGraph.get(carrierPath)!;

            if (positions.length <= 1) {
                continue;
            }

            const dualCollisions: DualCarrierCollision[] = this._getDualCollisionsInPath(positions);

            // TODO: Rewrite merging logic, until here everything looks good

            const collisions = this._mergeCollisionsinPath(dualCollisions);

            // A collision will at this point be cleaned up to a list of carriers
            for( let collision of collisions) {
                // It could very well be that in a previous collision, carriers were destroyed/reduced to 0 ships.
                collision.carriers.filter(c => c.ships! > 0)

                // This gets all the player ids of the players involved, and removes duplicates.
                let playersIds = [...new Set(collision.carriers.map(c => c.ownedByPlayerId!.toString()))]

                // Now if we have little carriers remaining due to a previous filter, or if all are owned by the same player,
                // we quit the process here as no combat has to occur.
                if(playersIds.length <= 1) continue;

                await this._performCarrierCombat(game, gameUsers, collision)
            }
        }
    }

    async _performCarrierCombat(game: Game, gameUsers: User[], collision: CarrierCollision) {
        // TODO
    }

    _getCarrierPositionGraph(carrierPositions: CarrierPosition[]) {
        const graph: Map<string, CarrierPosition[]> = new Map();

        for (let carrierPosition of carrierPositions) {
            const graphKeyA = carrierPosition.destination.toString() + carrierPosition.source.toString();
            const graphKeyB = carrierPosition.source.toString() + carrierPosition.destination.toString();

            // If the source and distination are the same, we ignore c2cc.
            if (graphKeyA === graphKeyB) {
                continue;
            }

            // If the key already exists, we want to add this carrier to it, otherwise we create a new one.
            const graphObj = graph.get(graphKeyA) || graph.get(graphKeyB);

            if (graphObj) {
                graphObj.push(carrierPosition);
            } else {
                graph[graphKeyA] = [ carrierPosition ];
            }
        }

        return graph;
    }

    _getDualCollisionsInPath(positions: CarrierPosition[]) : DualCarrierCollision[] {
        let collisionList: DualCarrierCollision[] = [];

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

    _mergeCollisionsinPath(collisionList: DualCarrierCollision[]): CarrierCollision[] {
        const collisions: CarrierCollision[] = [];

        // As long as there are still ungrouped dual collisions, we continue to group.
        while(collisionList.length > 0) {
            const coll = collisionList.pop()!;
            const toMerge = new Array<DualCarrierCollision>();
            toMerge.push(coll);

            for (let i = 0; i < collisionList.length; i++) {
                const c = collisionList[i];

                if ((Math.abs(coll.time - c.time) < EPSILON) && (Math.abs(coll.location - c.location) < EPSILON)) {
                    toMerge.push(c);
                    collisionList.splice(i, 1);
                    i--;
                }
            }

            collisions.push(this._mergeCollisions(toMerge));
        }

        // Make sure that the combat that should happen first is first in the list.
        collisions.sort((a, b) => a.time - b.time);

        return collisions;
    }

    _mergeCollisions(collisionList: DualCarrierCollision[]): CarrierCollision {
        return {
            time: collisionList[0].time,
            location: collisionList[0].location,
            carriers: Array.from(new Set(collisionList.flatMap(c => c.carriers))),
        };
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