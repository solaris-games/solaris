import ScanningService from "../services/scanning";
import StarService from "../services/star";
import {
    Game,
    Star,
    GameTypeService,
    Player,
    StarDataService,
    TechnologyService,
    DistanceService, StarDistanceService
} from "@solaris-common";
import {KDTree} from "../utils/kdTree";
import SpecialistService from "../services/specialist";

const { performance } = require('perf_hooks');

/*
                const scannedStarSet = this.scanningService.getStarSetByScanningRange(game, [player.player], kdTree);
                playerCarrierMap.get(player.player)!.forEach(c => this._checkCarrierRouteByViewpoint(game, c, player, scannedStarSet));
            } else {
                const treesWithRadius = this.scanningService.getScanningStarTrees(game, player.stars);
                playerCarrierMap.get(player.player)!.forEach(c => this._checkCarrierRoute(game, c, player, treesWithRadius));
            }
 */

/*

 */

const listStarsOwnedByPlayer = (game: Game<string>, playerId: string) => {
    return game.galaxy.stars.filter((s) => playerId === s.ownedByPlayerId);
}

const starDataService = new StarDataService();
const gameTypeService = new GameTypeService();
const technologyService = new TechnologyService(new SpecialistService(gameTypeService), gameTypeService);
const distanceService = new DistanceService();
const starDistanceService = new StarDistanceService(distanceService);

const createTradeCheckMiniTrees = () => {
    const getScanningStarTrees = (game: Game<string>, starsWithScanning: Star<string>[]) => {
        const starGroups = new Map<number, Star<string>[]>();
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

    const isInScanningRangeOfPlayer = (game: Game<string>, sourcePlayer: Player<string>, targetPlayer: Player<string>) => {
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

const createTradeCheckNormal = () => {
    const isStarWithinScanningRangeOfStars = (game: Game<string>, star: Star<string>, stars: Star<string>[]) => {
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

    const getPlayersWithinScanningRangeOfPlayer = (game: Game<string>, players: Player<string>[], player: Player<string>) {
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

    const isInScanningRangeOfPlayer = (game: Game<string>, sourcePlayer: Player<string>, targetPlayer: Player<string>) => {
        return getPlayersWithinScanningRangeOfPlayer(game, [targetPlayer], sourcePlayer)
            .find(p => p._id.toString() === targetPlayer._id.toString()) != null;
    }

    return isInScanningRangeOfPlayer;
}


