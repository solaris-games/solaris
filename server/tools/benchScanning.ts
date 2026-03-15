import {
    Game,
    Star,
    GameTypeService,
    Player,
    StarDataService,
    TechnologyService,
    DistanceService, StarDistanceService, Carrier
} from "solaris-common";
import {KDTree} from "../utils/kdTree";
import SpecialistService from "../services/specialist";
import {logger} from "../utils/logging";
import mongooseLoader from "../db";
import config from "../config";
import containerLoader from "../services";
import {serverStub} from "../sockets/serverStub";
import {DBObjectId, objectIdFromString} from "../services/types/DBObjectId";
import {DependencyContainer} from "../services/types/DependencyContainer";
import GameStateService from "../services/gameState";
import {MapObject, MapObjectWithVisibility} from "../services/types/Map";

const { performance } = require('perf_hooks');

const listStarsOwnedByPlayer = (game: Game<DBObjectId>, playerId: DBObjectId) => {
    return game.galaxy.stars.filter((s) => playerId.toString() === s.ownedByPlayerId?.toString());
}

const listStarsOwnedByPlayers = (stars: Star<DBObjectId>[], playerIds: DBObjectId[]) => {
    const ids = playerIds.map(p => p.toString());

    return stars.filter(s => s.ownedByPlayerId && ids.includes(s.ownedByPlayerId.toString()));
};

const starDataService = new StarDataService();
const gameTypeService = new GameTypeService();
const technologyService = new TechnologyService(new SpecialistService(gameTypeService), gameTypeService);
const distanceService = new DistanceService();
const starDistanceService = new StarDistanceService(distanceService);
const gameStateService = new GameStateService();

type ScanningFunc = (game: Game<DBObjectId>, sourcePlayer: Player<DBObjectId>, targetPlayer: Player<DBObjectId>) => boolean;

type SanitizeFunc = (game: Game<DBObjectId>) => void;

const getById = (game: Game<DBObjectId>, id: DBObjectId | string): Star<DBObjectId> => {
    return game.galaxy.stars.find(s => s._id.toString() === id.toString())!;
}

const listStarIdsWithPlayersCarriersInOrbit = (game: Game<DBObjectId>, playerIds: DBObjectId[]): string[] => {
    const ids = playerIds.map(p => p.toString());

    return game.galaxy.carriers
        .filter(c => c.orbiting)
        .filter(c => ids.includes(c.ownedByPlayerId!.toString()))
        .map(c => c.orbiting!.toString());
}

const listStarsOwnedOrInOrbitByPlayers = (game: Game<DBObjectId>, playerIds: DBObjectId[]): Star<DBObjectId>[] => {
    let starIds: string[] = listStarsOwnedByPlayers(game.galaxy.stars, playerIds).map(s => s._id.toString());

    if (game.settings.diplomacy.enabled === 'enabled') { // Don't need to check in orbit carriers if alliances is disabled
        starIds = starIds.concat(listStarIdsWithPlayersCarriersInOrbit(game, playerIds));
    }

    starIds = [...new Set(starIds)];

    return starIds
        .map(id => getById(game, id));
}

const getScanningStarTrees = (game: Game<DBObjectId>, starsWithScanning: Star<DBObjectId>[]) => {
    const starGroups = new Map<number, Star<DBObjectId>[]>();
    for (const star of starsWithScanning) {
        const effectiveTechs = technologyService.getStarEffectiveTechnologyLevels(game, star);
        const scanningRangeDistance = distanceService.getScanningDistance(game, effectiveTechs.scanning);

        let group = starGroups.get(scanningRangeDistance);
        if (group) {
            group.push(star);
        } else {
            starGroups.set(scanningRangeDistance, [star]);
        }
    }

    const treesWithRadius: [number, KDTree][] = [];
    for (const group of starGroups.entries()) {
        // @ts-ignore
        treesWithRadius.push([group[0], new KDTree(distanceService, group[1])]);
    }
    treesWithRadius.sort((a, b) => b[0] - a[0]);

    return treesWithRadius;
}

const createTradeCheckMiniTrees = (): ScanningFunc => {
    const isInScanningRangeOfPlayer = (game: Game<DBObjectId>, sourcePlayer: Player<DBObjectId>, targetPlayer: Player<DBObjectId>) => {
        const starsOwnedOrInOrbit = listStarsOwnedByPlayer(game, sourcePlayer._id);
        const starsWithScanning = starsOwnedOrInOrbit.filter(s => !starDataService.isDeadStar(s));

        const targetPlayerStars = listStarsOwnedByPlayer(game, targetPlayer._id);

        // Group stars by their scanning range, since we need to build a tree for each group.
        const treesWithRadius = getScanningStarTrees(game, starsWithScanning);

        for (const targetStar of targetPlayerStars) {
            for (const tree of treesWithRadius) {
                if (tree[1].isWithinRadiusOfAny(targetStar.location, tree[0])) {
                    return true;
                }
            }
        }

        return false;
    }

    return isInScanningRangeOfPlayer;
}

const createTradeCheckNormal = (): ScanningFunc => {
    const isStarWithinScanningRangeOfStars = (game: Game<DBObjectId>, star: Star<DBObjectId>, stars: Star<DBObjectId>[]) => {
        // Go through all of the stars one by one and calculate
        // whether any one of them is within scanning range.
        for (let otherStar of stars) {
            if (otherStar.ownedByPlayerId == null) {
                continue;
            }

            // Use the effective scanning range of the other star to check if it can "see" the given star.
            let effectiveTechs = technologyService.getStarEffectiveTechnologyLevels(game, otherStar);
            let scanningRangeDistance = distanceService.getScanningDistance(game, effectiveTechs.scanning);
            let distance = starDistanceService.getDistanceBetweenStars(star, otherStar);

            if (distance <= scanningRangeDistance) {
                return true;
            }
        }

        return false;
    }

    const getPlayersWithinScanningRangeOfPlayer = (game: Game<DBObjectId>, players: Player<DBObjectId>[], player: Player<DBObjectId>)=> {
        let inRange = [player];
        let playerStars = listStarsOwnedByPlayer(game, player._id);

        for (let otherPlayer of players) {
            if (inRange.indexOf(otherPlayer) > -1) {
                continue;
            }

            let otherPlayerStars = listStarsOwnedByPlayer(game, otherPlayer._id);

            let isInRange = false;

            for (let s of otherPlayerStars) {
                if (isStarWithinScanningRangeOfStars(game, s, playerStars)) {
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

    const isInScanningRangeOfPlayer = (game: Game<DBObjectId>, sourcePlayer: Player<DBObjectId>, targetPlayer: Player<DBObjectId>) => {
        return getPlayersWithinScanningRangeOfPlayer(game, [targetPlayer], sourcePlayer)
            .find(p => p._id.toString() === targetPlayer._id.toString()) != null;
    }

    return isInScanningRangeOfPlayer;
}

const ITERATIONS = 10;

const runScanningOne = (game: Game<DBObjectId>, func: ScanningFunc, name: string) => {
    let total = 0;

    console.log(`Running scanning benchmark for ${name}. Game ${game._id} has ${game.galaxy.players.length} players and ${game.galaxy.stars.length} stars.`);

    for (let i = 0; i < ITERATIONS; i++) {
        for (const player1 of game.galaxy.players.filter(p => !p.defeated)) {
            for (const player2 of game.galaxy.players.filter(p => !p.defeated)) {
                if (player1._id.toString() === player2._id.toString()) {
                    continue;
                }

                const start = performance.now();
                const result = func(game, player1, player2);
                const end = performance.now();
                const delta = end - start;
                total += delta;

            }
        }
    }

    console.log(`${name}: Total time: ${total} ms`);
}

const createSanitizeKD = (): SanitizeFunc => {
    const _getPlayersWithOwnedOrInOrbitStars = (game: Game<DBObjectId>) => {
        const results = new Map<string, { player: Player<DBObjectId>, stars: Star<DBObjectId>[], inRange: Set<string> }>();
        game.galaxy.players
            .forEach(p => {
                const starsOwnedOrInOrbit = listStarsOwnedOrInOrbitByPlayers(game, [p._id]);
                const starsWithScanning = starsOwnedOrInOrbit.filter(s => !starDataService.isDeadStar(s));
                let wormHoleStars = starsOwnedOrInOrbit.filter(s => s.wormHoleToStarId)
                wormHoleStars.forEach(s => {
                    starsOwnedOrInOrbit.push(s, getById(game, s.wormHoleToStarId!))
                });
                results.set(p._id.toString(), {
                    player: p,
                    stars: starsWithScanning,
                    inRange: new Set<string>(starsOwnedOrInOrbit.map(s => s._id.toString()))
                });
            });
        return results;
    }

    const isStarAlwaysVisible = (star: Star<DBObjectId>) => {
        return star.isPulsar || star.specialistId === 10 // Trade port
    }

    const isStarWithinScanningRangeOfStarsByViewpoint = (game: Game<DBObjectId>, star: Star<DBObjectId>, scannedStarSet: Set<Star<DBObjectId>>) => {
        // Pulsars are considered to be always in scanning range.
        // Note: They are not visible until the game starts to prevent pre-teaming.
        if (isStarAlwaysVisible(star) && gameStateService.isStarted(game as any)) {
            return true;
        }

        if (scannedStarSet.has(star)) return true;

        return false;
    }

    const canLoop = (game: Game<DBObjectId>, carrier: Carrier<DBObjectId>) => {
        if (carrier.waypoints.length < 2 || carrier.isGift) {
            return false;
        }

        const effectiveTechs = technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);

        // Check whether the last waypoint is in range of the first waypoint.
        const firstWaypoint = carrier.waypoints[0];
        const lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1];

        const firstWaypointStar = getById(game, firstWaypoint.destination);
        const lastWaypointStar = getById(game, lastWaypoint.destination);

        if (firstWaypointStar == null || lastWaypointStar == null) {
            return false;
        }

        if (starDataService.isStarPairWormHole(firstWaypointStar, lastWaypointStar)) {
            return true;
        }

        const distanceBetweenStars = starDistanceService.getDistanceBetweenStars(firstWaypointStar, lastWaypointStar);
        const hyperspaceDistance = distanceService.getHyperspaceDistance(game, effectiveTechs.hyperspace);

        return distanceBetweenStars <= hyperspaceDistance
    }

    const _checkCarrierRouteByViewpoint = (game: Game<DBObjectId>, carrier: Carrier<DBObjectId>, player: { player: Player<DBObjectId>, stars: Star<DBObjectId>[], inRange: Set<string> }, scannedStarSet: Set<Star<DBObjectId>>) => {
        let startIndex = carrier.orbiting ? 0 : 1;
        for (let index = startIndex; index < carrier.waypoints.length; index++) {
            const waypoint = carrier.waypoints[index];
            if (player.inRange.has(waypoint.destination.toString())) continue;
            const waypointStar = getById(game, waypoint.destination);
            if (isStarWithinScanningRangeOfStarsByViewpoint(game, waypointStar, scannedStarSet)) {
                player.inRange.add(waypoint.destination.toString());
            } else {
                carrier.waypoints.splice(index);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = canLoop(game, carrier);
                }

                break;
            }
        }
    }

    const isObjectWithinScanningRangeOfStars = (object: MapObject, starTreesWithRadius: [number, KDTree][]) => {
        for (const starTreeWithRadius of starTreesWithRadius) {
            if (starTreeWithRadius[1].isWithinRadiusOfAny(object.location, starTreeWithRadius[0])) return true;
        }
        return false;
    }

    const isStarWithinScanningRangeOfStars = (game: Game<DBObjectId>, star: Star<DBObjectId>, starTreesWithRadius: [number, KDTree][]) => {
        // Pulsars are considered to be always in scanning range.
        // Note: They are not visible until the game starts to prevent pre-teaming.
        if (isStarAlwaysVisible(star) && gameStateService.isStarted(game as any)) {
            return true;
        }

        if (isObjectWithinScanningRangeOfStars(star, starTreesWithRadius)) return true;

        return false;
    }

    const _checkCarrierRoute = (game: Game<DBObjectId>, carrier: Carrier<DBObjectId>, player: { player: Player<DBObjectId>, stars: Star<DBObjectId>[], inRange: Set<string> }, treesWithRadius: [number, KDTree][]) => {
        let startIndex = carrier.orbiting ? 0 : 1;
        for (let index = startIndex; index < carrier.waypoints.length; index++) {
            const waypoint = carrier.waypoints[index];
            if (player.inRange.has(waypoint.destination.toString())) continue;
            const waypointStar = getById(game, waypoint.destination);

            let inScan = isStarWithinScanningRangeOfStars(game, waypointStar, treesWithRadius);
            if (inScan) {
                player.inRange.add(waypoint.destination.toString());
            } else {
                carrier.waypoints.splice(index);

                if (carrier.waypointsLooped) {
                    carrier.waypointsLooped = canLoop(game, carrier);
                }

                break;
            }
        }
    }

    const _getObjectsWithinScanningRangeOfStar = (game: Game<DBObjectId>, star: Star<DBObjectId>, kdTree: KDTree): number[] => {
        // If the star isn't owned then it cannot have a scanning range
        if (star.ownedByPlayerId == null) {
            return [];
        }

        // Calculate the scanning distance of the given star.
        let effectiveTechs = technologyService.getStarEffectiveTechnologyLevels(game, star);
        let scanningRangeDistance = distanceService.getScanningDistance(game, effectiveTechs.scanning);

        return kdTree.getWithinRadius(star, scanningRangeDistance);
    }

    const getStarsWithinScanningRangeOfStar = (game: Game<DBObjectId>, star: Star<DBObjectId>, kdTree: KDTree): MapObjectWithVisibility[] => {
        return _getObjectsWithinScanningRangeOfStar(game, star, kdTree).map(i => game.galaxy.stars[i]);
    }

    const getStarSetByScanningRange = (game: Game<DBObjectId>, players: Player<DBObjectId>[], kdTree: KDTree) => {
        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        const starsOwnedOrInOrbit = listStarsOwnedOrInOrbitByPlayers(game, players.map(p => p._id));
        const starsWithScanning = starsOwnedOrInOrbit.filter(s => !starDataService.isDeadStar(s));

        let starsInRange = new Set<Star<DBObjectId>>();

        for (const star of starsWithScanning) {
            getStarsWithinScanningRangeOfStar(game, star, kdTree).forEach(s => starsInRange.add(getById(game, s._id)));
        }
        kdTree.resetMarked();

        // If worm holes are present, then ensure that any owned star OR star in orbit
        // also has its paired star visible.
        starsOwnedOrInOrbit
            .filter(s => s.wormHoleToStarId)
            .map(s => {
                return {
                    source: s,
                    destination: getById(game, s.wormHoleToStarId!)
                };
            })
            .forEach(s => starsInRange.add(s.destination));

        return starsInRange;
    }

    const sanitiseAllCarrierWaypointsByScanningRange = (game: Game<DBObjectId>) => {
        const players = _getPlayersWithOwnedOrInOrbitStars(game);

        const playerCarrierMap = new Map<Player<DBObjectId>, Carrier<DBObjectId>[]>();
        let remaining = game.galaxy.carriers;

        for (const player of players.values()) {
            const playerCarriers: Carrier<DBObjectId>[] = [];
            const otherCarriers: Carrier<DBObjectId>[] = [];

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
                if (!kdTree) kdTree = new KDTree(distanceService, game.galaxy.stars);

                const scannedStarSet = getStarSetByScanningRange(game, [player.player], kdTree);
                playerCarrierMap.get(player.player)!.forEach(c => _checkCarrierRouteByViewpoint(game, c, player, scannedStarSet));
            } else {
                const treesWithRadius = getScanningStarTrees(game, player.stars);
                playerCarrierMap.get(player.player)!.forEach(c => _checkCarrierRoute(game, c, player, treesWithRadius));
            }
        }
    }

    return sanitiseAllCarrierWaypointsByScanningRange;
}

const runScanningBenchmark = async (container: DependencyContainer, gameId: DBObjectId) => {
    const game = await container.gameService.getByIdAll(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    runScanningOne(game, createTradeCheckMiniTrees(), "Mini trees");
    runScanningOne(game, createTradeCheckNormal(), "Normal");
}

const runSanitizeOne = (game: Game<DBObjectId>, func: SanitizeFunc, name: string) => {
    let total = 0;

    console.log(`Running sanitize benchmark for ${name}. Game ${game._id} has ${game.galaxy.players.length} players and ${game.galaxy.stars.length} stars.`);

    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        func(game);
        const end = performance.now();
        const delta = end - start;
        total += delta;
    }

    console.log(`${name}: Total time: ${total} ms`);
}

const runSanitizeBenchmark = async (container: DependencyContainer, gameId: DBObjectId) => {
    const game = await container.gameService.getByIdAll(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    runSanitizeOne(game, createSanitizeKD(), "Sanitize KD Tree");
}

const GAME_IDS = [
    objectIdFromString("69725b6faac371b026899402"), // THE 64 player game
    objectIdFromString("692467a30034b675f44010de"), // 1v1 late stage
    objectIdFromString("698f7966011a8a58a7e4a280"), // 1v1 early stage
    objectIdFromString("697ce9fa53ffda392441dd6c"), // 10 player early stage
    objectIdFromString("68bd433f096363f09c666758"), // 32 player lage stage
];

const benchmark = async () => {
    const log = logger("Benchmark");

    const mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1,
    });

    const container = containerLoader(config, serverStub, log);

    for (const gameId of GAME_IDS) {
        // await runScanningBenchmark(container, gameId);
        await runSanitizeBenchmark(container, gameId);
    }
}

benchmark();