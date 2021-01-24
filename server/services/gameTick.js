const EventEmitter = require('events');
const moment = require('moment');

module.exports = class GameTickService extends EventEmitter {
    
    constructor(distanceService, starService, carrierService, 
        researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService, gameService, technologyService,
        specialistService, starUpgradeService, reputationService, aiService) {
        super();
            
        this.distanceService = distanceService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.researchService = researchService;
        this.playerService = playerService;
        this.historyService = historyService;
        this.waypointService = waypointService;
        this.combatService = combatService;
        this.leaderboardService = leaderboardService;
        this.userService = userService;
        this.gameService = gameService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.starUpgradeService = starUpgradeService;
        this.reputationService = reputationService;
        this.aiService = aiService;
    }

    async tick(gameId) {
        let game = await this.gameService.getByIdAll(gameId);

        /*
            1. Move all carriers
            2. Perform combat at stars that have enemy carriers in orbit
            3. Industry creates new ships
            4. Players conduct research
            5. If its the last tick in the galactic cycle, all players earn money and experimentation is done.
            6. Check to see if anyone has won the game.
        */

       if (game.state.paused) {
           throw new Error('Cannot perform a game tick on a paused game');
       }

       if (moment(game.state.startDate).utc().diff(moment().utc()) > 0) {
            throw new Error('Cannot perform a game tick as this game has not yet started.');
       }

       if (!this._canTick(game)) {
           return;
       }

       let startTime = process.hrtime();
       console.info(`[${game.settings.general.name}] - Game tick started.`);

       game.state.lastTickDate = moment().utc();

        let taskTime = process.hrtime();
        let taskTimeEnd = null;

        let logTime = (taskName) => {
            taskTimeEnd = process.hrtime(taskTime);
            taskTime = process.hrtime();
            console.info(`[${game.settings.general.name}] - ${taskName}: %ds %dms'`, taskTimeEnd[0], taskTimeEnd[1] / 1000000);
        };

        let gameUsers = await this.userService.getGameUsers(game);
        logTime('Loaded game users');

        let iterations = 1;

        // If we are in turn based mode, we need to repeat the tick X number of times.
        if (this.gameService.isTurnBasedGame(game)) {
            iterations = game.settings.gameTime.turnJumps;
        }

        while (iterations--) {
            logTime(`Tick ${game.state.tick}`);
            await this._combatCarriers(game, gameUsers);
            logTime('Combat carriers');
            await this._moveCarriers(game, gameUsers);
            logTime('Move carriers and produce ships');
            await this.researchService.conductResearchAll(game, gameUsers);
            logTime('Conduct research');
            this._endOfGalacticCycleCheck(game);
            logTime('Galactic cycle check');
            this._logHistory(game);
            logTime('Log history');
            await this._gameLoseCheck(game, gameUsers);
            logTime('Game lose check');
            let hasWinner = await this._gameWinCheck(game, gameUsers);
            logTime('Game win check');
            this._playAI(game);
            logTime('AI controlled players turn');

            if (hasWinner) {
                break;
            }
        }

        this._resetPlayersReadyStatus(game);

        await game.save();
        logTime('Save game');

        // Save user profile achievements if any have changed.
        for (let user of gameUsers) {
            await user.save();
        }

        logTime('Save users');

        let endTime = process.hrtime(startTime);

        console.info(`[${game.settings.general.name}] - Game tick ended: %ds %dms'`, endTime[0], endTime[1] / 1000000);
    }

    _canTick(game) {
        let lastTick = moment(game.state.lastTickDate).utc();
        let nextTick;

        if (this.gameService.isRealTimeGame(game)) {
            // If in real time mode, then calculate when the next tick will be and work out if we have reached that tick.
            nextTick = moment(lastTick).utc().add(game.settings.gameTime.speed, 'm');
        } else if (this.gameService.isTurnBasedGame(game)) {
            // If in turn based mode, then check if all undefeated players are ready.
            // OR the max time wait limit has been reached.
            let isAllPlayersReady = this.gameService.isAllUndefeatedPlayersReady(game);
            
            if (isAllPlayersReady) {
                return true;
            }

            nextTick = moment(lastTick).utc().add(game.settings.gameTime.maxTurnWait, 'h');
        } else {
            throw new Error(`Unsupported game type.`);
        }
    
        return nextTick.diff(moment().utc(), 'seconds') <= 0;
    }

    async _combatCarriers(game, gameUsers) {
        if (game.settings.specialGalaxy.carrierToCarrierCombat !== 'enabled') {
            return;
        }

        // Get all carriers that are in transit, their current locations
        // and where they will be moving to.
        let carrierPositions = game.galaxy.carriers
            .filter(x => 
                this.carrierService.isInTransit(x)           // Carrier is already in transit
                || this.carrierService.isLaunching(x)        // Or the carrier is just about to launch (this prevent carrier from hopping over attackers)
            )
            .map(c => {
                let waypoint = c.waypoints[0];
                let locationNext = this.carrierService.getNextLocationToWaypoint(game, c);

                let sourceStar = this.starService.getById(game, waypoint.source);
                let destinationStar = this.starService.getById(game, waypoint.destination);
                let distanceToSourceCurrent = this.distanceService.getDistanceBetweenLocations(c.location, sourceStar.location);
                let distanceToDestinationCurrent = this.distanceService.getDistanceBetweenLocations(c.location, destinationStar.location);
                let distanceToSourceNext = this.distanceService.getDistanceBetweenLocations(locationNext, sourceStar.location);
                let distanceToDestinationNext = this.distanceService.getDistanceBetweenLocations(locationNext, destinationStar.location);

                return {
                    carrier: c,
                    source: waypoint.source,
                    destination: waypoint.destination,
                    locationCurrent: c.location,
                    locationNext,
                    distanceToSourceCurrent,
                    distanceToDestinationCurrent,
                    distanceToSourceNext,
                    distanceToDestinationNext
                };
            });

        for (let i = 0; i < carrierPositions.length; i++) {
            let friendlyCarrier = carrierPositions[i];

            if (friendlyCarrier.carrier.ships <= 0) {
                continue;
            }

            // First up, get all carriers that are heading from the destination and to the source
            // and are in front of the carrier.
            let collisionCarriers = carrierPositions
                .filter(c => {
                    // Head to head combat:
                    return (c.carrier.ships > 0                                                 // Has ships (may have been involved in other combat)
                            && !c.carrier.isGift                                                // And is not a gift
                            && c.destination.equals(friendlyCarrier.source)                         // Is heading to where the carrier came from
                            && c.source.equals(friendlyCarrier.destination)                         // Came from where the carrier is heading to
                            && c.distanceToSourceCurrent <= friendlyCarrier.distanceToDestinationCurrent    // Is currently in front of the carrier
                            && c.distanceToSourceNext >= friendlyCarrier.distanceToDestinationNext)         // Will be behind the carrier
                    // Combat from behind:
                        || (c.carrier.ships > 0
                            && !c.carrier.isGift                                                // And is not a gift
                            && c.destination.equals(friendlyCarrier.destination)                    // Is heading in the same direction as the carrier
                            && c.source.equals(friendlyCarrier.source)
                            && c.distanceToDestinationCurrent <= friendlyCarrier.distanceToDestinationCurrent   // Is current behind the carrier
                            && c.distanceToDestinationNext >= friendlyCarrier.distanceToDestinationNext);       // Will be in front of the carrier 
                });

            // If all of the carriers that have collided are friendly then no need to do combat.
            let friendlyCarriers = collisionCarriers
                .filter(c => c.carrier.ships > 0 && c.carrier.ownedByPlayerId.equals(friendlyCarrier.carrier.ownedByPlayerId));

            // If all other carriers are friendly then skip.
            if (friendlyCarriers.length === collisionCarriers.length) {
                continue;
            }

            let friendlyPlayer = this.playerService.getById(game, friendlyCarrier.carrier.ownedByPlayerId);
            
            let combatCarriers = collisionCarriers
                .map(c => c.carrier)
                .filter(c => c.ships > 0);

            // Double check that there are carriers that can fight.
            if (!combatCarriers.length) {
                return;
            }

            // TODO: Check for specialists that affect pre-combat.

            await this._performCombat(game, gameUsers, friendlyPlayer, null, combatCarriers);
        }
    }

    async _moveCarriers(game, gameUsers) {
        // 1. Get all carriers that have waypoints ordered by the distance
        // they need to travel.
        // Note, we order by distance ascending for 2 reasons:
        //  1. To prevent carriers hopping over combat.
        //  2. To ensure that carriers who are closest to their destinations
        // land before any other carriers due to land in the same tick.
        let carriers = [];

        let carriersWithWaypoints = game.galaxy.carriers.filter(c => c.waypoints.length);

        for (let i = 0; i < carriersWithWaypoints.length; i++) {
            let carrier = carriersWithWaypoints[i];
            let waypoint = carrier.waypoints[0];

            // If the waypoint has a delay on it for a carrier that is stationed
            // at a star, then we need to wait until there are no more delay ticks.
            if (waypoint.delayTicks && carrier.orbiting) {
                waypoint.delayTicks--;
                continue;
            }

            let destinationStar = game.galaxy.stars.find(s => s._id.equals(waypoint.destination));

            // If we are currently in orbit then this is the first movement, we
            // need to set the transit fields
            // Also double check that the waypoint isn't travelling to the current star
            // that the carrier is in orbit of.
            if (carrier.orbiting && !carrier.orbiting.equals(waypoint.destination)) {
                carrier.inTransitFrom = carrier.orbiting;
                carrier.inTransitTo = waypoint.destination;
                carrier.orbiting = null; // We are just about to move now so this needs to be null.
            }

            // Save the distance travelled so it can be used later for combat.
            carrier.distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);

            carriers.push(carrier);
        }

        carriers = carriers.sort((a, b) => a.distanceToDestination - b.distanceToDestination);

        // 2. Iterate through each carrier, move it, then check for combat.
        // (DO NOT do any combat yet as we have to wait for all of the carriers to move)
        // Because carriers are ordered by distance to their destination,
        // this means that always the carrier that is closest to its destination
        // will land first. This is important for unclaimed stars and defender bonuses.

        let combatStars = [];
        let actionWaypoints = [];

        for (let i = 0; i < carriers.length; i++) {
            let carrier = carriers[i];
        
            let carrierMovementReport = await this.carrierService.moveCarrier(game, gameUsers, carrier);

            // If the carrier has arrived at the star then
            // append the movement waypoint to the array of action waypoints so that we can deal with it after combat.
            if (carrierMovementReport.arrivedAtStar) {
                actionWaypoints.push({
                    carrier,
                    star: carrierMovementReport.destinationStar,
                    waypoint: carrierMovementReport.waypoint
                });
            }

            // Check if combat is required, if so add the destination star to the array of combat stars to check later.
            if (carrierMovementReport.combatRequiredStar && combatStars.indexOf(carrierMovementReport.destinationStar) < 0) {
                combatStars.push(carrierMovementReport.destinationStar);
            }
        }

        // 3. Now that all carriers have finished moving, perform combat.
        for (let i = 0; i < combatStars.length; i++) {
            let combatStar = combatStars[i];

            // Get all carriers orbiting the star and perform combat.
            let carriersAtStar = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.equals(combatStar._id));

            let starOwningPlayer = this.playerService.getById(game, combatStar.ownedByPlayerId);

            await this._performCombat(game, gameUsers, starOwningPlayer, combatStar, carriersAtStar);
        }

        // There may be carriers in the waypoint list that do not have any remaining ships or have been rerouted, filter them out.
        actionWaypoints = actionWaypoints.filter(x => x.carrier.orbiting && x.carrier.ships > 0);

        // 4a. Now that combat is done, perform any carrier waypoint actions.
        // Do the drops first
        this.waypointService.performWaypointActionsDrops(game, actionWaypoints);

        // 4b. Build ships at star.
        this.starService.applyStarSpecialistSpecialModifiers(game);
        this.starService.produceShips(game);

        // 4c. Do the rest of the waypoint actions.
        this.waypointService.performWaypointActionsCollects(game, actionWaypoints);
        this.waypointService.performWaypointActionsGarrisons(game, actionWaypoints);

        this._sanitiseDarkModeCarrierWaypoints(game);
    }

    _sanitiseDarkModeCarrierWaypoints(game) {
        game.galaxy.carriers.forEach(c => 
            this.waypointService.sanitiseDarkModeCarrierWaypoints(game, c));
    }

    async _performCombat(game, gameUsers, player, star, carriers) {
        // NOTE: If star is null then the combat mode is carrier-to-carrier.

        // Get all defender carriers ordered by most carriers present descending.
        // Carriers who have the most ships will be target first in combat.
        let defenderCarriers = carriers
                                .filter(c => c.ships > 0 && !c.isGift && c.ownedByPlayerId.equals(player._id))
                                .sort((a, b) => b.ships - a.ships);

        // If in carrier-to-carrier combat, verify that there are carriers that can fight.
        if (!star && !defenderCarriers.length) {
            return;
        }

        // Get all attacker carriers.
        let attackerCarriers = carriers
                                .filter(c => c.ships > 0 && !c.isGift && !c.ownedByPlayerId.equals(player._id))
                                .sort((a, b) => b.ships - a.ships);

        // Double check that the attacking carriers can fight.
        if (!attackerCarriers.length) {
            return;
        }

        // Get the players for the defender and all attackers.
        let attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId.toString()))];

        let defender = player;
        let attackers = attackerPlayerIds.map(playerId => this.playerService.getById(game, playerId));

        let defenderUser = gameUsers.find(u => u._id.equals(defender.userId));
        let attackerUsers = [];
        
        for (let attacker of attackers) {
            let attackerUser = gameUsers.find(u => u._id.equals(attacker.userId));
            attackerUsers.push(attackerUser);
        }

        const getCarrierUser = (carrier, players, users) => {
            let player = players.find(p => carrier.ownedByPlayerId.equals(p._id));

            return users.find(u => u._id.toString() === player.userId.toString());
        };

        // Perform combat at the star.
        let combatResult;
        
        if (star) {
            combatResult = this.combatService.calculateStar(game, star, defender, attackers, defenderCarriers, attackerCarriers);
        } else {
            combatResult = this.combatService.calculateCarrier(game, defenderCarriers, attackerCarriers);
        }

        await this._decreaseReputationForCombat(game, defender, attackers);
        
        // Add all of the carriers to the combat result with a snapshot of
        // how many ships they had before combat occurs.
        // We will update this as we go along with combat.
        combatResult.carriers = carriers.map(c => {
            let specialist = this.specialistService.getByIdCarrierTrim(c.specialistId);

            return {
                _id: c._id,
                name: c.name,
                ownedByPlayerId: c.ownedByPlayerId,
                specialist,
                before: c.ships,
                lost: 0,
                after: c.ships
            };
        });

        if (star) {
            let specialist = this.specialistService.getByIdStarTrim(star.specialistId);

            // Do the same with the star.
            combatResult.star = {
                _id: star._id,
                specialist,
                before: Math.floor(star.garrisonActual),
                lost: 0,
                after: Math.floor(star.garrisonActual)
            };
        }

        // Add combat result stats to defender achievements.
        if (defenderUser) {
            defenderUser.achievements.combat.losses.ships += combatResult.lost.defender;
            defenderUser.achievements.combat.kills.ships += combatResult.lost.attacker;
        }
        
        // Using the combat result, iterate over all of the defenders and attackers
        // and deduct from each ship/carrier until combat has been resolved.

        // Start with the attackers because its easier.
        let attackersKilled = combatResult.lost.attacker;
        let attackerCarrierIndex = 0;

        while (attackersKilled-- && attackerCarriers.length) {
            let attackerCarrier = attackerCarriers[attackerCarrierIndex];
            let combatCarrier = combatResult.carriers.find(c => c._id.equals(attackerCarrier._id));

            // Check for Coward spec, instead of removing it from the game, re-route it to the
            // nearest friendly star.
            if (star && attackerCarrier.ships === 1) {
                let hasRerouted = this._tryRerouteCowardCarrier(game, attackerCarrier);

                // If rerouted, we need to exit out of the current loop early.
                if (hasRerouted) {
                    // Remove it from the attackers array
                    attackerCarriers.splice(attackerCarrierIndex, 1);
                    attackerCarrierIndex = this._loopIncrementIndex(attackerCarrierIndex, attackerCarriers, -1);

                    // No ships were killed so add back onto the while loop iterator
                    attackersKilled++;

                    continue;
                }
            }

            attackerCarrier.ships--;
            combatCarrier.after--;
            combatCarrier.lost++;

            // Deduct ships lost from attacker.
            let attackerUser = getCarrierUser(attackerCarrier, attackers, attackerUsers);

            if (attackerUser) attackerUser.achievements.combat.losses.ships++;

            // If the carrier has been destroyed, remove it from the game.
            if (!attackerCarrier.ships) {
                game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(attackerCarrier), 1);

                attackerCarriers.splice(attackerCarrierIndex, 1);
                attackerCarrierIndex--;

                if (attackerUser) {
                    attackerUser.achievements.combat.losses.carriers++;

                    if (attackerCarrier.specialistId) attackerUser.achievements.combat.losses.specialists++;
                }
                if (defenderUser) {
                    defenderUser.achievements.combat.kills.carriers++;

                    if (attackerCarrier.specialistId) defenderUser.achievements.combat.kills.specialists++;
                }
            }

            attackerCarrierIndex = this._loopIncrementIndex(attackerCarrierIndex, attackerCarriers, 1);
        }

        // Now do the same for the defender.
        let defendersKilled = combatResult.lost.defender;
        let defenderCarrierIndex = 0;

        while (defendersKilled--) {
            let defenderShipKilled = false;

            // Decide whether to attack the star or the carrier.
            if (star && defenderCarrierIndex === -1) {
                if (Math.floor(star.garrisonActual)) { // Only hit the star if there is garrison.
                    star.garrisonActual--;
                    star.garrison = Math.floor(star.garrisonActual);
                    combatResult.star.after--;
                    combatResult.star.lost++;
                    defenderShipKilled = true;
                } else {
                    defendersKilled++; // Add back to the while loop.
                }
            } else if (defenderCarriers.length) {
                let defenderCarrier = defenderCarriers[defenderCarrierIndex];
                let combatCarrier = combatResult.carriers.find(c => c._id.equals(defenderCarrier._id));
    
                defenderCarrier.ships--;
                combatCarrier.after--;
                combatCarrier.lost++;
                defenderShipKilled = true;

                // If the carrier has been destroyed, remove it from the game.
                if (!defenderCarrier.ships) {
                    game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(defenderCarrier), 1);

                    defenderCarriers.splice(defenderCarrierIndex, 1);
                    defenderCarrierIndex--;

                    if (defenderUser) {
                        defenderUser.achievements.combat.losses.carriers++;

                        if (defenderCarrier.specialistId) defenderUser.achievements.combat.losses.specialists++;
                    }

                    // Add carriers killed to attackers.
                    for (let attackerUser of attackerUsers) {
                        if (attackerUser) {
                            attackerUser.achievements.combat.kills.carriers++;

                            if (defenderCarrier.specialistId) attackerUser.achievements.combat.kills.specialists++;
                        }
                    }
                }
            } else {
                defendersKilled++; // Nothing happened so keep looping.
            }

            if (defenderShipKilled) {
                // Add ships killed to attackers.
                for (let attackerUser of attackerUsers) {
                    if (attackerUser) attackerUser.achievements.combat.kills.ships++;
                }
            }

            defenderCarrierIndex++;

            if (defenderCarrierIndex > defenderCarriers.length - 1) {
                if (star) {
                    defenderCarrierIndex = -1;
                } else {
                    defenderCarrierIndex = 0;
                }
            }
        }

        // Log the combat event
        if (star) {
            this.emit('onPlayerCombatStar', {
                game,
                defender,
                attackers,
                star,
                combatResult
            });
        } else {
            this.emit('onPlayerCombatCarrier', {
                game,
                defender,
                attackers,
                combatResult
            });
        }

        // If the defender has been eliminated at the star then the attacker who travelled the shortest distance in the last tick
        // captures the star. Repeat star combat until there is only one player remaining.
        let starDefenderDefeated = star && !Math.floor(star.garrisonActual) && !defenderCarriers.length;

        if (starDefenderDefeated) {
            // TODO: move all this into the star service. captureStar()?
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            // If the star had a specialist that destroys infrastructure then perform demolition.
            if (specialist && specialist.modifiers.special && specialist.modifiers.special.destroyInfrastructureOnLoss) {
                star.specialistId = null;
                star.infrastructure.economy = 0;
                star.infrastructure.industry = 0;
                star.infrastructure.science = 0;
                star.warpGate = false;
            }

            let closestPlayerId = attackerCarriers.sort((a, b) => a.distanceToDestination - b.distanceToDestination)[0].ownedByPlayerId;

            // Capture the star.
            let newStarPlayer = attackers.find(p => p._id.equals(closestPlayerId));
            let newStarUser = attackerUsers.find(u => u._id.toString() === newStarPlayer.userId.toString());
            let newStarPlayerCarriers = attackerCarriers.filter(c => c.ownedByPlayerId.equals(newStarPlayer._id));

            let captureReward = star.infrastructure.economy * 10; // Attacker gets 10 credits for every eco destroyed.

            // Check to see whether to double the capture reward.
            let captureRewardMultiplier = this.specialistService.hasAwardDoubleCaptureRewardSpecialist(newStarPlayerCarriers);

            captureReward *= captureRewardMultiplier;

            star.ownedByPlayerId = newStarPlayer._id;
            newStarPlayer.credits += captureReward;
            star.infrastructure.economy = 0;
            star.ignoreBulkUpgrade = false; // Reset this as it has been captured by a new player.

            // TODO: If the home star is captured, find a new one?
            // TODO: Also need to consider if the player doesn't own any stars and captures one, then the star they captured should then become the home star.

            if (defenderUser) {
                defenderUser.achievements.combat.stars.lost++;
            }
            
            if (newStarUser) {
                newStarUser.achievements.combat.stars.captured++;
            }

            this.emit('onStarCaptured', {
                game,
                player: newStarPlayer,
                star,
                capturedBy: newStarPlayer,
                captureReward
            });
            
            this.emit('onStarCaptured', {
                game,
                player: defender,
                star,
                capturedBy: newStarPlayer,
                captureReward
            });
        }

        // If there are still attackers remaining, recurse.
        attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId.toString()))];

        if (attackerPlayerIds.length > 1) {
            // Get the next player to act as the defender.
            if (star) {
                player = this.playerService.getById(game, star.ownedByPlayerId);
            } else {
                player = this.playerService.getById(game, attackerPlayerIds[0]);
            }

            await this._performCombat(game, gameUsers, player, star, attackerCarriers);
        }
    }

    _loopIncrementIndex(currentIndex, arr, amount = 1) {
        currentIndex += amount;

        if (currentIndex > arr.length - 1) {
            currentIndex = 0;
        }

        currentIndex = Math.max(currentIndex, 0);

        return currentIndex;
    }

    async _decreaseReputationForCombat(game, defender, attackers) {
        // Deduct reputation for all attackers that the defender is fighting and vice versa.
        for (let attacker of attackers) {
            await this.reputationService.decreaseReputation(game, defender, attacker, false);
            await this.reputationService.decreaseReputation(game, attacker, defender, false);
        }
    }

    _tryRerouteCowardCarrier(game, carrier) {
        let isCoward = this.specialistService.getStarCombatAttackingRedirectIfDefeated(carrier);
                
        if (isCoward) {
            let redirectStar = this.waypointService.rerouteToNearestFriendlyStarFromStar(game, carrier);

            if (redirectStar) {
                return true;
            }
        }

        return false;
    }

    _endOfGalacticCycleCheck(game) {
        game.state.tick++;

        // Check if we have reached the production tick.
        if (game.state.tick % game.settings.galaxy.productionTicks === 0) {
            game.state.productionTick++;

            // For each player, perform the end of cycle actions.
            // Give each player money.
            // Conduct experiments.
            for (let i = 0; i < game.galaxy.players.length; i++) {
                let player = game.galaxy.players[i];

                let creditsResult = this.playerService.givePlayerMoney(game, player);
                let experimentResult = this.researchService.conductExperiments(game, player);

                this.emit('onPlayerGalacticCycleCompleted', {
                    game, 
                    player, 
                    creditsEconomy: creditsResult.creditsFromEconomy, 
                    creditsBanking: creditsResult.creditsFromBanking, 
                    experimentTechnology: experimentResult.technology,
                    experimentTechnologyLevel: experimentResult.level,
                    experimentAmount: experimentResult.amount
                });
            }

            this.emit('onGameGalacticCycleTicked', {
                game
            });
        }
    }

    _logHistory(game) {
        this.historyService.log(game);
    }

    async _gameLoseCheck(game, gameUsers) {
        // Check to see if anyone has been defeated.
        // A player is defeated if they have no stars and no carriers remaining.
        let isTurnBasedGame = this.gameService.isTurnBasedGame(game);
        let afkThresholdDate = moment().utc().subtract(3, 'days');
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

        for (let i = 0; i < undefeatedPlayers.length; i++) {
            let player = undefeatedPlayers[i];

            if (isTurnBasedGame) {
                // Reset whether we have sent the player a turn reminder.
                player.hasSentTurnReminder = false;

                // If the player wasn't ready when the game ticked, increase their number of missed turns.
                if (!player.ready) {
                    player.missedTurns++;
                    player.ready = true; // Bit of a bodge, this ensures that we don't keep incrementing this value every iteration.
                }
                else {
                    player.missedTurns = 0; // Reset the missed turns if the player was ready, we'll kick the player if they have missed consecutive turns only.
                }
            }

            // Check if the player has been AFK.
            // If in real time mode, check if the player has not been seen for over 48 hours.
            // OR if in turn based mode, check if the player has reached the maximum missed turn limit.
            let isAfk = moment(player.lastSeen).utc() < afkThresholdDate
                    || player.missedTurns >= game.constants.turnBased.playerMissedTurnLimit;

            if (isAfk) {
                this.playerService.setPlayerAsAfk(game, player);
            }

            // Check if the player has been defeated by conquest.
            if (!player.defeated) {
                let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

                // If there are no stars and there are no carriers then the player is defeated.
                if (stars.length === 0) {
                    let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id); // Note: This logic looks a bit weird, but its more performant.
        
                    if (carriers.length === 0) {
                        this.playerService.setPlayerAsDefeated(game, player);
                    }
                }
            }

            if (player.defeated) {
                game.state.players--; // Deduct number of active players from the game.

                let user = gameUsers.find(u => u._id.equals(player.userId));

                if (isAfk) {
                    // AFK counts as a defeat as well.
                    if (user) {
                        user.achievements.defeated++;
                        user.achievements.afk++;
                    }

                    this.emit('onPlayerAfk', {
                        game, 
                        player
                    });
                }
                else {
                    if (user) {
                        user.achievements.defeated++;
                    }

                    this.emit('onPlayerDefeated', {
                        game, 
                        player
                    });
                }
            }
        }
    }

    async _gameWinCheck(game, gameUsers) {
        let winner = this.leaderboardService.getGameWinner(game);

        if (winner) {
            this.gameService.finishGame(game, winner);

            let leaderboard = this.leaderboardService.getLeaderboardRankings(game);

            await this.leaderboardService.addGameRankings(game, gameUsers, leaderboard);

            this.emit('onGameEnded', {
                game
            });

            return true;
        }

        return false;
    }

    async _playAI(game) {
        for (let player of game.galaxy.players) {
            if (player.defeated) {
                await this.aiService.play(game, player);
            }
        }
    }

    _resetPlayersReadyStatus(game) {
        for (let player of game.galaxy.players) {
            player.ready = false;
        }
    }
}
