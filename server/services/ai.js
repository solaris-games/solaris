const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Delaunator = require('delaunator');
const Heap = require('qheap');
const { intersectionOfSets, maxBy, minBy } = require('../utils.js')
const OrderService = require('./order.js');

module.exports = class AIService {

    constructor(starUpgradeService, carrierService, starService, distanceService, orderService) {
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.orderService = orderService;
    }

    async play(game, player) {
        if (!player.defeated) {
            throw new Error('The player is not under AI control.');
        }

        // Considering the growing complexity of AI logic, 
        // it's better to catch any possible errors and have the game continue with disfunctional AI than to break the game tick logic.
        try {
            if (!player.ai) {
                await this._setupAi(game, player);
                player.ai = true;
            }
            await this.orderService.processOrdersForPlayer(game, player);
        } catch (e) {
            console.error(e);
        }

        // Two separate try statements: If the "advanced" AI logic crashes, at least we can keep upgrading stars
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

    async _setupAi(game, player) {
        player.researchingNext = 'random'; // Set up the AI for random research.
        
        // Make sure all stars are marked as not ignored - This is so the AI can bulk upgrade them.
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            this.starService.resetIgnoreBulkUpgradeStatuses(star);
        }

        // Clear out any carriers that have looped waypoints.
        this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);

        const starGraph = this._computeStarGraph(game, player, playerStars);

        // Border star systems with computed score based on distance to enemy
        const borderStarQueue = this._computeBorderStarQueue(game, borderVertices, playerStars, player);

        // Graph of carrier movements for logistics
        const logisticsGraph = this._createLogisticsGraph(game, player, vertexIndexToConnectedVertexIndices, borderVertices, borderStarQueue, playerStars);
        
        const carrierLoops = this._computeCarrierLoopsFromGraph(logisticsGraph, playerStars);

        console.log(carrierLoops);

        const logisticsOrders = this._createCarrierOrders(carrierLoops);

        player.scheduledOrders = logisticsOrders;
    }

    _computeStarGraph(game, player, playerStars) {
        const hyperspaceRange = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);

        const starGraph = new Map();

        playerStars.forEach((star, starIdx) => {
            const reachableStars = new Set();

            playerStars.forEach((otherStar, otherStarIdx) => {
                if (this.distanceService.getDistanceBetweenLocations(star.location, otherStar.location) <= hyperspaceRange) {
                    reachableStars.add(otherStarIdx);
                }
            });

            starGraph.set(starIdx, reachableStars);
        });

        return starGraph;
    }

    _createCarrierOrders(carrierLoops) {
        return carrierLoops.map(loop => {
            return {
                orderType: OrderService.ORDER_BUILD_AND_SEND_CARRIER,
                data: {
                    waypoints: [ 
                        {
                            source: loop.from._id,
                            destination: loop.to._id,
                            action: "collectAll",
                            actionShips: 0,
                            delayTicks: 0
                        }, 
                        {
                            source: loop.to._id,
                            destination: loop.from._id,
                            action: "dropAll",
                            actionShips: 0,
                            delayTicks: 0
                        }
                    ],
                    loop: true
                }
            }
        });
    }

    _computeCarrierLoopsFromGraph(logisticsGraph, playerStars) {
        const loops = new Array(logisticsGraph.size);

        for (let [ start, connected ] of logisticsGraph) {
            for (let end of connected) {
                loops.push({
                    from: playerStars[start],
                    to: playerStars[end]
                })
            }
        }

        return loops;
    }

    _computeBorderStarQueue(game, borderVertices, playerStars, player) {
        const highestHyperspaceLevel = maxBy(player => player.research.hyperspace.level, game.galaxy.players);
        const highestHyperspaceDistance = this.distanceService.getHyperspaceDistance(game, highestHyperspaceLevel);

        const enemyStars = game.galaxy.stars.filter(star => star.ownedByPlayerId && !star.ownedByPlayerId.equals(player._id));
        const borderStarQueue = new Heap({
            comparBefore: (b1, b2) => b1.score < b2.score,
            compar: (b1, b2) => b1.score - b2.score
        });

        for (let borderVertex of borderVertices) {
            const borderStar = playerStars[borderVertex];
            const distanceToClosesEnemyStar = minBy(es => this.distanceService.getDistanceBetweenLocations(es.location, borderStar.location), enemyStars);
            const distanceRelative = distanceToClosesEnemyStar / highestHyperspaceDistance;
            // if the star is far from any enemy, there's no need to fortify it now.
            if (distanceRelative < 2) {
                // give highest priority to stars closest to the enemy
                const score = 1 / distanceRelative;
                borderStarQueue.insert({
                    score,
                    vertex: borderVertex
                })
            }
        }

        return borderStarQueue;
    }

    _createLogisticsGraph(game, player, vertexIndexToConnectedVertexIndices, borderVertices, borderStarQueue, playerStars) {
        const unmarkedVertices = new Set();
        for (let vertexIndex of vertexIndexToConnectedVertexIndices) {
            if (!borderVertices.has(vertexIndex)) {
                unmarkedVertices.add(vertexIndex);
            }
        }

        const playerHyperspaceRange = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);

        const logisticsGraph = new Map();
        while (unmarkedVertices.size != 0 && borderStarQueue.length != 0) {
            const item = borderStarQueue.dequeue();
            const borderVertex = item.vertex;
            const oldScore = item.score;
            const nextConnection = this._findNextLogisticsConnection(vertexIndexToConnectedVertexIndices, logisticsGraph, unmarkedVertices, playerStars, playerHyperspaceRange, borderVertex);
            if (nextConnection) {
                const fromConnections = logisticsGraph.get(nextConnection.from) || new Set();
                fromConnections.add(nextConnection.to);
                logisticsGraph.set(nextConnection.from, fromConnections);
                borderStarQueue.insert({
                    score: oldScore * 0.5,
                    vertex: borderVertex
                });
            }
        }

        return logisticsGraph;
    }

    _findNextLogisticsConnection(vertexIndexToConnectedVertexIndices, logisticsGraph, unmarkedVertices, playerStars, playerHyperspaceRange, startingVertex) {
        const possibleConnections = vertexIndexToConnectedVertexIndices.get(startingVertex);
        const startingStar = playerStars[startingVertex];
        const direct = Array.from(possibleConnections).filter(v => this.distanceService.getDistanceBetweenLocations(playerStars[v].location, startingStar.location) <= playerHyperspaceRange).find(v => unmarkedVertices.has(v));
        if (direct) {
            unmarkedVertices.delete(direct);
            return {
                from: startingVertex,
                to: direct
            };
        }
        const connected = logisticsGraph.get(startingVertex);
        if (connected) {
            for (let c of connected) {
                const newConnection = this._findNextLogisticsConnection(vertexIndexToConnectedVertexIndices, logisticsGraph, unmarkedVertices, playerStars, playerHyperspaceRange, c);
                if (newConnection) {
                    return newConnection;
                }
            }
        }
        return null;
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
