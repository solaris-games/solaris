import GameHelper from './gameHelper'

class WaypointHelper {
    calculateShortestRoute (game, carrier, sourceStarId, destinStarId) {
        const player = GameHelper.getUserPlayer(game)
        const hyperspaceDistance = GameHelper.getHyperspaceDistance(game, player, carrier)

        let graph = game.galaxy.stars.map(s => {
            return {
                ...s,
                cost: 0,
                costFromStart: 0,
                neighbors: null,
                parent: null
            }
        })

        const getNeighbors = (node) => graph
            .filter(s => s._id !== node._id)
            .filter(s => GameHelper.getDistanceBetweenLocations(s.location, node.location) <= hyperspaceDistance || GameHelper.isStarPairWormHole(s, node))

        let start = graph.find(s => s._id === sourceStarId)
        let end = graph.find(s => s._id === destinStarId)

        let openSet = [start]
        let closedSet = []

        while (openSet.length) {
            // This sort makes us look at the nodes where we can get the quickest first.
            // This guarantees that all nodes that already have a calculated route (which may not be the quickest)
            // will have their quickest route found. This in turn guarantees that the final fastest route can be found.

            // Note from Tristanvds: Unfortunately we cannot also take into account a sorting system where we look at the
            // distance to the end star. This kind of sorting system would favour going in a direct line towards that star
            // instead of going for wormholes. Therefore we have to take a (computationally) slower approach by sorting
            // based on the distance from the start.
            openSet.sort((a, b) => a.costFromStart - b.costFromStart); // Ensure we start with the node that has the lowest total cost
            const current = openSet.shift();

            closedSet.push(current); // We're evaluating, so might as well close it.
            
            // If we've found the end, return the reversed path.
            if (current._id === end._id) {
                let temp = current;
        
                const path = [];

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

            for (let neighbor of current.neighbors) {
                // If the neighbor has already been checked, then no need to check again.
                const isClosed = closedSet.find(n => n._id === neighbor._id) != null;

                if (!isClosed) {
                    neighbor.cost = GameHelper.getActualTicksBetweenLocations(game, player, carrier, current, neighbor, hyperspaceDistance)

                    // Calculate what the next cost will be, we don't want to check
                    // any paths that lead us to more cost.
                    let nextCost = current.costFromStart + neighbor.cost;

                    // But if we haven't tried this path, enqueue it.
                    const isOpen = openSet.find(n => n._id === neighbor._id) != null;

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

export default new WaypointHelper()
