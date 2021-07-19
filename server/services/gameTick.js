const EventEmitter = require('events');
const moment = require('moment');

module.exports = class GameTickService extends EventEmitter {
    
    constructor(distanceService, starService, carrierService, 
        researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService, gameService, technologyService,
        specialistService, starUpgradeService, reputationService, aiService, emailService, battleRoyaleService) {
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
        this.emailService = emailService;
        this.battleRoyaleService = battleRoyaleService;
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
            game.state.tick++;
    
            logTime(`Tick ${game.state.tick}`);

            await this._combatCarriers(game, gameUsers);
            logTime('Combat carriers');

            await this._moveCarriers(game, gameUsers);
            logTime('Move carriers and produce ships');

            await this._endOfGalacticCycleCheck(game);
            logTime('Galactic cycle check');

            await this._gameLoseCheck(game, gameUsers);
            logTime('Game lose check');

            let hasWinner = await this._gameWinCheck(game, gameUsers);
            logTime('Game win check');

            await this._playAI(game);
            logTime('AI controlled players turn');
            
            await this.researchService.conductResearchAll(game, gameUsers);
            logTime('Conduct research');

            this._awardCreditsPerTick(game);
            logTime('Award tick credits from specialists');

            await this._logHistory(game);
            logTime('Log history');

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

    canTick(game) {
        // Cannot perform a game tick on a locked, paused or completed game.
        if (game.state.locked || game.state.paused || game.state.endDate) {
            return false;
        }

        // Cannot perform a game tick as this game has not yet started.
        if (moment(game.state.startDate).utc().diff(moment().utc()) > 0) {
            return false;
        }

        let lastTick = moment(game.state.lastTickDate).utc();
        let nextTick;
        
        if (this.gameService.isRealTimeGame(game)) {
            // If in real time mode, then calculate when the next tick will be and work out if we have reached that tick.
            nextTick = moment(lastTick).utc().add(game.settings.gameTime.speed, 'seconds');
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

                // Note: There should never be a scenario where a carrier is travelling to a
                // destroyed star.
                let distanceToDestinationCurrent = this.distanceService.getDistanceBetweenLocations(c.location, destinationStar.location);
                let distanceToDestinationNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, destinationStar.location);

                let distanceToSourceCurrent,
                    distanceToSourceNext;

                // TODO: BUG: Its possible that a carrier is travelling from a star that has been destroyed
                // and is no longer in the game, this will cause carrier to carrier combat to be actioned.
                // RESOLUTION: Ideally store the source and destination locations instead of a reference to the stars
                // and then we still have a reference to the location of the now destroyed star.
                if (sourceStar) {
                    distanceToSourceCurrent = this.distanceService.getDistanceBetweenLocations(c.location, sourceStar.location);
                    distanceToSourceNext = this.distanceService.getDistanceBetweenLocations(locationNext.location, sourceStar.location);
                } else {
                    distanceToSourceCurrent = 0;
                    distanceToSourceNext = distanceToSourceCurrent + locationNext.distance;
                }

                return {
                    carrier: c,
                    source: waypoint.source,
                    destination: waypoint.destination,
                    locationCurrent: c.location,
                    locationNext: locationNext.location,
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

            // Filter any carriers that avoid carrier-to-carrier combat.
            collisionCarriers = this._filterAvoidCarrierToCarrierCombatCarriers(collisionCarriers);

            if (!collisionCarriers.length) {
                continue;
            }

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

            this.combatService.performCombat(game, gameUsers, friendlyPlayer, null, combatCarriers);
        }
    }

    _filterAvoidCarrierToCarrierCombatCarriers(carriers) {
        return carriers.filter(c => {
            let specialist = this.specialistService.getByIdCarrier(c.carrier.specialistId);

            if (specialist && specialist.modifiers && specialist.modifiers.special 
                && specialist.modifiers.special.avoidCombatCarrierToCarrier) {
                return false;
            }

            return true;
        });
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

            this.combatService.performCombat(game, gameUsers, starOwningPlayer, combatStar, carriersAtStar);
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

    async _endOfGalacticCycleCheck(game) {
        // Check if we have reached the production tick.
        if (game.state.tick % game.settings.galaxy.productionTicks === 0) {
            game.state.productionTick++;

            // For each player, perform the end of cycle actions.
            // Give each player money.
            // Conduct experiments.
            for (let i = 0; i < game.galaxy.players.length; i++) {
                let player = game.galaxy.players[i];

                let creditsResult = this.playerService.givePlayerCreditsEndOfCycleRewards(game, player);
                let experimentResult = this.researchService.conductExperiments(game, player);
                let carrierUpkeepResult = this.playerService.deductCarrierUpkeepCost(game, player);

                this.emit('onPlayerGalacticCycleCompleted', {
                    gameId: game._id,
                    gameTick: game.state.tick,
                    player, 
                    creditsEconomy: creditsResult.creditsFromEconomy, 
                    creditsBanking: creditsResult.creditsFromBanking,
                    creditsSpecialists: creditsResult.creditsFromSpecialistsTechnology,
                    experimentTechnology: experimentResult.technology,
                    experimentTechnologyLevel: experimentResult.level,
                    experimentAmount: experimentResult.amount,
                    carrierUpkeep: carrierUpkeepResult
                });
            }

            // Destroy stars for battle royale mode.
            if (game.settings.general.mode === 'battleRoyale') {
                this.battleRoyaleService.performBattleRoyaleTick(game);
            }

            await this.emailService.sendGameCycleSummaryEmail(game);
        }
    }

    async _logHistory(game) {
        await this.historyService.log(game);
    }

    async _gameLoseCheck(game, gameUsers) {
        // Check to see if anyone has been defeated.
        // A player is defeated if they have no stars and no carriers remaining.
        let isTurnBasedGame = this.gameService.isTurnBasedGame(game);
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

        for (let i = 0; i < undefeatedPlayers.length; i++) {
            let player = undefeatedPlayers[i];

            this.playerService.performDefeatedOrAfkCheck(game, player, isTurnBasedGame);

            if (player.defeated) {
                game.state.players--; // Deduct number of active players from the game.

                let user = gameUsers.find(u => u._id.equals(player.userId));

                if (player.afk) {
                    // Keep a log of players who have been afk so they cannot rejoin.
                    game.afkers.push(player.userId);
            
                    // AFK counts as a defeat as well.
                    if (user) {
                        user.achievements.defeated++;
                        user.achievements.afk++;
                    }

                    this.emit('onPlayerAfk', {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        player
                    });
                }
                else {
                    if (user) {
                        user.achievements.defeated++;
                    }

                    this.emit('onPlayerDefeated', {
                        gameId: game._id,
                        gameTick: game.state.tick,
                        player
                    });
                }
            }
        }

        this.gameService.updateStatePlayerCount(game);
    }

    async _gameWinCheck(game, gameUsers) {
        let winner = this.leaderboardService.getGameWinner(game);

        if (winner) {
            this.gameService.finishGame(game, winner);

            // There must have been at least 1 production ticks in order for
            // rankings to be added to players. This is to slow down players
            // should they wish to cheat the system.
            if (game.state.productionTick > 0) {
                let leaderboard = this.leaderboardService.getLeaderboardRankings(game);
    
                await this.leaderboardService.addGameRankings(game, gameUsers, leaderboard);
            }

            await this.emailService.sendGameFinishedEmail(game);

            this.emit('onGameEnded', {
                gameId: game._id,
                gameTick: game.state.tick
            });

            return true;
        }

        return false;
    }

    async _playAI(game) {
        for (let player of game.galaxy.players.filter(p => p.defeated)) {
            await this.aiService.play(game, player);
        }
    }

    _resetPlayersReadyStatus(game) {
        for (let player of game.galaxy.players) {
            player.ready = false;
        }
    }

    _awardCreditsPerTick(game) {
        for (let player of game.galaxy.players) {
            let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
                                .filter(s => !this.starService.isDeadStar(s));

            for (let star of playerStars) {
                let creditsByScience = this.specialistService.getCreditsPerTickByScience(star);

                player.credits += creditsByScience * star.infrastructure.science;
            }
        }
    }
}
