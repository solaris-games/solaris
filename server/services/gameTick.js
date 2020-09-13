const EventEmitter = require('events');
const moment = require('moment');

module.exports = class GameTickService extends EventEmitter {
    
    constructor(broadcastService, distanceService, starService, carrierService, 
        researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService, gameService, technologyService) {
        super();
            
        this.broadcastService = broadcastService;
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
    }

    async tick(game) {
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

        let report = {
            gameState: null,
            carriers: [],
            destroyedCarriers: [],
            stars: [],
            players: [],
            playerResearch: [],
            playerExperiments: [],
            playerGalacticCycleReport: []
        };

        let taskTime = process.hrtime();
        let taskTimeEnd = null;

        let logTime = (taskName) => {
            taskTimeEnd = process.hrtime(taskTime);
            taskTime = process.hrtime();
            console.info(`[${game.settings.general.name}] - ${taskName}: %ds %dms'`, taskTimeEnd[0], taskTimeEnd[1] / 1000000);
        };

       await this._moveCarriers(game, report);
       logTime('Move carriers and produce ships');
       await this._conductResearch(game, report);
       logTime('Conduct research');
       this._endOfGalacticCycleCheck(game, report);
       logTime('Galactic cycle check');
       this._logHistory(game, report);
       logTime('Log history');
       await this._gameLoseCheck(game, report);
       logTime('Game lose check');
       await this._gameWinCheck(game, report);
       logTime('Game win check');

       await game.save();
       logTime('Save game');

       this._broadcastReport(game, report);       
       logTime('Broadcast report');

       let endTime = process.hrtime(startTime);

       console.info(`[${game.settings.general.name}] - Game tick ended: %ds %dms'`, endTime[0], endTime[1] / 1000000);
    }

    _canTick(game) {
        let mins = game.settings.gameTime.speed;
        let lastTick = moment(game.state.lastTickDate).utc();
        let nextTick = moment(lastTick).utc().add(mins, 'm');

        return nextTick.diff(moment().utc(), 'seconds') <= 0;
    }

    async _moveCarriers(game, report) {
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
            if (carrier.orbiting) {
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
            let waypoint = carrier.waypoints[0];
            let sourceStar = game.galaxy.stars.find(s => s._id.equals(waypoint.source));
            let destinationStar = game.galaxy.stars.find(s => s._id.equals(waypoint.destination));
            let warpSpeed = sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId;
            let distancePerTick = this.carrierService.getCarrierDistancePerTick(game, carrier, warpSpeed);

            if (carrier.distanceToDestination <= distancePerTick) {
                carrier.inTransitFrom = null;
                carrier.inTransitTo = null;
                carrier.orbiting = destinationStar._id;
                carrier.location = destinationStar.location;

                // Remove the current waypoint as we have arrived at the destination.
                let currentWaypoint = carrier.waypoints.splice(0, 1)[0];

                // Append it to the array of action waypoints so that we can deal with it after combat.
                actionWaypoints.push({
                    star: destinationStar,
                    carrier,
                    waypoint: currentWaypoint
                });

                // If the carrier waypoints are looped then append the
                // carrier waypoint back onto the waypoint stack.
                if (carrier.waypointsLooped) {
                    carrier.waypoints.push(currentWaypoint);
                }

                // If the star is unclaimed, then claim it.
                if (destinationStar.ownedByPlayerId == null) {
                    destinationStar.ownedByPlayerId = carrier.ownedByPlayerId;

                    // Weird scenario, but could happen.
                    if (carrier.isGift) {
                        carrier.isGift = false;
                    }

                    let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));

                    let playerUser = await this.userService.getById(carrierPlayer.userId);
                    playerUser.achievements.combat.stars.captured++;
                    await playerUser.save();
                }

                // If the star is owned by another player, then perform combat.
                if (!destinationStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)) {
                    // If the carrier is a gift, then transfer the carrier ownership to the star owning player.
                    // Otherwise, perform combat.
                    if (carrier.isGift) {
                        carrier.ownedByPlayerId = destinationStar.ownedByPlayerId;
                        carrier.isGift = false;
                    } else {
                        if (combatStars.indexOf(destinationStar) < 0) {
                            combatStars.push(destinationStar);
                        }
                    }
                }

                // The star has been affected by the game tick so append it to the report
                // NOTE: We will get the data for it later at the end of the tick.
                report.stars.push(destinationStar._id);
            }
            // Otherwise, move X distance in the direction of the star.
            else {
                let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

                carrier.location = nextLocation;
            }
        }

        // 3. Now that all carriers have finished moving, perform combat.
        for (let i = 0; i < combatStars.length; i++) {
            let combatStar = combatStars[i];

            // Get all carriers orbiting the star and perform combat.
            let carriersAtStar = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.equals(combatStar._id));

            await this._performCombatAtStar(game, combatStar, carriersAtStar, report);
        }

        // There may be carriers in the waypoint list that do not have any remaining ships, filter them out.
        actionWaypoints = actionWaypoints.filter(x => x.carrier.ships > 0);

        // 4a. Now that combat is done, perform any carrier waypoint actions.
        // Do the drops first
        this._performWaypointActionsDrops(game, actionWaypoints);

        // 4b. Build ships at star.
        this._produceShips(game, report);

        // 4c. Do the rest of the waypoint actions.
        this._performWaypointActionsCollects(game, actionWaypoints);
        this._performWaypointActionsGarrisons(game, actionWaypoints);
    }

    _performWaypointActions(game, actionWaypoints) {
        for (let actionWaypoint of actionWaypoints) {
            this.waypointService.performWaypointAction(actionWaypoint.carrier, actionWaypoint.star, actionWaypoint.waypoint);
        }
    }

    _performFilteredWaypointActions(game, waypoints, waypointTypes) {
        let actionWaypoints = waypoints.filter(w => waypointTypes.indexOf(w.waypoint.action) > -1);

        this._performWaypointActions(game, actionWaypoints);
    }

    _performWaypointActionsDrops(game, waypoints) {
        this._performFilteredWaypointActions(game, waypoints, ['dropAll', 'drop', 'dropAllBut']);
    }

    _performWaypointActionsCollects(game, waypoints) {
        this._performFilteredWaypointActions(game, waypoints, ['collectAll', 'collect', 'collectAllBut']);
    }

    _performWaypointActionsGarrisons(game, waypoints) {
        this._performFilteredWaypointActions(game, waypoints, ['garrison']);
    }

    async _performCombatAtStar(game, star, carriers, report) {
        // Get all defender carriers ordered by most carriers present descending.
        // Carriers who have the most ships will be target first in combat.
        let defenderCarriers = carriers
                                .filter(c => c.ownedByPlayerId.equals(star.ownedByPlayerId))
                                .sort((a, b) => b.ships - a.ships);

        // Get all attacker carriers.
        let attackerCarriers = carriers
                                .filter(c => !c.ownedByPlayerId.equals(star.ownedByPlayerId))
                                .sort((a, b) => b.ships - a.ships);

        // Get the players for the defender and all attackers.
        let attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId.toString()))];

        let defender = this.playerService.getByObjectId(game, star.ownedByPlayerId);
        let attackers = attackerPlayerIds.map(playerId => this.playerService.getById(game, playerId));

        let defenderUser = await this.userService.getById(defender.userId);
        let attackerUsers = [];
        
        for (let attacker of attackers) {
            let attackerUser = await this.userService.getById(attacker.userId);
            attackerUsers.push(attackerUser);
        }

        const getCarrierUser = (carrier, players, users) => {
            let player = players.find(p => carrier.ownedByPlayerId.equals(p._id));

            return users.find(u => u._id.toString() === player.userId.toString());
        };

        // Perform combat at the star.
        let combatResult = this.combatService.calculateStar(game, star, defender, attackers, defenderCarriers, attackerCarriers);
        
        // Add all of the carriers to the combat result with a snapshot of
        // how many ships they had before combat occurs.
        // We will update this as we go along with combat.
        combatResult.carriers = carriers.map(c => {
            return {
                _id: c._id,
                name: c.name,
                ownedByPlayerId: c.ownedByPlayerId,
                before: c.ships,
                lost: 0,
                after: c.ships
            };
        });

        // Do the same with the star.
        combatResult.star = {
            _id: star._id,
            before: Math.floor(star.garrisonActual),
            lost: 0,
            after: Math.floor(star.garrisonActual)
        };

        // Add combat result stats to defender achievements.
        defenderUser.achievements.combat.losses.ships += combatResult.lost.defender;
        defenderUser.achievements.combat.kills.ships += combatResult.lost.attacker;
        
        // Using the combat result, iterate over all of the defenders and attackers
        // and deduct from each ship/carrier until combat has been resolved.

        // Start with the attackers because its easier.
        let attackersKilled = combatResult.lost.attacker;
        let attackerCarrierIndex = 0;

        while (attackersKilled--) {
            let attackerCarrier = attackerCarriers[attackerCarrierIndex];
            let combatCarrier = combatResult.carriers.find(c => c._id.equals(attackerCarrier._id));

            attackerCarrier.ships--;
            combatCarrier.after--;
            combatCarrier.lost++;

            // Deduct ships lost from attacker.
            let attackerUser = getCarrierUser(attackerCarrier, attackers, attackerUsers);

            attackerUser.achievements.combat.losses.ships++;

            // If the carrier has been destroyed, remove it from the game.
            if (!attackerCarrier.ships) {
                game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(attackerCarrier), 1);

                report.destroyedCarriers.push(attackerCarrier._id);
                
                attackerCarriers.splice(attackerCarrierIndex, 1);
                attackerCarrierIndex--;

                attackerUser.achievements.combat.losses.carriers++;
                defenderUser.achievements.combat.kills.carriers++;
            }

            attackerCarrierIndex++;

            if (attackerCarrierIndex > attackerCarriers.length - 1) {
                attackerCarrierIndex = 0;
            }
        }

        // Now do the same for the defender.
        let defendersKilled = combatResult.lost.defender;
        let defenderCarrierIndex = 0;

        while (defendersKilled--) {
            let defenderShipKilled = false;

            // Decide whether to attack the star or the carrier.
            if (defenderCarrierIndex === -1) {
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

                    report.destroyedCarriers.push(defenderCarrier._id);
                    
                    defenderCarriers.splice(defenderCarrierIndex, 1);
                    defenderCarrierIndex--;

                    defenderUser.achievements.combat.losses.carriers++;

                    // Add carriers killed to attackers.
                    for (let attackerUser of attackerUsers) {
                        attackerUser.achievements.combat.kills.carriers++;
                    }
                }
            } else {
                defendersKilled++; // Nothing happened so keep looping.
            }

            if (defenderShipKilled) {
                // Add ships killed to attackers.
                for (let attackerUser of attackerUsers) {
                    attackerUser.achievements.combat.kills.ships++;
                }
            }

            defenderCarrierIndex++;

            if (defenderCarrierIndex > defenderCarriers.length - 1) {
                defenderCarrierIndex = -1;
            }
        }

        // If the defender has been eliminated then the attacker who travelled the shortest distance in the last tick
        // captures the star. Repeat star combat until there is only one player remaining.
        let defenderDefeated = !Math.floor(star.garrisonActual) && !defenderCarriers.length;

        if (defenderDefeated) {
            let closestPlayerId = attackerCarriers.sort((a, b) => a.distanceToDestination - b.distanceToDestination)[0].ownedByPlayerId;

            // Capture the star.
            let newStarPlayer = attackers.find(p => p._id.equals(closestPlayerId));
            let newStarUser = attackerUsers.find(u => u._id.toString() === newStarPlayer.userId.toString());

            let captureReward = star.infrastructure.economy * 10; // Attacker gets 10 credits for every eco destroyed.

            star.ownedByPlayerId = newStarPlayer._id;
            newStarPlayer.credits += captureReward;
            star.infrastructure.economy = 0;

            // TODO: If the home star is captured, find a new one?
            // TODO: Also need to consider if the player doesn't own any stars and captures one, then the star they captured should then become the home star.

            defenderUser.achievements.combat.stars.lost++;
            newStarUser.achievements.combat.stars.captured++;

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

        // Log the combat event
        this.emit('onPlayerCombatStar', {
            game,
            defender,
            attackers,
            star,
            combatResult
        });

        // Save user profile achievements.
        await defenderUser.save();

        for (let attackerUser of attackerUsers) {
            await attackerUser.save();
        }

        // If there are still attackers remaining, recurse.
        attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId.toString()))];

        if (attackerPlayerIds.length > 1) {
            await this._performCombatAtStar(game, star, attackerCarriers, report);
        }
    }

    _produceShips(game, report) {
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = game.galaxy.stars[i];

            if (star.ownedByPlayerId) {
                let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
    
                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.garrisonActual += this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, star.infrastructure.industry);
                star.garrison = Math.floor(star.garrisonActual);

                // If the star isn't already in the report, add it.
                if (!report.stars.find(s => s.equals(star._id))) {
                    report.stars.push(star._id);
                }
            }
        }
    }

    async _conductResearch(game, report) {
        // Add the current level of experimentation to the current 
        // tech being researched.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            // TODO: Defeated players do not conduct research or experiments?
            if (player.defeated) {
                continue;
            }
            
            let researchReport = await this.researchService.conductResearch(game, player);

            researchReport.playerId = player._id;

            report.playerResearch.push(researchReport);
        }
    }

    _endOfGalacticCycleCheck(game, report) {
        game.state.tick++;

        // Check if we have reached the production tick.
        if (game.state.tick % game.settings.galaxy.productionTicks === 0) {
            game.state.productionTick++;

            // For each player, perform the end of cycle actions.
            // Give each player money.
            // Conduct experiments.
            for (let i = 0; i < game.galaxy.players.length; i++) {
                let player = game.galaxy.players[i];

                // TODO: Defeated players do not conduct research or experiments?
                if (player.defeated) {
                    continue;
                }
                
                let creditsResult = this._givePlayerMoney(game, player);
                let experimentResult = this._conductExperiments(game, player, report);

                this.emit('onPlayerGalacticCycleCompleted', {
                    game, 
                    player, 
                    creditsEconomy: creditsResult.creditsFromEconomy, 
                    creditsBanking: creditsResult.creditsFromBanking, 
                    experimentTechnology: experimentResult.technology,
                    experimentTechnologyLevel: experimentResult.level,
                    experimentAmount: experimentResult.amount
                });

                report.playerGalacticCycleReport.push({
                    playerId: player._id,
                    credits: creditsResult.creditsTotal,
                    experimentTechnology: experimentResult.technology,
                    experimentTechnologyLevel: experimentResult.level
                });
            }

            this.emit('onGameGalacticCycleTicked', {
                game
            });
        }
    }

    _givePlayerMoney(game, player) {
        let effectiveTechs = this.technologyService.getPlayerEffectiveTechnologyLevels(game, player);
        let totalEco = this.playerService.calculateTotalEconomy(player, game.galaxy.stars);

        let creditsFromEconomy = totalEco * 10;
        let creditsFromBanking = effectiveTechs.banking * 75;
        let creditsTotal = creditsFromEconomy + creditsFromBanking;

        player.credits += creditsTotal;

        return {
            creditsFromEconomy,
            creditsFromBanking,
            creditsTotal
        };
    }

    _conductExperiments(game, player, report) {
        let experimentReport = this.researchService.conductExperiments(game, player);

        experimentReport.playerId = player._id;

        report.playerExperiments.push(experimentReport);

        return experimentReport;
    }

    _logHistory(game) {
        this.historyService.log(game);
    }

    async _gameLoseCheck(game, report) {
        // Check to see if anyone has been defeated.
        // A player is defeated if they have no stars and no carriers remaining.
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated)

        for (let i = 0; i < undefeatedPlayers.length; i++) {
            let player = undefeatedPlayers[i];

            // Check if the player has been AFK for over 48 hours.
            let isAfk = moment(player.lastSeen).utc() < moment().utc().subtract(2, 'days');

            if (isAfk) {
                player.defeated = true;
                player.afk = true;
            }

            // Check if the player has been defeated by conquest.
            if (!player.defeated) {
                let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
                let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);
    
                player.defeated = stars.length === 0 && carriers.length === 0;
            }

            if (player.defeated) {
                game.state.players--; // Deduct number of active players from the game.

                let user = await this.userService.getById(player.userId);

                if (isAfk) {
                    // AFK counts as a defeat as well.
                    user.achievements.defeated++;
                    user.achievements.afk++;

                    this.emit('onPlayerAfk', {
                        game, 
                        player
                    });
                }
                else {
                    user.achievements.defeated++;

                    this.emit('onPlayerDefeated', {
                        game, 
                        player
                    });
                }

                await user.save();
            }
        }
    }

    async _gameWinCheck(game) {
        let winner = this.leaderboardService.getGameWinner(game);

        if (winner) {
            this.gameService.finishGame(game, winner);

            let leaderboard = this.leaderboardService.getLeaderboardRankings(game);

            await this.leaderboardService.addGameRankings(leaderboard);

            this.emit('onGameEnded', {
                game
            });
        }
    }

    _broadcastReport(game, report) {
        // Get all players who are connected to the server.
        let broadcastPlayers = game.galaxy.players.filter(p =>
            this.broadcastService.playerRoomExists(p));

        // If there are no players to broadcast to, then
        // there is no point creating the game tick report.
        if (broadcastPlayers.length) {
            this._appendReportGameState(game, report);
            this._appendReportCarriers(game, report);
            this._appendReportStars(game, report);
            this._appendReportPlayers(game, report);
     
            for (let player of broadcastPlayers) {
                this._broadcastReportToPlayer(game, report, player);
            }
        }
    }

    _appendReportGameState(game, report) {
        report.gameState = {
            lastTickDate: game.state.lastTickDate,
            paused: game.state.paused,
            players: game.state.players,
            productionTick: game.state.productionTick,
            tick: game.state.tick,
            endDate: game.state.endDate,
            winner: game.state.winner
        };
    }

    _appendReportCarriers(game, report) {
        // The report for the carriers will contain all carriers
        // and fields that could have changed in the tick.
        report.carriers = game.galaxy.carriers
        .map(carrier => {
            return {
                _id: carrier._id,
                ownedByPlayerId: carrier.ownedByPlayerId,
                orbiting: carrier.orbiting,
                inTransitFrom: carrier.inTransitFrom,
                inTransitTo: carrier.inTransitTo,
                ships: carrier.ships,
                location: carrier.location,
                waypoints: carrier.waypoints,
                name: carrier.name, // Include the name because carriers can go in and out of scanning range.
                isGift: carrier.isGift // Carriers may have been successfully gifted.
            };
        });
    }

    _appendReportStars(game, report) {
        let starsData = [];

        for (let starId of report.stars) {
            let star = this.starService.getByObjectId(game, starId);

            // Add everything that could have changed
            starsData.push({
                _id: star._id,
                ownedByPlayerId: star.ownedByPlayerId,
                garrison: star.garrison,
                infrastructure: star.infrastructure
            });
        }

        report.stars = starsData;
    }

    _appendReportPlayers(game, report) {
        for (let player of game.galaxy.players) {
            report.players.push({
                _id: player._id,
                defeated: player.defeated,
                afk: player.afk,
                stats: this.playerService.getStats(game, player)
            });
        }
    }

    _broadcastReportToPlayer(game, report, player) {
        let playerReport = JSON.parse(JSON.stringify(report)); // Clone the original report.

        // Get the end of galactic cycle report for the player if there is one.
        playerReport.playerGalacticCycleReport = report.playerGalacticCycleReport.find(r => r.playerId.equals(player._id)) || null;

        // Calculate which players are in scanning range.
        let playersInRange = this.playerService.getPlayersWithinScanningRangeOfPlayer(game, player);

        playerReport.players.forEach(p => {
            p.isInScanningRange = playersInRange.find(x => x._id.toString() === p._id) != null;
        });

        // Perform a filter on the report stars, if the star is out of range
        // then only return basic info.
        let starsInRange = this.starService.filterStarsByScanningRange(game, player);

        playerReport.stars = playerReport.stars.map(s => {
            let isInRange = starsInRange.find(x => x._id.equals(s._id)) != null;

            if (isInRange) {
                return s;
            }

            return {
                _id: s._id,
                ownedByPlayerId: s.ownedByPlayerId
            }
        });

        // Filter out any carriers that are out of scanning range.
        let carriersInRange = this.carrierService.filterCarriersByScanningRange(game, player);

        playerReport.carriers = playerReport.carriers
        .filter(c => {
            return carriersInRange.find(x => x._id.equals(c._id)) != null;
        })
        .map(c => {
            // If the carrier does not belong to the player and the carrier has waypoints
            // then only return the first waypoint.
            if (c.ownedByPlayerId !== player.id) {
                c.waypoints = this.carrierService.clearCarrierWaypointsNonTransit(c, true);
            }

            // The waypoint ETAs may have changed so make sure that they are updated.
            this.waypointService.populateCarrierWaypointEta(game, c);

            return c;
        });

        // Filter out other player's research progress.
        playerReport.playerResearch = playerReport.playerResearch
            .filter(r => r.playerId === player.id || r.levelUp) // Get the player report or any other reports that have leveled up.
            .map(r => {
                if (r.playerId !== player.id) {
                    delete r.progress; // Remove the progress if it isn't the current player.
                    delete r.currentResearchTicksEta;
                }
                
                return r;
            });

        // Filter out other player's experiments
        playerReport.playerExperiments = playerReport.playerExperiments
            .filter(r => r.playerId === player.id || r.levelUp) // Get the player report or any other reports that have leveled up.
            .map(r => {
                if (r.playerId !== player.id) {
                    delete r.progress; // Remove the new research progress if it isn't the current player.
                    delete r.amount; // Remove the experiment amount if it isn't the current player.
                    delete r.currentResearchTicksEta;
                }
                
                return r;
            });

        this.broadcastService.gameTick(game, player._id, playerReport);
    }
}