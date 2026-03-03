import { Game } from "./types/Game";
import { Carrier } from "./types/Carrier";
import { Star } from "./types/Star";
import Repository from "./repository";
import StarService from "./star";
import PlayerService from "./player";
import { WaypointService } from 'solaris-common';
import { Player } from "./types/Player";
import { CarrierTravelService } from 'solaris-common';
import { StarDataService } from "solaris-common";
import { DBObjectId } from "./types/DBObjectId";
import ScanningService from "./scanning";
import { KDTree } from "../utils/kdTree";
import { DistanceService } from 'solaris-common';

export default class CullWaypointsService {
    gameRepo: Repository<Game>;
    starService: StarService;
    playerService: PlayerService;
    waypointService: WaypointService<DBObjectId>;
    carrierTravelService: CarrierTravelService<DBObjectId>;
    starDataService: StarDataService;
    scanningService: ScanningService;
    distanceService: DistanceService;

    constructor(
        gameRepo: Repository<Game>,
        starService: StarService,
        playerService: PlayerService,
        waypointService: WaypointService<DBObjectId>,
        carrierTravelService: CarrierTravelService<DBObjectId>,
        starDataService: StarDataService,
        scanningService: ScanningService,
        distanceService: DistanceService,
    ) {
        this.gameRepo = gameRepo;
        this.starService = starService;
        this.playerService = playerService;
        this.waypointService = waypointService;
        this.carrierTravelService = carrierTravelService;
        this.starDataService = starDataService;
        this.scanningService = scanningService;
        this.distanceService = distanceService;
    }

    sanitiseAllCarrierWaypointsByScanningRange(game: Game) {
        const players = this._getPlayersWithOwnedOrInOrbitStars(game);

        const playerCarrierMap = new Map<Player, Carrier[]>();
        let remaining = game.galaxy.carriers;

        for (const player of players.values()) {
            const playerCarriers: Carrier[] = [];
            const otherCarriers: Carrier[] = [];

            remaining.forEach(c => {
                if (c.ownedByPlayerId === player.player._id) {
                    playerCarriers.push(c);
                } else otherCarriers.push(c);
            });
            remaining = otherCarriers;

            playerCarrierMap.set(player.player, playerCarriers);
        }

        let kdTree: KDTree | undefined = undefined;

        for (const player of players.values()) {
            // If the source point set is very small relative to the target point set, it is generally faster to compute the viewpoint.
            if (playerCarrierMap.get(player.player)!.length > player.stars.length * 5) {
                // TODO: Calculate during tick processing and load stored tree
                if (!kdTree) kdTree = new KDTree(this.distanceService, game.galaxy.stars);

                const scannedStarSet = this.scanningService.getStarSetByScanningRange(game, [player.player], kdTree);
                playerCarrierMap.get(player.player)!.forEach(c => this._checkCarrierRouteByViewpoint(game, c, player, scannedStarSet));
            } else {
                const treesWithRadius = this.scanningService.getScanningStarTrees(game, player.stars);
                playerCarrierMap.get(player.player)!.forEach(c => this._checkCarrierRoute(game, c, player, treesWithRadius));
            }
        }
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
        if (startingWaypointIndex >= carrier.waypoints.length) return null;

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

    _checkCarrierRouteByViewpoint(game: Game, carrier: Carrier, player: { player: Player, stars: Star[], inRange: Set<string> }, scannedStarSet: Set<Star>) {
        let startIndex = this.carrierTravelService.isInTransit(carrier) ? 1 : 0;
        for (let index = startIndex; index < carrier.waypoints.length; index++) {
            const waypoint = carrier.waypoints[index];
            if (player.inRange.has(waypoint.destination.toString())) continue;
            const waypointStar = this.starService.getById(game, waypoint.destination);
            if (this.scanningService.isStarWithinScanningRangeOfStarsByViewpoint(game, waypointStar, scannedStarSet)) {
                player.inRange.add(waypoint.destination.toString());
            } else {
                carrier.waypoints.splice(index);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.waypointService.canLoop(game, carrier);
                }

                break;
            }
        }
    }

    _checkCarrierRoute(game: Game, carrier: Carrier, player: { player: Player, stars: Star[], inRange: Set<string> }, treesWithRadius: [number, KDTree][]) {
        let startIndex = this.carrierTravelService.isInTransit(carrier) ? 1 : 0;
        for (let index = startIndex; index < carrier.waypoints.length; index++) {
            const waypoint = carrier.waypoints[index];
            if (player.inRange.has(waypoint.destination.toString())) continue;
            const waypointStar = this.starService.getById(game, waypoint.destination);

            let inScan = this.scanningService.isStarWithinScanningRangeOfStars(game, waypointStar, treesWithRadius);
            if (inScan) {
                player.inRange.add(waypoint.destination.toString());
            } else {
                carrier.waypoints.splice(index);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = this.waypointService.canLoop(game, carrier);
                }

                break;
            }
        }
    }

    _getPlayersWithOwnedOrInOrbitStars(game: Game) {
        const results = new Map<string, { player: Player, stars: Star[], inRange: Set<string> }>();
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
                    inRange: new Set<string>(starsOwnedOrInOrbit.map(s => s._id.toString()))
                });
            });
        return results;
    }
}