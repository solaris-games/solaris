import {
    Game,
    Star,
    GameTypeService,
    Player,
    StarDataService,
    TechnologyService,
    DistanceService, StarDistanceService
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

const { performance } = require('perf_hooks');

const listStarsOwnedByPlayer = (game: Game<DBObjectId>, playerId: DBObjectId) => {
    return game.galaxy.stars.filter((s) => playerId.toString() === s.ownedByPlayerId?.toString());
}

const starDataService = new StarDataService();
const gameTypeService = new GameTypeService();
const technologyService = new TechnologyService(new SpecialistService(gameTypeService), gameTypeService);
const distanceService = new DistanceService();
const starDistanceService = new StarDistanceService(distanceService);

type ScanningFunc = (game: Game<DBObjectId>, sourcePlayer: Player<DBObjectId>, targetPlayer: Player<DBObjectId>) => boolean;

const createTradeCheckMiniTrees = (): ScanningFunc => {
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

const runOne = (game: Game<DBObjectId>, func: ScanningFunc, name: string) => {
    let total = 0;

    console.log(`Running benchmark for ${name}. Game has ${game.galaxy.players.length} players and ${game.galaxy.stars.length} stars.`);

    for (let i = 0; i < ITERATIONS; i++) {
        for (const player1 of game.galaxy.players) {
            for (const player2 of game.galaxy.players) {
                if (player1._id.toString() === player2._id.toString()) {
                    continue;
                }

                const start = performance.now();
                const result = func(game, player1, player2);
                const end = performance.now();
                const delta = end - start;
                total += delta;

                //console.log(`${name}: Iteration ${i}, ${player1.alias} -> ${player2.alias}: ${result}, time: ${delta} ms`);
            }
        }
    }

    console.log(`${name}: Total time: ${total} ms`);
}

const runBenchmark = async (container: DependencyContainer, gameId: DBObjectId) => {
    const game = await container.gameService.getByIdAll(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    runOne(game, createTradeCheckMiniTrees(), "Mini trees");
    runOne(game, createTradeCheckNormal(), "Normal");
}

const GAME_IDS = [
    objectIdFromString("69725b6faac371b026899402"),
];

const benchmark = async () => {
    const log = logger("Benchmark");

    const mongo = await mongooseLoader(config, {
        syncIndexes: true,
        poolSize: 1,
    });

    const container = containerLoader(config, serverStub, log);

    for (const gameId of GAME_IDS) {
        await runBenchmark(container, gameId);
    }
}

benchmark();