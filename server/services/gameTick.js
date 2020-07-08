const moment = require('moment');

module.exports = class GameTickService {
    
    constructor(eventService, broadcastService, distanceService, starService, carrierService, 
        researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService) {
        this.eventService = eventService;
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

       if (!this._canTick(game)) {
           return;
       }

       game.state.lastTickDate = moment();
       game.state.nextTickDate = moment().add(game.settings.gameTime.speed, 'm'); // TODO: Do we really need to do this?

       await this._moveCarriers(game);
       this._produceShips(game);
       await this._conductResearch(game);
       await this._endOfGalacticCycleCheck(game);
       this._logHistory(game);
       await this._gameLoseCheck(game);
       await this._gameWinCheck(game);

       await game.save();

       this.broadcastService.gameTick(game);
    }

    _canTick(game) {
        let mins = game.settings.gameTime.speed;
        let lastTick = moment(game.state.lastTickDate);
        let nextTick = moment(lastTick).add(mins, 'm');

        return nextTick.diff(now, 'seconds') <= 0;
    }

    async _moveCarriers(game) {
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
            let distancePerTick = game.constants.distances.shipSpeed;
    
            let carrier = carriers[i];
            let waypoint = carrier.waypoints[0];
            let sourceStar = game.galaxy.stars.find(s => s._id.equals(waypoint.source));
            let destinationStar = game.galaxy.stars.find(s => s._id.equals(waypoint.destination));

            // If we are travelling to and from a warp gate, then we
            // travel 3 times faster.
            if (sourceStar.warpGate && destinationStar.warpGate
                && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
                distancePerTick *= 3;
            }

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

                // TODO: Looping

                // If the star is unclaimed, then claim it.
                if (destinationStar.ownedByPlayerId == null) {
                    destinationStar.ownedByPlayerId = carrier.ownedByPlayerId;

                    let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));

                    let playerUser = await this.userService.getById(carrierPlayer.userId);
                    playerUser.achievements.combat.stars.captured++;
                    await playerUser.save();
                }

                // If the star is owned by another player, then perform combat.
                if (!destinationStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)) {
                    combatStars.push({
                        star: destinationStar,
                        carrier
                    });
                }
            }
            // Otherwise, move X distance in the direction of the star.
            else {
                let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

                carrier.location = nextLocation;
            }
        }

        // 3. Now that all carriers have finished moving, perform combat.
        for (let i = 0; i < combatStars.length; i++) {
            let combat = combatStars[i];

            await this._performCombatAtStar(game, combat.star, combat.carrier);
        }

        // There may be carriers in the waypoint list that do not have any remaining ships, filter them out.
        actionWaypoints = actionWaypoints.filter(x => x.carrier.ships > 0);

        // 4. Now that combat is done, perform any carrier waypoint actions.
        this._performWaypointActions(game, actionWaypoints);
    }

    _performWaypointActions(game, actionWaypoints) {
        // TODO: Order the waypoints by action, so that drops occur before collects.
        for (let i = 0; i < actionWaypoints.length; i++) {
            let actionWaypoint = actionWaypoints[i];

            this.waypointService.performWaypointAction(actionWaypoint.carrier, 
                actionWaypoint.star, actionWaypoint.waypoint);
        }
    }

    async _performCombatAtStar(game, star, enemyCarrier) {
        let defender = this.playerService.getByObjectId(game, star.ownedByPlayerId);
        let attacker = this.playerService.getByObjectId(game, enemyCarrier.ownedByPlayerId);

        let defenderUser = await this.userService.getById(defender.userId);
        let attackerUser = await this.userService.getById(attacker.userId);

        // There may be multiple carriers at this star, we will attack
        // carriers in order of largest carrier first to smallest last
        // until there are no carriers left, in which case we attack the star
        // directly.
        let friendlyCarriers = game.galaxy.carriers
            .filter(c => c.orbiting && c.orbiting.equals(star._id) && c.ownedByPlayerId.equals(defender._id))
            .sort((a, b) => b.ships - a.ships);

        // Perform carrier to carrier combat.
        for (let i = 0; i < friendlyCarriers.length; i++) {
            let friendlyCarrier = friendlyCarriers[i];

            let combatResult = this.combatService.calculate({
                weaponsLevel: defender.research.weapons.level,
                ships: friendlyCarrier.ships
            }, {
                weaponsLevel: attacker.research.weapons.level,
                ships: enemyCarrier.ships
            });
            
            friendlyCarrier.ships = combatResult.after.defender;
            enemyCarrier.ships = combatResult.after.attacker;

            defenderUser.achievements.kills.ships += combatResult.lost.attacker;
            attackerUser.achievements.kills.ships += combatResult.lost.defender;

            // Log the combat event
            await this.eventService.createPlayerCombatCarrierEvent(game, defender, attacker,
                star, friendlyCarrier, enemyCarrier, combatResult);

            // Destroy carriers if they have no ships left.
            if (friendlyCarrier.ships <= 0) {
                game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(friendlyCarrier), 1);

                defenderUser.achievements.losses.carriers++;
                attackerUser.achievements.kills.carriers++;
            }

            // If the enemy carrier has no ships, then carrier to carrier combat is finished.
            if (enemyCarrier.ships <= 0) {
                defenderUser.achievements.kills.carriers++;
                attackerUser.achievements.losses.carriers++;
                break;
            }
        }

        // Perform star to carrier combat if there is a garrison at the star
        // and the enemy carrier has ships remaining.
        let starGarrison = Math.floor(star.garrisonActual);

        if (starGarrison && enemyCarrier.ships) {
            let starGarrisonFraction = star.garrisonActual - starGarrison; // Save the fractional amount of ships so we can add it back on after combat.

            let starCombatResult = this.combatService.calculate({
                weaponsLevel: defender.research.weapons.level,
                ships: starGarrison
            }, {
                weaponsLevel: attacker.research.weapons.level,
                ships: enemyCarrier.ships
            });

            star.garrisonActual = starCombatResult.after.defender + starGarrisonFraction;
            star.garrison = Math.floor(star.garrisonActual);

            defenderUser.achievements.kills.ships += starCombatResult.lost.attacker;
            attackerUser.achievements.kills.ships += starCombatResult.lost.defender;

            // Log the combat event
            await this.eventService.createPlayerCombatStarEvent(game, defender, attacker,
                star, enemyCarrier, starCombatResult);
        }

        // If the enemy carrier has no ships, then destroy the attacking carrier.
        if (enemyCarrier.ships <= 0) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(enemyCarrier), 1);

            defenderUser.achievements.kills.carriers++;
            attackerUser.achievements.losses.carriers++;
        }

        // If the star has no garrison and no defenders, then the attacker has won.
        let defendersRemaining = friendlyCarriers.reduce((sum, c) => sum += c.ships, 0);

        if (defendersRemaining <= 0 && star.garrisonActual <= 0) {
            let captureReward = star.infrastructure.economy * 10; // Attacker gets 10 credits for every eco destroyed.

            star.ownedByPlayerId = enemyCarrier.ownedByPlayerId;
            attacker.credits += captureReward;
            star.infrastructure.economy = 0;

            // TODO: If the home star is captured, find a new one?
            // TODO: Also need to consider if the player doesn't own any stars and captures one, then the star they captured should then become the home star.

            defenderUser.achievements.combat.stars.lost++;
            attackerUser.achievements.combat.stars.captured++;

            await this.eventService.createStarCapturedEvent(game, attacker, star, captureReward);
            await this.eventService.createStarCapturedEvent(game, defender, star, captureReward);
        }

        await defenderUser.save();
        await attackerUser.save();
    }

    _produceShips(game) {
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = game.galaxy.stars[i];

            if (star.ownedByPlayerId) {
                let player = this.playerService.getByObjectId(game, star.ownedByPlayerId);
    
                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.garrisonActual += this.starService.calculateStarShipsByTicks(player.research.manufacturing.level, star.infrastructure.industry);
                star.garrison = Math.floor(star.garrisonActual);
            }
        }
    }

    async _conductResearch(game) {
        // Add the current level of experimentation to the current 
        // tech being researched.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            // TODO: Defeated players do not conduct research or experiments?
            if (player.defeated) {
                continue;
            }
            
            await this.researchService.conductResearch(game, player);
        }
    }

    async _endOfGalacticCycleCheck(game) {
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
                let experimentResult = await this._conductExperiments(game, player);

                await this.eventService.createPlayerGalacticCycleCompleteEvent(game, player,
                    creditsResult.creditsFromEconomy, creditsResult.creditsFromBanking,
                    experimentResult.technology, experimentResult.amount);
            }

            // Set the next production tick date.
            game.state.nextProductionTickDate = moment(game.state.lastTickDate).add(game.settings.gameTime.speed * game.settings.galaxy.productionTicks, 'm');
        }
    }

    _givePlayerMoney(game, player) {
        let totalEco = this.playerService.calculateTotalEconomy(player, game.galaxy.stars);

        let creditsFromEconomy = totalEco * 10;
        let creditsFromBanking = player.research.banking.level * 75;
        let creditsTotal = creditsFromEconomy + creditsFromBanking;

        player.credits += creditsTotal;

        return {
            creditsFromEconomy,
            creditsFromBanking
        };
    }

    async _conductExperiments(game, player) {
        return await this.researchService.conductExperiments(game, player);
    }

    _logHistory(game) {
        this.historyService.log(game);
    }

    async _gameLoseCheck(game) {
        // Check to see if anyone has been defeated.
        // A player is defeated if they have no stars and no carriers remaining.
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated)

        for (let i = 0; i < undefeatedPlayers.length; i++) {
            let player = undefeatedPlayers[i];

            // Check if the player has been AFK for over 48 hours.
            let isAfk = moment(player.lastSeen) > moment().subtract(2, 'days');

            player.defeated = !isAfk;
            player.afk = isAfk;

            // Check if the player has been defeated by conquest.
            if (!player.defeated) {
                let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
                let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);
    
                player.defeated = stars.length === 0 && carriers.length === 0;
            }

            if (player.defeated) {
                let user = await this.userService.getById(player.userId);

                if (isAfk) {
                    // AFK counts as a defeat as well.
                    user.achievements.defeated++;
                    user.achievements.afk++;
                    await this.eventService.createPlayerAfkEvent(game, player);
                }
                else {
                    user.achievements.defeated++;
                    await this.eventService.createPlayerDefeatedEvent(game, player);
                }

                await user.save();
            }
        }
    }

    async _gameWinCheck(game) {
        // Check to see if anyone has won the game.
        // There could be more than one player who has reached
        // the number of stars required at the same time.
        // In this case we pick the player who has the most ships.
        // If that's equal, then pick the player who has the most carriers.
        let winner = null;
    
        let leaderboard = this.leaderboardService.getLeaderboardRankings(game);

        let starWinners = leaderboard
            .filter(p => !p.player.defeated && p.stats.totalStars >= game.state.starsForVictory)
            .map(p => p.player);

        if (starWinners.length) {
            winner = starWinners[0];
        }

        // If there are no players who have reached required star count, then check if 
        // there are any players who are last man standing.
        if (!winner) {
            let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

            if (undefeatedPlayers.length === 1) {
                winner = undefeatedPlayers[0];
            }
        }

        if (winner) {
            game.state.paused = true;
            game.state.endDate = new Date();
            game.state.winner = winner._id;

            await this.leaderboardService.addGameRankings(leaderboard);
            await this.eventService.createGameEndedEvent(game);
        }
    }
}