const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Heap = require('qheap');
const { getOrInsert, minBy, minElementBy, reverseSort } = require('../utils.js')
const mongoose = require("mongoose");

const DEFEND_STAR_ACTION = 'DEFEND_STAR';
const CLAIM_STAR_ACTION = 'CLAIM_STAR';
const REINFORCE_STAR_ACTION = 'REINFORCE_STAR';

const EMPTY_STAR_SCORE_MULTIPLIER = 1;
const ENEMY_STAR_SCORE_MULTIPLIER = 5;

// IMPORTANT IMPLEMENTATION NOTES
// During AI tick, care must be taken to NEVER write any changes to the database.
// This is performed automatically by mongoose (when calling game.save()).
// Use the writeToDB parameters to skip (or introduce them where needed).
// Otherwise, changes will get duplicated.
module.exports = class AIService {
    constructor(starUpgradeService, carrierService, starService, distanceService, waypointService, combatService, shipTransferService, technologyService, playerService) {
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.waypointService = waypointService;
        this.combatService = combatService;
        this.shipTransferService = shipTransferService;
        this.technologyService = technologyService;
        this.playerService = playerService;
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
            startedClaims: []
        }
    }

    _updateState(game, player) {
        if (!player.aiState) {
            return;
        }

        if (player.aiState.knownAttacks) {
            player.aiState.knownAttacks = player.aiState.knownAttacks.filter(attack => attack.arrivalTick > game.state.tick);
        }
    }

    _createContext(game, player) {
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        const starsById = new Map()

        for (const star of game.galaxy.stars) {
            starsById.set(star._id.toString(), star);
        }

        const traversableStars = game.galaxy.stars.filter(star => !star.ownedByPlayerId || star.ownedByPlayerId.toString() === player._id.toString());
        const reachableFromPlayerStars = this._computeStarGraph(game, player, playerStars, traversableStars);
        const reachablePlayerStars = this._computeStarGraph(game, player, playerStars, playerStars);
        const freelyReachableStars = this._computeStarGraph(game, player, traversableStars, traversableStars);
        const borderStars = [];
        for (const [from, reachables] of reachableFromPlayerStars) {
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

        const incomingCarriers = game.galaxy.carriers
            .filter(carrier => carrier.ownedByPlayerId.toString() !== player._id.toString())
            .map(carrier => [carrier, carrier.waypoints.find(wp => {
                const star = starsById.get(wp.destination.toString());
                const isPlayerStar = star.ownedByPlayerId && star.ownedByPlayerId.toString() === player._id.toString();
                if (isPlayerStar) {
                    return [carrier, wp];
                } else {
                    return [];
                }
            })])
            .filter(incoming => Boolean(incoming[1]))

        const attacksByStarId = new Map();
        const attackedStarIds = new Set();

        for (const [incomingCarrier, incomingWaypoint] of incomingCarriers) {
            const targetStar = incomingWaypoint.destination.toString();
            const attacks = getOrInsert(attacksByStarId, targetStar, () => new Map());
            attackedStarIds.add(targetStar);
            const attackInTicks = this.waypointService.calculateWaypointTicksEta(game, incomingCarrier, incomingWaypoint);
            const simultaneousAttacks = getOrInsert(attacks, attackInTicks, () => []);
            simultaneousAttacks.push(incomingCarrier);
        }

        return {
            playerStars,
            playerCarriers,
            starsById,
            reachableFromPlayerStars,
            reachablePlayerStars,
            borderStars,
            carriersOrbiting,
            carriersById,
            attacksByStarId,
            attackedStarIds,
            freelyReachableStars,
            playerEconomy: this.playerService.calculateTotalEconomy(playerStars),
            playerIndustry: this.playerService.calculateTotalIndustry(playerStars),
            playerScience: this.playerService.calculateTotalScience(playerStars)
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

        // This is a hack to ensure that ships are never assigned from a star where they are needed for defense.
        // Later, with an improved scoring system, this should not be necessary
        for (const order of orders) {
            if (order.type === DEFEND_STAR_ACTION) {
                assignments.delete(order.star);
            }
        }

        const newKnownAttacks = [];
        const newClaimedStars = new Set(player.aiState.startedClaims);

        // For now, process orders in order of importance and try to find the best assignment possible for each order.
        // Later, a different scoring process could be used to maximize overall scores.

        for (const order of orders) {
            //console.log(order);
            if (order.type === DEFEND_STAR_ACTION) {
                // Later, take weapons level and specialists into account
                const attackData = this._getAttackData(game, player, context, order.star, order.ticksUntil) || this._createDefaultAttackData(game, order.star, order.ticksUntil);
                const defendingStar = context.starsById.get(order.star);
                const requiredAdditionallyForDefense = this._calculateRequiredShipsForDefense(game, player, context, attackData, order.incomingCarriers, defendingStar);
                if (requiredAdditionallyForDefense === 0) {
                    // We're going to be fine
                    newKnownAttacks.push(attackData);
                } else {
                    console.log("Performing defense on: " + defendingStar.name);
                    const allPossibleAssignments = this._findAssignmentsWithTickLimit(game, player, context, context.reachablePlayerStars, assignments, order.star, order.ticksUntil, this._canAffordCarrier(context, game, player, true));

                    let shipsNeeded = requiredAdditionallyForDefense;

                    for (const {assignment, trace} of allPossibleAssignments) {
                        // Skip assignments that we cannot afford to fulfill
                        if ((!assignment.carriers || assignment.carriers.length === 0) && !this._canAffordCarrier(context, game, player, true)) {
                            continue;
                        }

                        shipsNeeded -= assignment.assignment.totalShips;

                        await this._useAssignment(context, game, player, assignments, assignment, this._createWaypointsFromTrace(trace), assignment.totalShips);

                        if (shipsNeeded < 0) {
                            break;
                        }
                    }
                }
            } else if (order.type === CLAIM_STAR_ACTION) {
                // Skip double claiming stars that might have been claimed by an earlier action
                if (newClaimedStars.has(order.star)) {
                    continue;
                }

                const ticksLimit = game.settings.galaxy.productionTicks * 2; // If star is not reachable in that time, try again next cycle
                const fittingAssignments = this._findAssignmentsWithTickLimit(game, player, context, context.freelyReachableStars, assignments, order.star, ticksLimit, this._canAffordCarrier(context, game, player, false), true)
                const found = fittingAssignments && fittingAssignments[0];

                if (!found) {
                    continue;
                }

                const waypoints = this._createWaypointsFromTrace(found.trace);
                await this._useAssignment(context, game, player, assignments, found.assignment, waypoints, 0);
                for (const visitedStar of found.trace) {
                    newClaimedStars.add(visitedStar);
                }
            } else if (order.type === REINFORCE_STAR_ACTION) {
                const assignment = assignments.get(order.source);
                if (!assignment) {
                    continue;
                }
                const hasCarrier = assignment.carriers && assignment.carriers.length > 0;

                const reinforce = async () => {
                    console.log("Reinforcing star " +  context.starsById.get(order.star).name +  " from " + context.starsById.get(order.source).name)
                    const waypoints = [
                        {
                            _id: new mongoose.Types.ObjectId(),
                            source: order.source,
                            destination: order.star,
                            action: 'dropAll',
                            actionShips: 0,
                            delayTicks: 0
                        },
                        {
                            _id: new mongoose.Types.ObjectId(),
                            source: order.star,
                            destination: order.source,
                            action: 'nothing',
                            actionShips: 0,
                            delayTicks: 0
                        }
                    ];
                    await this._useAssignment(context, game, player, assignments, assignment, waypoints, assignment.totalShips);
                }

                if (hasCarrier) {
                    // Since a carrier is standing around, we might as well use it
                    await reinforce();
                } else {
                    // TODO: We want to be smarter about reinforcements. Maybe sort the orders by the number of ships involved?
                    const source = context.starsById.get(order.source);
                    const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, source);
                    const shipProductionPerTick = this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, source.infrastructure.industry, 1, game.settings.galaxy.productionTicks);
                    const ticksProduced = assignment.totalShips / shipProductionPerTick;
                    if (ticksProduced > (game.settings.galaxy.productionTicks * 0.5) && this._canAffordCarrier(context, game, player, false)) {
                        await reinforce();
                    }
                }
            }
        }

        player.aiState.knownAttacks = newKnownAttacks;

        const claimsInProgress = [];

        for (const claim of newClaimedStars) {
            const star = context.starsById.get(claim);
            if (!star.ownedByPlayerId) {
                claimsInProgress.push(claim);
            }
        }

        player.aiState.startedClaims = claimsInProgress;
    }

    async _useAssignment(context, game, player, assignments, assignment, waypoints, ships) {
        console.log("Using assignment from " + assignment.star.name + ". " + assignment.carriers.length + " carriers present.");
        let shipsToTransfer = ships;
        const starId = assignment.star._id.toString();
        await this.shipTransferService.transferAllToStar(game, player, starId, false);
        let carrier = assignment.carriers && assignment.carriers[0];
        if (carrier) {
            console.log("Using existing carrier " + carrier.name);
            assignment.carriers.shift();
        } else {
            const buildResult = await this.starUpgradeService.buildCarrier(game, player, starId, 1, false);
            carrier = buildResult.carrier;
            shipsToTransfer -= 1;
            assignment.totalShips -= 1;
            console.log("Building new carrier " + carrier.name);
        }
        if (shipsToTransfer > 0) {
            console.log("Ships for transfer: " + shipsToTransfer + ", assignment total: " + assignment.totalShips);
            const remaining = Math.max(assignment.totalShips - shipsToTransfer - 1, 0);
            await this.shipTransferService.transfer(game, player, carrier._id, shipsToTransfer + 1, starId, remaining);
            assignment.totalShips -= shipsToTransfer;
        }
        console.log("Assignment ships after transfer: " + assignment.totalShips);
        await this.waypointService.saveWaypointsForCarrier(game, player, carrier, waypoints, false, false);
        const carrierRemaining = assignment.carriers && assignment.carriers.length > 0;
        if (!carrierRemaining && assignment.totalShips === 0) {
            assignments.delete(starId);
        }
    }

    _createWaypointsFromTrace(trace) {
        const waypoints = [];

        if (trace.length <= 1) {
            return null;
        }

        let last = trace[0];
        for (let i = 1; i < trace.length; i++) {
            waypoints.push({
                _id: new mongoose.Types.ObjectId(),
                source: last,
                destination: trace[i],
                action: 'nothing',
                actionShips: 0,
                delayTicks: 0
            });
            last = trace[i];
        }

        return waypoints;
    }

    _canAffordCarrier(context, game, player, highPriority) {
        // Keep 20% of budget for upgrades
        const leaveOver = highPriority ? 0 : context.playerEconomy * 2;
        const availableFunds = player.credits - leaveOver;
        const carrierExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];
        return availableFunds >= this.starUpgradeService.calculateCarrierCost(game, carrierExpenseConfig);
    }

    _searchAssignments(context, starGraph, assignments, nextFilter, onAssignment, startStarId) {
        const queue = new Heap({
            comparBefore: (b1, b2) => b1.totalDistance > b2.totalDistance,
            compar: (b1, b2) => b2.totalDistance - b1.totalDistance
        });

        const init = {
            trace: [startStarId],
            starId: startStarId,
            totalDistance: 0
        };
        queue.push(init);

        const visited = new Set();

        while (queue.length > 0) {
            const {starId, trace, totalDistance} = queue.shift();
            visited.add(starId);

            const currentStarAssignment = assignments.get(starId);

            if (currentStarAssignment) {
                if (!onAssignment(currentStarAssignment, trace)) {
                    return;
                }
            }

            const nextCandidates = starGraph.get(starId);
            if (nextCandidates) {
                const star = context.starsById.get(starId);

                const fittingCandidates = Array.from(nextCandidates)
                    .filter(candidate => nextFilter(trace, candidate));

                for (const fittingCandidate of fittingCandidates) {
                    if (!visited.has(fittingCandidate)) {
                        visited.add(fittingCandidate);
                        const distToNext = this.distanceService.getDistanceSquaredBetweenLocations(star, context.starsById.get(fittingCandidate));
                        const newTotalDist = totalDistance + distToNext;
                        queue.push({
                            starId: fittingCandidate,
                            trace: [fittingCandidate].concat(trace),
                            totalDistance: newTotalDist
                        });
                    }
                }
            }
        }
    }

    _filterAssignmentByCarrierPurchase(assignment, allowCarrierPurchase) {
        const hasCarriers = assignment.carriers && assignment.carriers.length > 0;
        return allowCarrierPurchase || hasCarriers;
    }

    _findAssignmentsWithTickLimit(game, player, context, starGraph, assignments, destinationId, ticksLimit, allowCarrierPurchase, onlyOne = false) {
        const distancePerTick = game.settings.specialGalaxy.carrierSpeed;

        const nextFilter = (trace, nextStarId) => {
            const entireTrace = trace.concat([nextStarId]).map(starId => context.starsById.get(starId).location);
            const entireDistance = this.distanceService.getDistanceAlongLocationList(entireTrace);
            const ticksRequired = Math.ceil(entireDistance / distancePerTick);
            return ticksRequired <= ticksLimit;
        }

        const fittingAssignments = [];

        const onAssignment = (assignment, trace) => {
            if (this._filterAssignmentByCarrierPurchase(assignment, allowCarrierPurchase)) {
                fittingAssignments.push({
                    assignment,
                    trace
                });
            }
            return !onlyOne;
        }

        this._searchAssignments(context, starGraph, assignments, nextFilter, onAssignment, destinationId)

        return fittingAssignments;
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
            const attacker = game.galaxy.players.find(player => player._id.toString() === attackingCarrier.ownedByPlayerId.toString());
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
            const totalShips = playerStar.ships + carriersHere.map(carrier => carrier.ships - 1).reduce((a, b) => a + b, 0);
            if (totalShips < 1 && carriersHere.length === 0) {
                continue;
            }
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

    _claimInProgress(player, starId) {
        return player.aiState && player.aiState.startedClaims && player.aiState.startedClaims.find(claim => claim === starId.toString());
    }

    _gatherExpansionOrders(game, player, context) {
        const orders = [];
        const used = new Set();

        for (const [fromId, reachables] of context.reachableFromPlayerStars) {
            const claimCandidates = Array.from(reachables).map(starId => context.starsById.get(starId)).filter(star => !star.ownedByPlayerId);
            for (const candidate of claimCandidates) {
                const candidateId = candidate._id.toString();
                if (!this._claimInProgress(player, candidateId) && !used.has(candidateId)) {
                    used.add(candidateId);

                    let score = 1;
                    if (candidate.naturalResources) {
                        score = candidate.naturalResources.economy + candidate.naturalResources.industry + candidate.naturalResources.science;
                    }

                    orders.push({
                        type: CLAIM_STAR_ACTION,
                        star: candidateId,
                        score
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
        const orders = [];

        for (const [attackedStarId, attacks] of context.attacksByStarId) {
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

    _isUnderAttack(context, starId) {
        return context.attackedStarIds.has(starId);
    }

    _gatherMovementOrders(game, player, context) {
        const orders = [];
        const starPriorities = this._computeStarPriorities(game, player, context);

        console.log("Star priorities:");
        for (const [starId, priority] of starPriorities) {
            console.log("Priority: " + context.starsById.get(starId).name + " => " + priority);

            const neighbors = context.reachablePlayerStars.get(starId);
            for (const neighbor of neighbors) {
                if (this._isUnderAttack(context, neighbor)) {
                    continue;
                }

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
        const hyperspaceRange = this._getHyperspaceRange(game, player);
        const borderStarPriorities = new Map();

        for (const borderStarId of context.borderStars) {
            const borderStar = context.starsById.get(borderStarId);
            const reachables = context.reachableFromPlayerStars.get(borderStarId);
            let score = 0;

            for (const reachableId of reachables) {
                const reachableStar = context.starsById.get(reachableId);
                if (!reachableStar.ownedByPlayerId) {
                    const distance = this.distanceService.getDistanceBetweenLocations(borderStar.location, reachableStar.location);
                    const distanceScore = (distance / hyperspaceRange) * EMPTY_STAR_SCORE_MULTIPLIER;
                    score += distanceScore;
                } else if (reachableStar.ownedByPlayerId.toString() !== player._id.toString()) {
                    const distance = this.distanceService.getDistanceBetweenLocations(borderStar.location, reachableStar.location);
                    const distanceScore = distance / hyperspaceRange * ENEMY_STAR_SCORE_MULTIPLIER;
                    score += distanceScore;
                }
            }

            borderStarPriorities.set(borderStarId, score);
        }

        console.log("Border star priorities:");
        for (const [id, score] of borderStarPriorities) {
            console.log("Priority: " + context.starsById.get(id).name + " => " + score);
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

    _getHyperspaceRange(game, player) {
        return this.distanceService.getHyperspaceDistance(game, player.research.hyperspace.level);
    }

    _computeStarGraph(game, player, playerStars, starCandidates) {
        const hyperspaceRange = this._getHyperspaceRange(game, player);
        const hyperspaceRangeSquared = hyperspaceRange * hyperspaceRange;

        const starGraph = new Map();

        playerStars.forEach((star, starIdx) => {
            const reachableFromPlayerStars = new Set();

            starCandidates.forEach((otherStar, otherStarIdx) => {
                if (starIdx !== otherStarIdx && this.distanceService.getDistanceSquaredBetweenLocations(star.location, otherStar.location) <= hyperspaceRangeSquared) {
                    reachableFromPlayerStars.add(otherStar._id.toString());
                }
            });

            starGraph.set(star._id.toString(), reachableFromPlayerStars);
        });

        return starGraph;
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
