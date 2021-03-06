const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class CarrierService {

    constructor(gameModel, achievementService, distanceService, starService, technologyService, specialistService) {
        this.gameModel = gameModel;
        this.achievementService = achievementService;
        this.distanceService = distanceService;
        this.starService = starService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    getById(game, id) {
        return game.galaxy.carriers.find(s => s._id.toString() === id);
    }

    getByObjectId(game, id) {
        return game.galaxy.carriers.find(s => s._id.equals(id));
    }

    getCarriersAtStar(game, starId) {
      return game.galaxy.carriers.filter(carrier => carrier.orbiting && carrier.orbiting.toString() === starId.toString())
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

    getCarriersWithinScanningRangeOfStarByCarrierIds(game, star, carriers) {
        // If the star isn't owned then it cannot have a scanning range
        if (star.ownedByPlayerId == null) {
            return [];
        }

        // Calculate the scanning distance of the given star.
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);

        // Go through all carriers and the ones that are within the star's scanning range.
        let carriersInRange = carriers.filter(c => {
            return c.ownedByPlayerId.equals(star.ownedByPlayerId)
                || this.distanceService.getDistanceBetweenLocations(c.location, star.location) <= scanningRangeDistance;
        });

        return carriersInRange;
    }

    filterCarriersByScanningRange(game, player) {
        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        // Start with all of the carriers that the player owns as
        // the player can always see those carriers.
        let carriersInRange = game.galaxy.carriers
            .filter(c => c.ownedByPlayerId.equals(player._id))
            .map(c => c._id);

        // We need to check all carriers NOT owned by the player.
        let carriersToCheck = game.galaxy.carriers
            .filter(c => !c.ownedByPlayerId.equals(player._id))
            .map(c => {
                return {
                    _id: c._id,
                    ownedByPlayerId: c.ownedByPlayerId,
                    location: c.location
                };
            });

        for (let star of playerStars) {
            let carrierIds = this.getCarriersWithinScanningRangeOfStarByCarrierIds(game, star, carriersToCheck);

            for (let carrierId of carrierIds) {
                if (carriersInRange.indexOf(carrierId) === -1) {
                    carriersInRange.push(carrierId);
                    carriersToCheck.splice(carriersToCheck.indexOf(carrierId), 1);
                }
            }

            // If we've checked all carriers then no need to continue.
            if (!carriersToCheck.length) {
                break;
            }
        }

        return carriersInRange.map(c => this.getByObjectId(game, c._id));
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
                waypoints: c.waypoints,
                isGift: c.isGift,
                specialistId: c.specialistId,
                specialist: null
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
    
    clearPlayerCarrierWaypointsLooped(game, player) {
        let carriers = this.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        for (let carrier of carriers) {
            carrier.waypointsLooped = false;
        }
    }

    clearPlayerCarriers(game, player) {
        game.galaxy.carriers = game.galaxy.carriers.filter(c => !c.ownedByPlayerId
            || !c.ownedByPlayerId.equals(player._id));
    }

    getCarrierDistancePerTick(game, carrier, warpSpeed = false) {
        let distanceModifier = warpSpeed ? game.constants.distances.warpSpeedMultiplier : 1;

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist.modifiers.local) {
                distanceModifier *= (specialist.modifiers.local.speed || 1);
            }
        }

        return game.settings.specialGalaxy.carrierSpeed * distanceModifier;
    }

    async convertToGift(game, player, carrierId) {
        let carrier = this.getById(game, carrierId);

        if (game.settings.specialGalaxy.giftCarriers === 'disabled') {
            throw new ValidationError(`Gifting carriers has been disabled in this game.`);
        }

        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError(`Cannot convert carrier into a gift, you do not own this carrier.`);
        }

        if (carrier.orbiting) {
            throw new ValidationError(`The carrier must be in transit in order to be converted into a gift.`);
        }

        if (carrier.isGift) {
            throw new ValidationError(`The carrier has already been converted into a gift.`);
        }

        // Convert the carrier into a gift.
        // Remove all waypoints except from the first waypoint
        // Set its waypoint action to be "do nothing"
        carrier.isGift = true;
        carrier.waypointsLooped = false;

        let firstWaypoint = carrier.waypoints[0];

        firstWaypoint.action = 'nothing';
        firstWaypoint.actionShips = 0;
        firstWaypoint.delayTicks = 0;

        carrier.waypoints = [firstWaypoint];
        
        await game.save();
    }

    async rename(game, player, carrierId, name) {
        let carrier = this.getById(game, carrierId);

        if (!carrier) {
            throw new ValidationError('Carrier does not exist');
        }

        if (!name) {
            throw new ValidationError('Name is required.');
        }

        if (name.length < 4 || name.length > 30) {
            throw new ValidationError('Name must be between greater than 3 and less than or equal to 30 characters long.');
        }

        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError(`Cannot rename carrier, you are not its owner.`);
        }

        let carrierName = name.trim().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        
        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrierId
        }, {
            $set: {
                'galaxy.carriers.$.name': carrierName
            }
        })
        .exec();
    }

    async transferGift(game, gameUsers, star, carrier) {
        if (!star.ownedByPlayerId) {
            throw new ValidationError(`Cannot transfer ownership of a gifted carrier to this star, no player owns the star.`);
        }

        let starPlayer = game.galaxy.players.find(p => p._id.equals(star.ownedByPlayerId));
        let starUser = gameUsers.find(u => u._id.equals(starPlayer.userId));

        if (starUser && !starPlayer.defeated) {
            starUser.achievements.trade.giftsReceived += carrier.ships;
        }

        let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let carrierUser = gameUsers.find(u => u._id.equals(carrierPlayer.userId));

        if (carrierUser && !carrierPlayer.defeated) {
            carrierUser.achievements.trade.giftsSent += carrier.ships;
        }

        carrier.ownedByPlayerId = star.ownedByPlayerId;
        carrier.isGift = false;
    }

    canPlayerSeeCarrierShips(player, carrier) {
        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            // If the carrier has a hideCarrierShips spec and is not owned by the given player
            // then that player cannot see the carrier's ships.
            if (specialist.modifiers.special && specialist.modifiers.special.hideCarrierShips
                && carrier.ownedByPlayerId.toString() !== player._id.toString()) {
                return false;
            }
        }

        return true;
    }

    moveCarrierToCurrentWaypoint(carrier, destinationStar, distancePerTick) {
        let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

        carrier.location = nextLocation;
    }

    async arriveAtStar(game, gameUsers, carrier, destinationStar) {
        // Remove the current waypoint as we have arrived at the destination.
        let currentWaypoint = carrier.waypoints.splice(0, 1)[0];

        let report = {
            waypoint: currentWaypoint,
            combatRequiredStar: false
        };

        carrier.inTransitFrom = null;
        carrier.inTransitTo = null;
        carrier.orbiting = destinationStar._id;
        carrier.location = destinationStar.location;

        // If the carrier waypoints are looped then append the
        // carrier waypoint back onto the waypoint stack.
        if (carrier.waypointsLooped) {
            carrier.waypoints.push(currentWaypoint);
        }

        // If the star is unclaimed, then claim it.
        if (destinationStar.ownedByPlayerId == null) {
            await this.starService.claimUnownedStar(game, gameUsers, destinationStar, carrier);
        }

        // If the star is owned by another player, then perform combat.
        if (!destinationStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)) {
            // If the carrier is a gift, then transfer the carrier ownership to the star owning player.
            // Otherwise, perform combat.
            if (carrier.isGift) {
                await this.transferGift(game, gameUsers, destinationStar, carrier);
            } else {
                report.combatRequiredStar = true;
            }
        } else {
            // Make sure the carrier gift is reset if the star is owned by the same player.
            carrier.isGift = false;
        }

        return report;
    }

    async moveCarrier(game, gameUsers, carrier) {
        let waypoint = carrier.waypoints[0];
        let sourceStar = game.galaxy.stars.find(s => s._id.equals(waypoint.source));
        let destinationStar = game.galaxy.stars.find(s => s._id.equals(waypoint.destination));
        let carrierOwner = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let warpSpeed = this.starService.canTravelAtWarpSpeed(carrierOwner, carrier, sourceStar, destinationStar);
        let distancePerTick = this.getCarrierDistancePerTick(game, carrier, warpSpeed);

        let carrierMovementReport = {
            carrier,
            sourceStar,
            destinationStar,
            carrierOwner,
            warpSpeed,
            distancePerTick,
            waypoint,
            combatRequiredStar: false,
            arrivedAtStar: false
        };
        
        if (carrier.distanceToDestination <= distancePerTick) {
            let starArrivalReport = await this.arriveAtStar(game, gameUsers, carrier, destinationStar);
            
            carrierMovementReport.waypoint = starArrivalReport.waypoint;
            carrierMovementReport.combatRequiredStar = starArrivalReport.combatRequiredStar;
            carrierMovementReport.arrivedAtStar = true;
        }
        // Otherwise, move X distance in the direction of the star.
        else {
            this.moveCarrierToCurrentWaypoint(carrier, destinationStar, distancePerTick);
        }

        return carrierMovementReport;
    }

    getNextLocationToWaypoint(game, carrier) {
        let waypoint = carrier.waypoints[0];
        let sourceStar = game.galaxy.stars.find(s => s._id.equals(waypoint.source));
        let destinationStar = game.galaxy.stars.find(s => s._id.equals(waypoint.destination));
        let carrierOwner = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let warpSpeed = this.starService.canTravelAtWarpSpeed(carrierOwner, carrier, sourceStar, destinationStar);
        let distancePerTick = this.getCarrierDistancePerTick(game, carrier, warpSpeed);

        let nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);

        return nextLocation;
    }

    isInTransit(carrier) {
        return !carrier.orbiting;
    }

    isLaunching(carrier) {
        return carrier.orbiting && carrier.waypoints.length && carrier.waypoints[0].delayTicks === 0;
    }
    
};
