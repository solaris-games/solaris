module.exports = class GameTickService {
    
    constructor(distanceService, starService, researchService, playerService) {
        this.distanceService = distanceService;
        this.starService = starService;
        this.researchService = researchService;
        this.playerService = playerService;
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

       this._moveCarriers(game);
       this._produceShips(game);
       this._conductResearch(game);
       this._endOfGalacticCycleCheck(game);
       this._logHistory(game);
       this._gameWinCheck(game);

       await game.save();
    }

    _moveCarriers(game) {
        // 1. Get all carriers that have waypoints ordered by the distance
        // they need to travel.
        let carriers = [];

        let carriersWithWaypoints = game.galaxy.carriers.filter(c => c.waypoints.length);

        for (let i = 0; i < carriersWithWaypoints.length; i++) {
            let carrier = carriersWithWaypoints[i];
            let waypoint = carrier.waypoints[0];
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

        let distancePerTick = this.distanceService.getCarrierTickDistance();

        for (let i = 0; i < carriers.length; i++) {
            let carrier = carriers[i];
            let waypoint = carrier.waypoints[0];
            let destinationStar = game.galaxy.stars.find(s => s._id.equals(waypoint.destination));

            if (carrier.distanceToDestination <= distancePerTick) {
                carrier.inTransitFrom = null;
                carrier.inTransitTo = null;
                carrier.orbiting = destinationStar._id;
                carrier.location = destinationStar.location;

                // Remove the current waypoint as we have arrived at the destination.
                let currentWaypoint = carrier.waypoints.splice(0, 1)[0];

                // TODO: Perform carrier waypoint action.

                // If the star is unclaimed, then claim it.
                if (destinationStar.ownedByPlayerId == null) {
                    destinationStar.ownedByPlayerId = carrier.ownedByPlayerId;
                }

                // If the star is owned by another player, then perform combat.
                if (!destinationStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)) {
                    this.combatStars.push({
                        star: destinationStar,
                        carrier
                    });
                }
            }
            // Otherwise, move X number of pixels in the direction of the star.
            else {
                let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

                carrier.location = nextLocation;
            }
        }

        // 3. Now that all carriers have finished moving, perform combat.
        for (let i = 0; i < combatStars.length; i++) {
            let combat = combatStars[i];

            this._performCombatAtStar(game, combat.star, combat.carrier);
        }
    }

    _performCombatAtStar(game, star, enemyCarrier) {
        let defender = this.playerService.getByObjectId(star.ownedByPlayerId);
        let attacker = this.playerService.getByObjectId(enemyCarrier.ownedByPlayerId);

        // There may be multiple carriers at this star, we will attack
        // carriers in order of largest carrier first to smallest last
        // until there are no carriers left, in which case we attack the star
        // directly.
        let friendlyCarriers = game.galaxy.carriers
            .filter(c => c.orbiting.equals(star._id) && c.ownedByPlayerId.equals(defender._id))
            .sort((a, b) => b.ships - a.ships);

        let defendPower = defender.research.weapons.level + 1;
        let attackPower = attacker.research.weapons.level;

        // Perform carrier to carrier combat.
        for (let i = 0; i < friendlyCarriers.length; i++) {
            let friendlyCarrier = friendlyCarriers[i];

            // Keep fighting until either carrier has no ships remaining.
            while (friendlyCarrier.ships > 0 && enemyCarrier.ships > 0) {
                // Friendly carrier attacks first with defender bonus.
                enemyCarrier.ships -= defendPower;

                // Enemy carrier attacks next if there are still ships remaining.
                if (enemyCarrier.ships <= 0) {
                    break;
                }

                friendlyCarrier.ships -= attackPower;
            }

            // Destroy carriers if they have no ships left.
            if (friendlyCarrier.ships <= 0) {
                game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(friendlyCarrier), 1);
            }

            // If the enemy carrier has no ships, then carrier to carrier combat is finished.
            if (enemyCarrier.ships <= 0) {
                break;
            }
        }

        // Perform star to carrier combat.
        // If the enemy carrier still has ships left, then move onto attack the star's garrison.
        while (Math.floor(star.garrisonActual) > 0 && enemyCarrier.ships > 0) {
            // The star attacks first with defender bonus.
            enemyCarrier.ships -= defendPower;

            // Enemy carrier attacks next if there are still ships remaining.
            if (enemyCarrier.ships <= 0) {
                break;
            }

            star.garrisonActual -= attackPower;
            star.garrison = Math.floor(star.garrisonActual);
        }

        // If the enemy carrier has no ships, then destroy the attacking carrier.
        if (enemyCarrier.ships <= 0) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(enemyCarrier), 1);
        }

        // If the star has no garrison and no defenders, then the attacker has won.
        let defendersRemaining = friendlyCarriers.reduce((sum, c) => sum += c.ships, 0);

        if (defendersRemaining <= 0 && star.garrisonActual <= 0) {
            star.ownedByPlayerId = enemyCarrier.ownedByPlayerId;
            attacker.credits += star.infrastructure.economy * 10; // Attacker gets 10 credits for every eco destroyed.
            star.infrastructure.economy = 0;

            // TODO: Do carrier waypoint action here?
        }
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

    _conductResearch(game) {
        // Add the current level of experimentation to the current 
        // tech being researched.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];
            
            this.researchService.conductResearch(player);
        }
    }

    _endOfGalacticCycleCheck(game) {
        game.state.tick++;

        // Check if we have reached the production tick.
        if (game.state.tick % game.settings.galaxy.productionTicks === 0) {
            game.state.productionTick++;

            this._givePlayersMoney(game);
            this._conductExperiments(game);
        }
    }

    _givePlayersMoney(game) {
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let totalEco = this.playerService.calculateTotalEconomy(player, game.galaxy.stars);

            let creditsFromEconomy = totalEco * 10;
            let creditsFromBanking = player.research.banking.level * 75;
            let creditsTotal = creditsFromEconomy + creditsFromBanking;

            player.credits += creditsTotal;
        }
    }

    _conductExperiments(game) {
        // Pick a random tech to research and add the current level of experimentation
        // to its current research progress.
        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            this.researchService.conductExperiments(player);
        }
    }

    _logHistory(game) {
        let history = {
            tick: game.state.tick,
            players: []
        };

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let stats = this.playerService.getStats(game, player);

            history.players.push({
                playerId: player._id,
                statistics: {
                    totalStars: stats.totalStars,
                    totalEconomy: stats.totalEconomy,
                    totalIndustry: stats.totalIndustry,
                    totalScience: stats.totalScience,
                    totalShips: stats.totalShips,
                    totalCarriers: stats.totalCarriers,
                    weapons: player.research.weapons.level,
                    banking: player.research.banking.level,
                    manufacturing: player.research.manufacturing.level,
                    hyperspace: player.research.hyperspace.level,
                    scanning: player.research.scanning.level,
                    experimentation: player.research.experimentation.level,
                    terraforming: player.research.terraforming.level
                }
            })
        }

        game.history.push(history);
    }

    _gameWinCheck(game) {
        // Check to see if anyone has won the game.
        // There could be more than one player who has reached
        // the number of stars required at the same time.
        // In this case we pick the player who has the most ships.
        let winners = game.galaxy.players
            .filter(p => {
                let playerStars = this.playerService.calculateTotalStars(p, game.galaxy.stars);

                return playerStars >= game.state.starsForVictory;
            })
            .sort((a, b) => {
                let totalShipsA = this.playerService.calculateTotalShips(a, game.galaxy.stars, game.galaxy.carriers);
                let totalShipsB = this.playerService.calculateTotalShips(b, game.galaxy.stars, game.galaxy.carriers);

                return totalShipsB - totalShipsA;
            });

        if (winners.length) {
            let winner = winners[0];

            game.state.paused = true;
            game.state.endDate = new Date();
            game.state.winner = winner._id;
        }
    }
}