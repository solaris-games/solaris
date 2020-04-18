module.exports = class GameTickService {
    
    constructor(distanceService) {
        this.distanceService = distanceService;
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
       this._performCombatAtStars(game);
       this._produceShips(game);
       this._conductResearch(game);
       this._endOfGalacticCycleCheck(game);
       this._gameWinCheck(game);

       await game.save();
    }

    _moveCarriers(game) {
        let distancePerTick = this.distanceService.getCarrierTickDistance();
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

            // If the carrier is within a tick of the destination then "land" at the star.
            let distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);

            if (distanceToDestination <= distancePerTick) {
                carrier.inTransitFrom = null;
                carrier.inTransitTo = null;
                carrier.orbiting = destinationStar._id;
                carrier.location = destinationStar.location;
                carrier.waypoints.splice(0, 1); // Remove the current waypoint.
            }
            // Otherwise, move X number of pixels in the direction of the star.
            else {
                let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

                carrier.location = nextLocation;
            }
        }
    }

    _performCombatAtStars(game) {

    }

    _produceShips(game) {

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