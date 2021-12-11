const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Heap = require('qheap');
const { getOrInsert, minBy, minElementBy, reverseSort } = require('../utils.js')

const DEFEND_STAR_ACTION = 'DEFEND_STAR';
const CLAIM_STAR_ACTION = 'CLAIM_STAR';
const REINFORCE_STAR_ACTION = 'REINFORCE_STAR';

module.exports = class AIService {
    constructor(starUpgradeService, carrierService, starService, distanceService, waypointService, combatService) {
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.waypointService = waypointService;
        this.combatService = combatService;
    }

    async play(game, player) {
        if (!player.defeated) {
            throw new Error('The player is not under AI control.');
        }

        const isFirstTick = game.state.tick % game.settings.galaxy.productionTicks === 1;
        const isLastTick = game.state.tick % game.settings.galaxy.productionTicks === game.settings.galaxy.productionTicks - 1;

        await this._doAdvancedLogic(game, player, isFirstTick, isLastTick);

        await this._doBasicLogic(game, player, isFirstTick, isLastTick);
    }

    async _doBasicLogic(game, player, isFirstTick, isLastTick) {
        try {
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

    async _doAdvancedLogic(game, player, isFirstTick, isLastTick) {
        // Considering the growing complexity of AI logic, 
        // it's better to catch any possible errors and have the game continue with disfunctional AI than to break the game tick logic.
        try {
            if (isFirstTick || !player.ai) {
                this._setupAi(game, player);
                player.ai = true;
            }
            this._updateState(game, player);
            const context = this._createContext(game, player);
            const orders = this._gatherOrders(game, player, context);
            const assignments = this._gatherAssignments(game, player, context);
            await this._evaluateOrders(game, player, context, orders, assignments);
            player.markModified('aiState');
            game.save();
        } catch (e) {
            console.error(e);
        }
    }

    _setupAi(game, player) {
        player.aiState = {
            knownAttacks: [],
            startedInvasions: []
        }
    }

    _updateState(game, player) {
        if (!player.aiState) {
            return;
        }

        if (player.aiState.knownAttacks) {
            player.aiState.knownAttacks = player.aiState.knownAttacks.filter(attack => attack.arrivalTick > game.state.tick);
        }

        if (player.aiState.startedInvasions) {
            player.aiState.startedInvasions = player.aiState.startedInvasions.filter(invasion => invasion.arrivalTick > game.state.tick);
        }
    }

    _createContext(game, player) {
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        const starsById = new Map()

        for (const star of game.galaxy.stars) {
            starsById.set(star._id.toString(), star);
        }

        const reachableStars = this._computeStarGraph(game, player, playerStars, game.galaxy.stars);
        const reachablePlayerStars = this._computeStarGraph(game, player, playerStars, playerStars);
        const borderStars = [];
        for (const [from, reachables] of reachableStars) {
            for (const reachableId of reachables) {
                const reachable = starsById.get(reachableId);
                if (!reachable.ownedByPlayerId) {
                    borderStars.push(from);
                }
            }
        }

        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        const carriersOrbiting = new Map();
        for (const carrier of playerCarriers) {
            if ((!carrier.waypoints || carrier.waypoints.length === 0) && carrier.orbiting) {
                const carriersInOrbit = getOrInsert(carriersOrbiting, carrier.orbiting.toString(), () => []);
                carriersInOrbit.push(carrier);
            }
        }

        const carriersById = new Map();
        for (const carrier of game.galaxy.carriers) {
            carriersById.set(carrier._id.toString(), carrier);
        }

        return {
            playerStars,
            playerCarriers,
            starsById,
            reachableStars,
            reachablePlayerStars,
            borderStars,
            carriersOrbiting,
            carriersById
        }
    }

    async _evaluateOrders(game, player, context, orders, assignments) {
        const sorter = (o1, o2) => {
            const categoryPriority = this.priorityFromOrderCategory(o1.type) - this.priorityFromOrderCategory(o2.type);
            if (categoryPriority !== 0) {
                return categoryPriority;
            } else {
                return o1.score - o2.score;
            }
        };
        orders.sort(reverseSort(sorter));

        const newKnownAttacks = [];

        // For now, process orders in order of importance and try to find the best assignment possible for each order.
        // Later, a different scoring process could be used to maximize overall scores.

        for (const order of orders) {
            if (order.type === DEFEND_STAR_ACTION) {
                // Later, take weapons level and specialists into account
                const attackData = this._getAttackData(game, player, context, order.star, order.ticksUntil) || this._createDefaultAttackData();
                const defendingStar = context.starsById.get(order.star);
                const requiredAdditionallyForDefense = this._calculateRequiredShipsForDefense(game, player, context, attackData, order.incomingCarriers, defendingStar);
                if (requiredAdditionallyForDefense === 0) {
                    // We're going to be fine
                    newKnownAttacks.push(attackData);
                } else {
                    // TODO: Find assignments for reinforcement
                }
            }
        }

        player.aiState.knownAttacks = newKnownAttacks;
    }

    _createDefaultAttackData(game, starId, ticksUntil) {
        const arrivalTick = game.state.tick + ticksUntil;

        return {
            starId,
            arrivalTick,
            carriersOnTheWay: []
        }
    }

    _calculateRequiredShipsForDefense(game, player, context, attackData, attackingCarriers, defendingStar) {
        const attackerIds = new Set();
        const attackers = [];

        for (const attackingCarrier of attackingCarriers) {
            const attacker = game.players.find(player => player._id.toString() === attackingCarrier.ownedByPlayerId.toString());
            const attackerId = attacker._id.toString();
            if (!attackerIds.has(attackerId)) {
                attackerIds.add(attackerId);
                attackers.push(attacker);
            }
        }

        const defenseCarriersAtStar = context.carriersOrbiting.get(defendingStar._id.toString()) || [];
        const defenseCarriersOnTheWay = (attackData && attackData.carriersOnTheWay.filter(carrierId => !defenseCarriersAtStar.find(carrier => carrier._id.toString() === carrierId.toString())).map(carrierId => context.carriersById.get(carrierId.toString()))) || [];
        const defenseCarriers = defenseCarriersAtStar.concat(defenseCarriersOnTheWay);
        const sides = this.combatService.constructSidesStar(game, defendingStar, player, [player], attackers, defenseCarriers, attackingCarriers);
        const result = this.combatService.calculate(sides.defender, sides.attacker, true, true);

        if (result.after.defender <= 0) {
            return result.needed.defender - result.before.defender;
        } else {
            return 0;
        }
    }

    priorityFromOrderCategory(category) {
        switch (category) {
            case DEFEND_STAR_ACTION:
                return 3;
            case CLAIM_STAR_ACTION:
                return 2;
            case REINFORCE_STAR_ACTION:
                return 1;
            default:
                return 0;
        }
    }

    _gatherAssignments(game, player, context) {
        const assignments = new Map();

        for (const playerStar of context.playerStars) {
            const carriersHere = context.carriersOrbiting.get(playerStar._id.toString()) || [];
            const totalShips = playerStar.ships + carriersHere.map(carrier => carrier.ships).reduce((a, b) => a + b, 0);
            assignments.set(playerStar._id.toString(), {
                carriers: carriersHere,
                star: playerStar,
                totalShips
            });
        }

        return assignments;
    }

    _gatherOrders(game, player, context) {
        const defenseOrders = this._gatherDefenseOrders(game, player, context);
        //For now, just expand to unowned stars. Later, we will launch attacks on other players.
        const expansionOrders = this._gatherExpansionOrders(game, player, context);
        const movementOrders = this._gatherMovementOrders(game, player, context);
        return defenseOrders.concat(expansionOrders, movementOrders);
    }

    _invasionInProgress(player, starId) {
        return player.aiState && player.aiState.startedInvasions && player.aiState.startedInvasions.find(invasion => invasion.star === starId.toString());
    }

    _gatherExpansionOrders(game, player, context) {
        const orders = [];

        for (const [fromId, reachables] of context.reachableStars) {
            const claimCandidates = Array.from(reachables).map(starId => context.starsById.get(starId)).filter(star => !star.ownedByPlayerId);
            for (const candidate of claimCandidates) {
                if (!this._invasionInProgress(player, candidate._id)) {
                    // Account for stars without scanning data
                    const score = Math.max(candidate.naturalResources + 0, 1);

                    orders.push({
                        type: CLAIM_STAR_ACTION,
                        score,
                        star: candidate._id.toString(),
                        from: fromId
                    });
                }
            }
        }

        return orders;
    }

    _getAttackData(game, player, context, attackedStarId, attackInTicks) {
        if (!player.aiState || !player.aiState.knownAttacks) {
            return null;
        }

        const attackAbsoluteTick = game.state.tick + attackInTicks;
        return player.aiState.knownAttacks.find(attack => attack.starId === attackedStarId.toString() && attack.arrivalTick === attackAbsoluteTick);
    }

    _gatherDefenseOrders(game, player, context) {
        // Find all of our stars that are under attack
        const incomingCarriers = game.galaxy.carriers
            .filter(carrier => carrier.ownedByPlayerId.toString() !== player._id.toString())
            .map(carrier => [carrier, carrier.waypoints.find(wp => context.starsById.has(wp.destination.toString()))])
            .filter(incoming => Boolean(incoming[1]))

        const attacksByStar = new Map();
        const attackedStars = new Set();

        for (const [incomingCarrier, incomingWaypoint] of incomingCarriers) {
            const targetStar = incomingWaypoint.destination.toString();
            const attacks = getOrInsert(attacksByStar, targetStar, () => new Map());
            attackedStars.add(targetStar);
            const attackInTicks = this.waypointService.calculateWaypointTicksEta(game, incomingCarrier, incomingWaypoint);
            const simultaneousAttacks = getOrInsert(attacks, attackInTicks, () => []);
            simultaneousAttacks.push(incomingCarrier);
        }

        context.attackedStars = attackedStars;

        const orders = new Array(attacksByStar.size);

        for (const [attackedStarId, attacks] of attacksByStar) {
            for (const [attackInTicks, incomingCarriers] of attacks) {
                const attackedStar = context.starsById.get(attackedStarId);
                const starScore = attackedStar.infrastructure.economy + 2 * attackedStar.infrastructure.industry + 3 * attackedStar.infrastructure.science;

                orders.push({
                    type: DEFEND_STAR_ACTION,
                    score: starScore,
                    star: attackedStarId,
                    ticksUntil: attackInTicks,
                    incomingCarriers
                });
            }
        }

        return orders;
    }

    _gatherMovementOrders(game, player, context) {
        const orders = [];
        const starPriorities = this._computeStarPriorities(game, player, context);

        for (const [starId, priority] of starPriorities) {
            const neighbors = context.reachablePlayerStars.get(starId);
            for (const neighbor of neighbors) {
                const neighborPriority = starPriorities.get(neighbor);
                if (neighborPriority < priority) {
                    orders.push({
                        type: REINFORCE_STAR_ACTION,
                        score: priority - neighborPriority,
                        star: starId,
                        source: neighbor
                    });
                }
            }
        }

        return orders;
    }

    _computeStarPriorities(game, player, context) {
        const borderStarPriorities = new Map();
        for (const borderStarId of context.borderStars) {
            // Really, this should be calculated the other way around, going out from the enemy... but for now this should do it
            const enemyStars = this._countEnemyStars(game, player, context, context.reachableStars.get(borderStarId));
            // Maybe include some other properties, like infrastructure/specialists in the priority calculation later
            borderStarPriorities.set(borderStarId, 1 + enemyStars);
        }

        const visited = new Set();
        const starPriorities = new Map(borderStarPriorities);

        while (true) {
            let changed = false;

            for (const [starId, priority] of starPriorities) {
                if (!visited.has(starId)) {
                    visited.add(starId);
                    const reachables = context.reachablePlayerStars.get(starId);
                    for (const reachableId of reachables) {
                        const oldPriority = starPriorities.get(reachableId) || 0;
                        const transitivePriority = priority * 0.5;
                        const newPriority = Math.max(oldPriority, transitivePriority);
                        starPriorities.set(reachableId, newPriority);
                        changed = true;
                    }
                }
            }

            if (!changed) {
                break;
            }
        }

        return starPriorities;
    }

    _countEnemyStars(game, player, context, starIds) {
        let count = 0;

        for (const starId of starIds) {
            const star = context.starsById.get(starId);
            if (star.ownedByPlayerId && star.ownedByPlayerId !== player._id) {
                count++;
            }
        }

        return count;
    }

    _computeExistingLogisticsGraph(game, player) {
        const loopedCarriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id).filter(c => c.waypointsLooped && c.waypoints && c.waypoints.length === 2);

        const graph = new Map();

        for (let carrier of loopedCarriers) {
            const fromWaypoint = carrier.waypoints.find(waypoint => waypoint.action === "collectAll");
            const toWaypoint = carrier.waypoints.find(waypoint => waypoint.action === "dropAll");
            if (fromWaypoint && toWaypoint) {
                const from = fromWaypoint.destination.toString();
                const to = toWaypoint.destination.toString();
                const destinations = getOrInsert(graph, from, () => new Map());
                destinations.set(to, carrier);
            }
        }

        return graph;
    }

    _computeStarGraph(game, player, playerStars, starCandidates) {
        const hyperspaceRange = this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);
        const hyperspaceRangeSquared = hyperspaceRange * hyperspaceRange;

        const starGraph = new Map();

        playerStars.forEach((star, starIdx) => {
            const reachableStars = new Set();

            starCandidates.forEach((otherStar, otherStarIdx) => {
                if (starIdx !== otherStarIdx && this.distanceService.getDistanceSquaredBetweenLocations(star.location, otherStar.location) <= hyperspaceRangeSquared) {
                    reachableStars.add(otherStar._id.toString());
                }
            });

            starGraph.set(star._id.toString(), reachableStars);
        });

        return starGraph;
    }

    // logisticsGraph: Map<String, Set<String>>; existingGraph: Map<String, Map<String, String>>
    _createCarrierOrders(logisticsGraph, existingGraph) {
        const orders = new Array();

        for (let [ from, destinations ] of logisticsGraph) {
            const existingDestinations = existingGraph.get(from) || new Map();

            for (let to of destinations) {
                if (!existingDestinations.has(to)) {
                    orders.push({
                        orderType: 'CREATE_CARRIER_LOOP',
                        data: {
                            from,
                            to
                        }
                    });
                } else {
                    existingDestinations.delete(to);
                }
            }
        }

        for (let [ _from, oldDestinations ] of existingGraph) {
            for (let [ _to, carrier ] of oldDestinations) {
                carrier.waypointsLooped = false;
            }
        }

        return orders;
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

    _createLogisticsGraph(game, player, starGraph, playerStars) {
        const starScores = this._computeStarScores(game, player, playerStars, starGraph);
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
        const lowerConnections = Array.from(candidates).filter(c => starScores.get(c.from) < starScore);
        return minElementBy((connection) => starScores.get(connection.from), lowerConnections)
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
                        to: start,
                        from: c
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
