import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {Carrier} from "./types/Carrier";
import { DistanceService } from 'solaris-common';
import StarService from "./star";
import { Star } from "./types/Star";
import WaypointService from "./waypoint";
import { StarDataService } from "solaris-common";

// Copied and adapted from WaypointHelper in the frontend
// Should probably be put into a shared library at some point

interface Node {
    cost: number;
    costFromStart: number;
    neighbors: Node[] | null;
    parent: Node | null;
    star: Star;
}

export default class PathfindingService {
    distanceService: DistanceService;
    starService: StarService;
    waypointService: WaypointService;
    starDataService: StarDataService;

    constructor(distanceService: DistanceService, starService: StarService, waypointService: WaypointService, starDataService: StarDataService) {
        this.distanceService = distanceService;
        this.starService = starService;
        this.waypointService = waypointService;
        this.starDataService = starDataService;
    }

    calculateShortestRoute(game: Game, player: Player, carrier: Carrier, sourceStarId: string, destinStarId: string): Node[] {
        const hyperspaceDistance = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);

        const graph: Node[] = game.galaxy.stars.map(star => {
            return {
                star,
                cost: 0,
                costFromStart: 0,
                neighbors: null,
                parent: null
            }
        })

        const getNeighbors = (node: Node) => graph
            .filter(s => s.star._id.toString() !== node.star._id.toString())
            .filter(s => this.distanceService.getDistanceBetweenLocations(s.star.location, node.star.location) <= hyperspaceDistance || this.starDataService.isStarPairWormHole(s.star, node.star));

        const start = graph.find(s => s.star._id.toString() === sourceStarId)!;
        const end = graph.find(s => s.star._id.toString() === destinStarId)!;

        const openSet: Node[] = [start]
        const closedSet: Node[] = []

        while (openSet.length) {
            // This sort makes us look at the nodes where we can get the quickest first.
            // This guarantees that all nodes that already have a calculated route (which may not be the quickest)
            // will have their quickest route found. This in turn guarantees that the final fastest route can be found.

            // Note from Tristanvds: Unfortunately we cannot also take into account a sorting system where we look at the
            // distance to the end star. This kind of sorting system would favour going in a direct line towards that star
            // instead of going for wormholes. Therefore we have to take a (computationally) slower approach by sorting
            // based on the distance from the start.
            openSet.sort((a, b) => a.costFromStart - b.costFromStart); // Ensure we start with the node that has the lowest total cost
            const current = openSet.shift()!;

            closedSet.push(current); // We're evaluating, so might as well close it.

            // If we've found the end, return the reversed path.
            if (current.star._id.toString() === end.star._id.toString()) {
                let temp = current;

                const path: Node[] = [];

                path.push(temp);

                while (temp.parent) {
                    path.push(temp.parent);
                    temp = temp.parent;
                }

                return path.reverse();
            }

            // Dynamically load neighbors as its more efficient
            if (!current.neighbors) {
                current.neighbors = getNeighbors(current);
            }

            for (const neighbor of current.neighbors) {
                // If the neighbor has already been checked, then no need to check again.
                const isClosed = closedSet.find(n => n.star._id.toString() === neighbor.star._id.toString()) != null;

                if (!isClosed) {
                    neighbor.cost = this.waypointService.calculateTicksForDistance(game, player, carrier, current.star, neighbor.star);

                    // Calculate what the next cost will be, we don't want to check
                    // any paths that lead us to more cost.
                    const nextCost = current.costFromStart + neighbor.cost;

                    // But if we haven't tried this path, enqueue it.
                    const isOpen = openSet.find(n => n.star._id.toString() === neighbor.star._id.toString()) != null;

                    if (!isOpen) {
                        openSet.push(neighbor);
                    } else if (nextCost >= neighbor.costFromStart) {
                        continue;
                    }

                    // Calculate the final cost from the start to the end
                    // while updating the path taken.
                    neighbor.costFromStart = nextCost
                    neighbor.parent = current
                }
            }
        }

        return []
    }
}