const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Heap = require('qheap');
const { minBy, minElementBy } = require('../utils.js')
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

        // Star systems with computed score based on distance to enemy
        const starScores = this._computeStarScores(game, player, playerStars, starGraph);

        // Graph of carrier movements for logistics
        const logisticsGraph = this._createLogisticsGraph(starGraph, starScores);
        
        const carrierLoops = this._computeCarrierLoopsFromGraph(logisticsGraph, playerStars);

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

    _computeStarScores(game, player, playerStars, starGraph) {
        const enemyStars = game.galaxy.stars.filter(star => star.ownedByPlayerId && !star.ownedByPlayerId.equals(player._id));

        const scoreMap = new Map();

        for (let [ starIndex, _ ] of starGraph) {
            const star = playerStars[starIndex];
            const distanceToClosestEnemyStar = minBy(es => this.distanceService.getDistanceBetweenLocations(es.location, star.location), enemyStars);
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

    _createLogisticsGraph(starGraph, starScores) {
        const starQueue = this._createStarQueue(starScores);
        const logisticsGraph = new Map();
        
        while (starQueue.length != 0) {
            const highestScoredItem = starQueue.dequeue();
            const nextConnection = this._findNextConnection(logisticsGraph, starGraph, starScores, highestScoredItem.starIndex);
            if (nextConnection) {
                const newScore = highestScoredItem.score * 0.5;
                starScores.set(highestScoredItem.starIndex, newScore);
                const connections = logisticsGraph.get(nextConnection.from) || new Set();
                connections.add(nextConnection.to);
                logisticsGraph.set(nextConnection.from, connections);
            }
        }

        return logisticsGraph;
    }

    _findNextConnection(logisticsGraph, starGraph, starScores, starIndex) {
        const candidates = new Set();

        this._findConnectables(logisticsGraph, starGraph, starIndex, candidates, new Set());

        return minElementBy((connection) => starScores.get(connection.to), candidates)
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
