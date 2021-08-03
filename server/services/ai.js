const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Heap = require('qheap');
const { getOrInsert, minBy, minElementBy } = require('../utils.js')
const AIOrderService = require('./aiOrder.js');

module.exports = class AIService {

    constructor(starUpgradeService, carrierService, starService, distanceService, aiOrderService) {
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.aiOrderService = aiOrderService;
    }

    async play(game, player) {
        if (!player.defeated) {
            throw new Error('The player is not under AI control.');
        }

        await this._doAdvancedLogic(game, player);

        await this._doBasicLogic(game, player);
    }

    async _doBasicLogic(game, player) {
        try {
            let isFirstTick = game.state.tick % game.settings.galaxy.productionTicks === 1;
            let isLastTick = game.state.tick % game.settings.galaxy.productionTicks === game.settings.galaxy.productionTicks - 1;
    
            if (isFirstTick) {
                await this._playFirstTick(game, player);
            } else if (isLastTick) {
                await this._playLastTick(game, player);
            }
        } catch (e) {
            console.error(e);
        }

        // TODO: Not sure if this is an issue but there was an occassion during debugging
        // where the player credits amount was less than 0, I assume its the AI spending too much somehow
        // so adding this here just in case but need to investigate.
        player.credits = Math.max(0, player.credits);
    }

    async _doAdvancedLogic(game, player) {
        // Considering the growing complexity of AI logic, 
        // it's better to catch any possible errors and have the game continue with disfunctional AI than to break the game tick logic.
        try {
            if (!player.ai) {
                await this._setupAi(game, player);
                player.ai = true;
            }
            await this.aiOrderService.processOrdersForPlayer(game, player);
        } catch (e) {
            console.error(e);
        }
    }

    async _setupAi(game, player) {
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        const starGraph = this._computeStarGraph(game, player, playerStars);

        // Star systems with computed score based on distance to enemy
        const starScores = this._computeStarScores(game, player, playerStars, starGraph);

        // Graph of carrier movements for logistics
        const logisticsGraph = this._createLogisticsGraph(starGraph, starScores, playerStars);

        // Graph of current carrier loops
        const existingGraph = this._computeExistingLogisticsGraph(game, player);

        player.scheduledOrders = null; //Reset currently scheduled orders and begin anew

        const logisticsOrders = this._createCarrierOrders(logisticsGraph, existingGraph);

        player.scheduledOrders = logisticsOrders;
    }

    _computeExistingLogisticsGraph(game, player) {
        const loopedCarriers = this.carrierService.listCarriersOwnedByPlayer(game, player._id).filter(c => c.waypointsLooped && c.waypoints && c.waypoints.length === 2);

        const graph = new Map();

        for (let carrier of loopedCarriers) {
            const fromWaypoint = carrier.waypoints.filter(waypoint => waypoint.action === "collectAll");
            const toWaypoint = carrier.waypoints.filter(waypoint => waypoint.action === "dropAll");
            if (fromWaypoint && toWaypoint) {
                const from = fromWaypoint.destination.toString();
                const to = toWaypoint.destination.toString();
                const destinations = getOrInsert(graph, from, () => new Set());
                destinations.add(to);
            }
        }

        return graph;
    }

    _computeStarGraph(game, player, playerStars) {
        const hyperspaceRange = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);
        const hyperspaceRangeSquared = hyperspaceRange * hyperspaceRange;

        const starGraph = new Map();

        playerStars.forEach((star, starIdx) => {
            const reachableStars = new Set();

            playerStars.forEach((otherStar, otherStarIdx) => {
                if (starIdx !== otherStarIdx && this.distanceService.getDistanceSquaredBetweenLocations(star.location, otherStar.location) <= hyperspaceRangeSquared) {
                    reachableStars.add(otherStarIdx);
                }
            });

            starGraph.set(starIdx, reachableStars);
        });

        return starGraph;
    }

    _createCarrierOrders(logisticsGraph, existingGraph) {
        /*return [carrierLoops.map(loop => {
            return {
                orderType: AIOrderService.ORDER_BUILD_AND_SEND_CARRIER,
                data: {
                    waypoints: [ 
                        {
                            source: loop.from._id,
                            destination: loop.to._id,
                            action: "dropAll",
                            actionShips: 0,
                            delayTicks: 0
                        }, 
                        {
                            source: loop.to._id,
                            destination: loop.from._id,
                            action: "collectAll",
                            actionShips: 0,
                            delayTicks: 0
                        }
                    ],
                    loop: true
                },
                retryPolicy: "retry"
            }
        });]*/
        return [];
    }

    _computeStarScores(game, player, playerStars, starGraph) {
        const enemyStars = game.galaxy.stars.filter(star => star.ownedByPlayerId && !star.ownedByPlayerId.equals(player._id));

        const scoreMap = new Map();

        for (let [ starIndex, _ ] of starGraph) {
            const star = playerStars[starIndex];
            const distanceToClosestEnemyStar = minBy(es => this.distanceService.getDistanceSquaredBetweenLocations(es.location, star.location), enemyStars);
            const score = 100 / distanceToClosestEnemyStar;

            scoreMap.set(starIndex, score);
        }

        return scoreMap;
    }

    _createStarQueue(scoreMap) {
        const queue = new Heap({
            comparBefore: (b1, b2) => b1.score < b2.score,
            compar: (b1, b2) => b1.score - b2.score
        });

        for (let [ starIndex, score ] of scoreMap) {
            queue.insert({
                starIndex,
                score
            })    
        }

        return queue;
    }

    _createLogisticsGraph(starGraph, starScores, playerStars) {
        const starQueue = this._createStarQueue(starScores);
        const logisticsGraph = new Map();
        
        while (starQueue.length != 0) {
            const highestScoredItem = starQueue.dequeue();
            const nextConnection = this._findNextConnection(logisticsGraph, starGraph, starScores, highestScoredItem.starIndex);
            if (nextConnection) {
                const newScore = highestScoredItem.score * 0.5;
                starScores.set(highestScoredItem.starIndex, newScore);
                const from = playerStars[nextConnection.from]._id.toString();
                const to = playerStars[nextConnection.to]._id.toString();
                const connections = getOrInsert(logisticsGraph, from, () => new Set());
                connections.add(to);
            }
        }

        return logisticsGraph;
    }

    _findNextConnection(logisticsGraph, starGraph, starScores, starIndex) {
        const candidates = new Set();

        this._findConnectables(logisticsGraph, starGraph, starIndex, candidates, new Set());

        const starScore = starScores.get(starIndex);
        const lowerConnections = Array.from(candidates).filter(c => starScores.get(c.to) < starScore);
        return minElementBy((connection) => starScores.get(connection.to), lowerConnections)
    }

    _findConnectables(logisticsGraph, starGraph, start, connectables, visited) {
        const inRange = starGraph.get(start);
        const connected = logisticsGraph.get(start);
        visited.add(start);

        for (let c of inRange) {
            if (visited.has(c)) {
                continue;
            } else {
                if (connected && connected.has(c)) {
                    this._findConnectables(logisticsGraph, starGraph, c, connectables, visited);
                } else {
                    connectables.add({
                        from: start,
                        to: c
                    });
                }
            }            
        }
    }

    async _playFirstTick(game, player) {
        if (!player.credits || player.credits < 0) {
            return
        }

        // On the first tick after production:
        // 1. Bulk upgrade X% of credits to ind and sci.
        let creditsToSpendSci = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE);
        let creditsToSpendInd = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE);

        if (creditsToSpendSci) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'science', creditsToSpendSci, false);
        }

        if (creditsToSpendInd) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'industry', creditsToSpendInd, false);
        }
    }

    async _playLastTick(game, player) {
        if (!player.credits || player.credits <= 0) {
            return
        }

        // On the last tick of the cycle:
        // 1. Spend remaining credits upgrading economy.
        let creditsToSpendEco = Math.floor(player.credits / 100 * LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE);

        if (creditsToSpendEco) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'economy', creditsToSpendEco, false);
        }
    }

};
