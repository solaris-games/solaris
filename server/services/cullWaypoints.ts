import {Game} from "./types/Game";
import {Carrier} from "./types/Carrier";
import {Star} from "./types/Star";
import Repository from "./repository";
import StarService from "./star";
import PlayerService from "./player";
import WaypointService from "./waypoint";
import {Player} from "./types/Player";
import { CarrierTravelService } from 'solaris-common';
import { StarDataService } from "solaris-common";

export default class CullWaypointsService {
    gameRepo: Repository<Game>;
    starService: StarService;
    playerService: PlayerService;
    waypointService: WaypointService;
    carrierTravelService: CarrierTravelService;
    starDataService: StarDataService;

    constructor(
        gameRepo: Repository<Game>,
        starService: StarService,
        playerService: PlayerService,
        waypointService: WaypointService,
        carrierTravelService: CarrierTravelService,
        starDataService: StarDataService,
    ) {
        this.gameRepo = gameRepo;
        this.starService = starService;
        this.playerService = playerService;
        this.waypointService = waypointService;
        this.carrierTravelService = carrierTravelService;
        this.starDataService = starDataService;
    }

    sanitiseAllCarrierWaypointsByScanningRange(game: Game) {
        const players = this._getPlayersWithOwnedOrInOrbitStars(game);
        game.galaxy.carriers
            .filter(c => c.waypoints.length && c.ownedByPlayerId)
            .forEach(c => {
                this._checkCarrierRoute(game, c, players.get(c.ownedByPlayerId!.toString())!);
            });
    }

    async cullWaypointsByHyperspaceRangeDB(game: Game, carrier: Carrier) {
        let cullResult = this.cullWaypointsByHyperspaceRange(game, carrier);

        if (cullResult) {
            await this.gameRepo.updateOne({
                _id: game._id,
                'galaxy.carriers._id': carrier._id
            }, {
                $set: {
                    'galaxy.carriers.$.waypoints': cullResult.waypoints,
                    'galaxy.carriers.$.waypointsLooped': cullResult.waypointsLooped,
                }
            });
        }

        return cullResult;
    }

    cullWaypointsByHyperspaceRange(game: Game, carrier: Carrier) {
        if (!carrier.waypoints.length) {
            return;
        }

        let player = this.playerService.getById(game, carrier.ownedByPlayerId!)!;

        // Iterate through all waypoints the carrier has one by one and
        // if any of them are not valid then remove it and all subsequent waypoints.
        let waypointsCulled = false;

        // If in transit, then cull starting from the 2nd waypoint.
        let startingWaypointIndex = this.carrierTravelService.isInTransit(carrier) ? 1 : 0;
        if(startingWaypointIndex >= carrier.waypoints.length) return null;

        let startingWaypoint = carrier.waypoints[startingWaypointIndex];

        let sourceStar = this.starService.getByIdBS(game, startingWaypoint.source);
        let destinationStar: Star | null = null;

        for (let i = startingWaypointIndex; i < carrier.waypoints.length; i++) {
            let waypoint = carrier.waypoints[i];
            destinationStar = this.starService.getByIdBS(game, waypoint.destination);

            if (!this.waypointService.starRouteIsWithinHyperspaceRange(game, carrier, sourceStar, destinationStar)) {
                waypointsCulled = true;

                carrier.waypoints.splice(i);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.waypointService.canLoop(game, carrier);
                }

                break;
            }
            // Update the source star to be the destination star for the next iteration.
            sourceStar = destinationStar;
        }

        if (waypointsCulled) {
            return {
                waypoints: carrier.waypoints,
                waypointsLooped: carrier.waypointsLooped
            };
        }

        return null;
    }

    cullAllWaypointsByHyperspaceRange(game: Game) {
        for (let carrier of game.galaxy.carriers) {
            this.cullWaypointsByHyperspaceRange(game, carrier);
        }
    }

    _checkCarrierRoute(game: Game, carrier: Carrier, player: { player: Player, stars: Star[], inRange: string[] }) {
        let startIndex = this.carrierTravelService.isInTransit(carrier) ? 1 : 0;
        for (let index = startIndex; index < carrier.waypoints.length; index++) {
            const waypoint = carrier.waypoints[index];
            if(waypoint.destination.toString() in player.inRange) continue;
            const waypointStar = this.starService.getById(game, waypoint.destination);
            if(this._checkWaypointStarInRange(game, waypointStar, player)){
                player.inRange.push(waypoint.destination.toString());
            }else{
                carrier.waypoints.splice(index);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.waypointService.canLoop(game, carrier);
                }

                break;
            }
        }
    }

    _checkWaypointStarInRange(game: Game, waypoint: Star, player: { player: Player, stars: Star[], inRange: string[] }) {
        for (let index = 0; index < player.stars.length; index++) {
            const star = player.stars[index];
            if(this.starService.getStarsWithinScanningRangeOfStarByStarIds(game, star, [waypoint]).length) return true;
        }
        return false;
    }

    _getPlayersWithOwnedOrInOrbitStars(game: Game) {
        const results = new Map<string, { player: Player, stars: Star[], inRange: string[] }>();
        game.galaxy.players
            .forEach(p => {
                const starsOwnedOrInOrbit = this.starService.listStarsOwnedOrInOrbitByPlayers(game, [p._id]);
                const starsWithScanning = starsOwnedOrInOrbit.filter(s => !this.starDataService.isDeadStar(s));
                let wormHoleStars = starsOwnedOrInOrbit.filter(s => s.wormHoleToStarId)
                wormHoleStars.forEach(s => {
                    starsOwnedOrInOrbit.push(s, this.starService.getById(game, s.wormHoleToStarId!))
                });
                results.set(p._id.toString(), {
                    player: p,
                    stars: starsWithScanning,
                    inRange: starsOwnedOrInOrbit.map(s => s._id.toString())
                });
            });
        return results;
    }
}