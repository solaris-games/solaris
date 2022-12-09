import GameHelper from './gameHelper'

class WaypointHelper {
    calculateShortestRoute (game, carrier, sourceStarId, destinStarId) {
        const player = GameHelper.getUserPlayer(game)
        const hyperspaceDistance = GameHelper.getHyperspaceDistance(game, player, carrier)

        let graph = game.galaxy.stars.map(s => {
            return {
                ...s,
                cost: 0,
                totalCost: 0,
                costFromStart: 0,
                estimatedCostToEnd: 0,
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
            openSet.sort((a, b) => a.totalCost - b.totalCost); // Ensure we start with the node that has the lowest total cost
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

                    // Calculate the running cost and estimated cost to the end. Ideally we want
                    // to head in the direction of the end goal using manhattan distance.
                    neighbor.totalCost = nextCost
                    // neighbor.estimatedCostToEnd = GameHelper.getActualTicksBetweenLocations(game, player, carrier, neighbor, end, hyperspaceDistance)
                    // neighbor.estimatedCostToEnd = GameHelper.getTicksBetweenLocations(game, carrier, [neighbor, end])
                    // neighbor.totalCost = neighbor.costFromStart + neighbor.estimatedCostToEnd
                    neighbor.parent = current
                }
            }
        }

        return []
    }
}

export default new WaypointHelper()
