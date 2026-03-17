import { Game } from "./types/Game";
import { Player } from "./types/Player";
import StarService from "./star";
import { StarDataService, TechnologyService } from 'solaris-common';
import { MapObject } from "./types/Map";
import { KDTree } from "../utils/kdTree";
import { DistanceService, StarDistanceService } from 'solaris-common';
import { Star } from "./types/Star";
import GameStateService from "./gameState";
import { Carrier } from "./types/Carrier";
import CarrierService from "./carrier";
import { DBObjectId } from "./types/DBObjectId";

export default class ScanningService {
    static SINGLE_TREE_COST_FACTOR = 5.0;

    starService: StarService;
    starDataService: StarDataService;
    distanceService: DistanceService;
    technologyService: TechnologyService;
    gameStateService: GameStateService;
    starDistanceService: StarDistanceService;
    carrierService: CarrierService;

    constructor(
        starService: StarService,
        starDataService: StarDataService,
        distanceService: DistanceService,
        technologyService: TechnologyService,
        gameStateService: GameStateService,
        starDistanceService: StarDistanceService,
        carrierService: CarrierService,
    ) {
        this.starService = starService;
        this.starDataService = starDataService;
        this.distanceService = distanceService;
        this.technologyService = technologyService;
        this.gameStateService = gameStateService;
        this.starDistanceService = starDistanceService;
        this.carrierService = carrierService;
    }

    starSetToSortedList(starSet: Set<Star>) {
        const stars = Array.from(starSet).sort((a, b) => a._id.toString() < b._id.toString() ? -1 : 1);

        return stars;
    }

    getStarSetByScanningRange(game: Game, players: Player[], kdTree: KDTree) {
        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        const starsOwnedOrInOrbit = this.starService.listStarsOwnedOrInOrbitByPlayers(game, players.map(p => p._id));
        const starsWithScanning = starsOwnedOrInOrbit.filter(s => !this.starDataService.isDeadStar(s));

        let starsInRange = new Set<Star>();

        for (const star of starsWithScanning) {
            this.getStarsWithinScanningRangeOfStar(game, star, kdTree).forEach(s => starsInRange.add(s));
        }
        kdTree.resetMarked();

        // If worm holes are present, then ensure that any owned star OR star in orbit
        // also has its paired star visible.
        starsOwnedOrInOrbit
            .filter(s => s.wormHoleToStarId)
            .map(s => {
                return {
                    source: s,
                    destination: this.starService.getById(game, s.wormHoleToStarId!)
                };
            })
            .forEach(s => starsInRange.add(s.destination));

        return starsInRange;
    }

    getCarrierSetByScanningRange(game: Game, players: Player[], kdTree: KDTree) {
        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        const starsOwnedOrInOrbit = this.starService.listStarsOwnedOrInOrbitByPlayers(game, players.map(p => p._id));
        const starsWithScanning = starsOwnedOrInOrbit.filter(s => !this.starDataService.isDeadStar(s));

        let carriersInRange = new Set<Carrier>();

        for (const star of starsWithScanning) {
            this.getCarriersWithinScanningRangeOfStar(game, star, kdTree).forEach(c => carriersInRange.add(c));
        }
        kdTree.resetMarked();

        return carriersInRange;
    }

    // Requires manually calling resetMarked() after
    getStarsWithinScanningRangeOfStar(game: Game, star: Star, kdTree: KDTree): Star[] {
        return this._getObjectsWithinScanningRangeOfStar(game, star, kdTree).map(i => game.galaxy.stars[i]);
    }

    // Requires manually calling resetMarked() after
    getCarriersWithinScanningRangeOfStar(game: Game, star: Star, kdTree: KDTree): Carrier[] {
        return this._getObjectsWithinScanningRangeOfStar(game, star, kdTree).map(i => game.galaxy.carriers[i]);
    }

    _getObjectsWithinScanningRangeOfStar(game: Game, star: Star, kdTree: KDTree): number[] {
        // If the star isn't owned then it cannot have a scanning range
        if (star.ownedByPlayerId == null) {
            return [];
        }

        // Calculate the scanning distance of the given star.
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);

        return kdTree.getWithinRadius(star, scanningRangeDistance);
    }

    addWaypointDestinations(game: Game, players: Player[], starsInScanningRange: Star[]) {
        const playerIds = players.map(p => p._id);
        const ids = playerIds.map(p => p.toString());

        // If in dark mode then we need to also include any stars that are 
        // being travelled to by carriers in transit for the current player.
        const inTransitStars = game.galaxy.carriers
            .filter(c => !c.orbiting)
            .filter(c => ids.includes(c.ownedByPlayerId!.toString()))
            .map(c => c.waypoints[0].destination)
            .map(d => this.starService.getById(game, d));

        for (let transitStar of inTransitStars) {
            if (starsInScanningRange.indexOf(transitStar) < 0) {
                starsInScanningRange.push(transitStar);
            }
        }

        return starsInScanningRange;
    }

    getPlayersWithinScanningRangeOfStars(game: Game, otherPlayers: Player[], scannedStarSet: Set<Star>) {
        let inRange: Player[] = [];

        for (let otherPlayer of otherPlayers) {
            let otherPlayerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, otherPlayer._id);

            let isInRange = false;

            for (let s of otherPlayerStars) {
                if (this.isStarWithinScanningRangeOfStarsBySingleTree(game, s, scannedStarSet)) {
                    isInRange = true;
                    break;
                }
            }

            if (isInRange) {
                inRange.push(otherPlayer);
            }
        }

        return inRange;
    }

    isStarWithinScanningRangeOfStarsBySingleTree(game: Game, star: Star, scannedStarSet: Set<Star>) {
        // Pulsars are considered to be always in scanning range.
        // Note: They are not visible until the game starts to prevent pre-teaming.
        if (this.isStarAlwaysVisible(star) && this.gameStateService.isStarted(game)) {
            return true;
        }

        if (scannedStarSet.has(star)) return true;

        return false;
    }

    isStarAlwaysVisible(star: Star) {
        return star.isPulsar || star.specialistId === 10 // Trade port
    }

    listStarsWithScanningRangeByPlayers(game: Game, playerIds: DBObjectId[]): Star[] {
        return this.starService.listStarsOwnedOrInOrbitByPlayers(game, playerIds).filter(s => !this.starDataService.isDeadStar(s));
    }

    calculateScanningMap(game: Game, players: Player[], kdTree: KDTree) {
        const scanningMap = new Map<Player, Set<Star>>();

        for (const player of players) {
            scanningMap.set(player, this.getStarSetByScanningRange(game, [player], kdTree));
        }

        return scanningMap;
    }

    isObjectWithinScanningRangeOfStars(object: MapObject, starTreesWithRadius: [number, KDTree][]) {
        for (const starTreeWithRadius of starTreesWithRadius) {
            if (starTreeWithRadius[1].isWithinRadiusOfAny(object.location, starTreeWithRadius[0])) return true;
        }
        return false;
    }

    isStarWithinScanningRangeOfStars(game: Game, star: Star, starTreesWithRadius: [number, KDTree][]) {
        // Pulsars are considered to be always in scanning range.
        // Note: They are not visible until the game starts to prevent pre-teaming.
        if (this.isStarAlwaysVisible(star) && this.gameStateService.isStarted(game)) {
            return true;
        }

        if (this.isObjectWithinScanningRangeOfStars(star, starTreesWithRadius)) return true;

        return false;
    }

    isInScanningRangeOfPlayer(game: Game, sourcePlayer: Player, targetPlayer: Player) {
        const starsOwnedOrInOrbit = this.starService.listStarsOwnedOrInOrbitByPlayers(game, [sourcePlayer._id]);
        const starsWithScanning = starsOwnedOrInOrbit.filter(s => !this.starDataService.isDeadStar(s));

        const targetPlayerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, targetPlayer._id);

        // If the source player is very small relative to the target player, it is generally faster to compute their viewpoint.
        if (targetPlayerStars.length > starsWithScanning.length * ScanningService.SINGLE_TREE_COST_FACTOR) {
            return this._isInScanningRangeOfPlayerBySingleTree(game, sourcePlayer, targetPlayer);
        }

        // Group stars by their scanning range, since we need to build a tree for each group.
        const treesWithRadius = this.getScanningStarTrees(game, starsWithScanning);

        for (const targetStar of targetPlayerStars) {
            for (const tree of treesWithRadius) {
                if (tree[1].isWithinRadiusOfAny(targetStar.location, tree[0])) {
                    return true;
                }
            }
        }

        return false;
    }

    _isInScanningRangeOfPlayerBySingleTree(game: Game, sourcePlayer: Player, targetPlayer: Player) {
        // TODO: Calculate during tick processing and load stored tree
        const kdTree = new KDTree(this.distanceService, game.galaxy.stars);

        const scannedStarSet = this.getStarSetByScanningRange(game, [sourcePlayer], kdTree);

        return this.getPlayersWithinScanningRangeOfStars(game, [targetPlayer], scannedStarSet)
            .find(p => p._id.toString() === targetPlayer._id.toString()) != null;
    }

    getScanningStarTrees(game: Game, starsWithScanning: Star[]) {
        const starGroups = new Map<number, Star[]>();
        for (const star of starsWithScanning) {
            const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
            const scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);

            let group = starGroups.get(scanningRangeDistance);
            if (group) {
                group.push(star);
            } else {
                starGroups.set(scanningRangeDistance, [star]);
            }
        }

        const treesWithRadius: [number, KDTree][] = [];
        for (const group of starGroups.entries()) {
            treesWithRadius.push([group[0], new KDTree(this.distanceService, group[1])]);
        }
        treesWithRadius.sort((a, b) => b[0] - a[0]);

        return treesWithRadius;
    }

    calculateViewpointScanning(game: Game, players: Player[]) {
        const scannedStarSet = new Set<Star>();
        const scannedPlayerIdSet = new Set<DBObjectId>();
        const scannedCarrierSet = new Set<Carrier>();
        const unscannedWormholeSet = new Set<Star>();

        const starsOwnedOrInOrbit = this.starService.listStarsOwnedOrInOrbitByPlayers(game, players.map(p => p._id));
        const starsWithScanning = starsOwnedOrInOrbit.filter(s => !this.starDataService.isDeadStar(s));

        starsWithScanning.forEach(e => scannedStarSet.add(e));

        let treesWithRadius: [number, KDTree][] | undefined = undefined;

        if (game.galaxy.stars.length > starsWithScanning.length * ScanningService.SINGLE_TREE_COST_FACTOR) {
            // TODO: Calculate during tick processing and load stored tree
            const kdTree = new KDTree(this.distanceService, game.galaxy.stars);

            for (const star of starsWithScanning) {
                const starsInRange = this.getStarsWithinScanningRangeOfStar(game, star, kdTree);

                for (const scannedStar of starsInRange) {
                    scannedStarSet.add(scannedStar);

                    if (star.ownedByPlayerId != null) {
                        scannedPlayerIdSet.add(star.ownedByPlayerId);
                    }
                }
            }
            kdTree.resetMarked();
        } else {
            if (!treesWithRadius) treesWithRadius = this.getScanningStarTrees(game, starsWithScanning);

            for (const star of game.galaxy.stars) {
                if (scannedStarSet.has(star)) continue;

                for (const tree of treesWithRadius) {
                    if (tree[1].isWithinRadiusOfAny(star.location, tree[0])) {
                        scannedStarSet.add(star);

                        if (star.ownedByPlayerId != null) {
                            scannedPlayerIdSet.add(star.ownedByPlayerId);
                        }

                        break;
                    }
                }
            }
        }

        // If worm holes are present, then ensure that any owned star OR star in orbit
        // also has its paired star visible.
        starsOwnedOrInOrbit
            .filter(s => s.wormHoleToStarId)
            .map(s => {
                return {
                    source: s,
                    destination: this.starService.getById(game, s.wormHoleToStarId!)
                };
            })
            .forEach(s => {
                if (!scannedStarSet.has(s.destination)) {
                    unscannedWormholeSet.add(s.destination);
                    scannedStarSet.add(s.destination);
                }
            });


        if (game.galaxy.carriers.length > starsWithScanning.length * ScanningService.SINGLE_TREE_COST_FACTOR) {
            // TODO: Calculate during tick processing and load stored tree
            const kdTree = new KDTree(this.distanceService, game.galaxy.carriers);

            for (const star of starsWithScanning) {
                const carriersInRange = this.getCarriersWithinScanningRangeOfStar(game, star, kdTree);

                for (const scannedCarrier of carriersInRange) {
                    scannedCarrierSet.add(scannedCarrier);
                }
            }
            kdTree.resetMarked();
        } else {
            if (!treesWithRadius) treesWithRadius = this.getScanningStarTrees(game, starsWithScanning);

            for (const carrier of game.galaxy.carriers) {
                if (scannedCarrierSet.has(carrier)) continue;

                for (const tree of treesWithRadius) {
                    if (tree[1].isWithinRadiusOfAny(carrier.location, tree[0])) {
                        scannedCarrierSet.add(carrier);
                        break;
                    }
                }
            }
        }

        return {
            stars: scannedStarSet,
            playerIds: scannedPlayerIdSet,
            carriers: scannedCarrierSet,
            unscannedWormHoles: unscannedWormholeSet
        }
    }
}