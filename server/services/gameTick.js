module.exports = class GameTickService {
    
    constructor(distanceService, starService) {
        this.distanceService = distanceService;
        this.starService = starService;
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
       this._moveCarriers(game);
       this._produceShips(game);
       this._conductResearch(game);
       this._endOfGalacticCycleCheck(game);
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
        // Because carriers are ordered by distance to their destination,
        // this means that always the carrier that is closest to its destination
        // will land first. This is important for unclaimed stars and defender bonuses.
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
                    this._performCombatAtStar(game, destinationStar, carrier);
                }
            }
            // Otherwise, move X number of pixels in the direction of the star.
            else {
                let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

                carrier.location = nextLocation;
            }
        }
    }

    _performCombatAtStar(game, star, enemyCarrier) {
        let defender = game.galaxy.players.find(p => p._id.equals(star.ownedByPlayerId));
        let attacker = game.galaxy.players.find(p => p._id.equals(enemyCarrier.ownedByPlayerId));

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
                let player = game.galaxy.players.find(p => p._id.equals(star.ownedByPlayerId));
    
                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.garrisonActual += this.starService.calculateStarShipsByTicks(player.research.manufacturing.level, star.infrastructure.industry);
                star.garrison = Math.floor(star.garrisonActual);
            }
        }
    }

    _conductResearch(game) {

    }

    _endOfGalacticCycleCheck(game) {

    }

    _givePlayersMoney(game) {

    }

    _conductExperiments(game) {

    }

    _gameWinCheck(game) {

    }
}