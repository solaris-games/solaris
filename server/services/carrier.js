const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class CarrierService {

    constructor(distanceService, starService) {
        this.distanceService = distanceService;
        this.starService = starService;
    }

    getById(game, id) {
        return game.galaxy.carriers.find(s => s._id.toString() === id);
    }

    getByObjectId(game, id) {
        return game.galaxy.carriers.find(s => s._id.equals(id));
    }

    createAtStar(star, carriers, ships = 1) {
        if (!Math.floor(star.garrisonActual)) {
            throw new ValidationError('Star must have a garrison to build a carrier.');
        }

        // Generate a name for the new carrier based on the star name but make sure
        // this name isn't already taken by another carrier.
        let name = this.generateCarrierName(star, carriers);

        let carrier = {
            _id: mongoose.Types.ObjectId(),
            ownedByPlayerId: star.ownedByPlayerId,
            ships: ships,
            orbiting: star._id,
            location: star.location,
            name,
            waypoints: [],
            waypointsLooped: false
        };

        // Reduce the star garrison by how many we have added to the carrier.
        star.garrisonActual -= ships;
        star.garrison -= ships;

        return carrier;
    }

    listCarriersOwnedByPlayer(carriers, playerId) {
        return carriers.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(playerId));
    }

    generateCarrierName(star, carriers) {
        let i = 1;
        let name = `${star.name} ${i++}`;
        
        while (carriers.find(c => c.name == name)) {
            name = `${star.name} ${i++}`;
        }

        return name;
    }

    filterCarriersByScanningRange(game, player) {
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, player.research.scanning.level);

        // Get all of the players stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let playerStarLocations = playerStars.map(s => s.location);

        if (!playerStarLocations.length) {
            return [];
        }
        
        return game.galaxy.carriers
        .filter(c => {
            // If the player owns the carrier then it will always be visible.
            if (c.ownedByPlayerId.equals(player._id)) {
                return true;
            }

            // Get the closest player star to this carrier.
            let closest = this.distanceService.getClosestLocation(c.location, playerStarLocations);
            let distance = this.distanceService.getDistanceBetweenLocations(c.location, closest);

            let inRange = distance <= scanningRangeDistance;

            return inRange;
        });
    }

    sanitizeCarriersByPlayer(game, player) {
        // Filter all waypoints (except those in transit) for all carriers that do not belong
        // to the player.
        return game.galaxy.carriers
        .map(c => {
            if (c.ownedByPlayerId.equals(player._id)) {
                return c;
            }

            // Return only key data about the carrier and the waypoints
            // if the carrier does not belong to the given player.
            let carrierData = {
                _id: c._id,
                ownedByPlayerId: c.ownedByPlayerId,
                orbiting: c.orbiting,
                inTransitFrom: c.inTransitFrom,
                inTransitTo: c.inTransitTo,
                name: c.name,
                ships: c.ships,
                location: c.location,
                waypoints: c.waypoints
            };

            carrierData.waypoints = this.clearCarrierWaypointsNonTransit(c, true);

            return carrierData;
        });
    }

    clearCarrierWaypointsNonTransit(carrier, obfuscateFirstWaypoint = false) {
        let waypoints = [];

        if (!carrier.orbiting) {
            waypoints = carrier.waypoints.slice(0, 1);

            if (obfuscateFirstWaypoint) {
                // Hide any sensitive info about the waypoint.
                let wp = waypoints[0];

                wp.action = 'collectAll';
                wp.actionShips = 0;
                wp.delayTicks = 0;
            }
        }

        return waypoints;
    }
    
    clearPlayerCarrierWaypointsNonTransit(game, player) {
        let carriers = this.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        for (let carrier of carriers) {
            carrier.waypoints = this.clearCarrierWaypointsNonTransit(carrier);
        }
    }

    clearPlayerCarriers(game, player) {
        game.galaxy.carriers = game.galaxy.carriers.filter(c => !c.ownedByPlayerId
            || !c.ownedByPlayerId.equals(player._id));
    }
    
};
