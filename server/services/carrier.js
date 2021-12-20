const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class CarrierService {

    constructor(gameRepo, achievementService, distanceService, starService, technologyService, specialistService, diplomacyService) {
        this.gameRepo = gameRepo;
        this.achievementService = achievementService;
        this.distanceService = distanceService;
        this.starService = starService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.diplomacyService = diplomacyService;
    }

    getByObjectId(game, id) {
        // return game.galaxy.carriers.find(s => s._id.equals(id));
        return this.getByIdBS(game, id); // Experimental
    }

    getById(game, id) {
        // return game.galaxy.carriers.find(s => s._id.toString() === id.toString());
        return this.getByIdBS(game, id); // Experimental
    }

    getByIdBS(game, id) {
        let start = 0;
        let end = game.galaxy.carriers.length - 1;

        while (start <= end) {
            let middle = Math.floor((start + end) / 2);
            let carrier = game.galaxy.carriers[middle];

            if (carrier._id.toString() === id.toString()) {
                // found the id
                return carrier;
            } else if (carrier._id.toString() < id.toString()) {
                // continue searching to the right
                start = middle + 1;
            } else {
                // search searching to the left
                end = middle - 1;
            }
        }

        // id wasn't found
        // Return the old way
        return game.galaxy.carriers.find(s => s._id.toString() === id.toString());
    }

    getCarriersAtStar(game, starId) {
        return game.galaxy.carriers.filter(carrier => carrier.orbiting && carrier.orbiting.toString() === starId.toString())
    }

    createAtStar(star, carriers, ships = 1) {
        if (!Math.floor(star.shipsActual)) {
            throw new ValidationError('Star must have at least 1 ship to build a carrier.');
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

        // Reduce the star ships by how many we have added to the carrier.
        star.shipsActual -= ships;
        star.ships -= ships;

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
            return this.distanceService.getDistanceBetweenLocations(c.location, star.location) <= scanningRangeDistance;
        });

        return carriersInRange;
    }

    filterCarriersByScanningRange(game, player) {
        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        let playerStars = this.starService.listStarsWithScanningRangeByPlayer(game, player._id);

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

                if (wp) {
                    wp.action = 'nothing';
                    wp.actionShips = 0;
                    wp.delayTicks = 0;
                }

                carrier.waypointsLooped = false;
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

    getCarrierDistancePerTick(game, carrier, warpSpeed = false, instantSpeed = false, isCarrier = false) {
        if (instantSpeed) {
            return null;
        }

        let distanceModifier = warpSpeed ? game.constants.distances.warpSpeedMultiplier : 1;

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist.modifiers.local) {
                if (!isCarrier)
                    distanceModifier *= (specialist.modifiers.local.speed || 1);
                else if (specialist.modifiers.local.toCarrierSpeed)
                    distanceModifier *= (specialist.modifiers.local.toCarrierSpeed || 1);
                else
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

        if (carrier.isGift) {
            throw new ValidationError(`The carrier has already been converted into a gift.`);
        }

        // Convert the carrier into a gift.
        carrier.isGift = true;
        carrier.waypointsLooped = false;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrier._id
        }, {
            $set: {
                'galaxy.carriers.$.isGift': true,
                'galaxy.carriers.$.waypointsLooped': false,
            }
        });
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

        let carrierName = name.trim().replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.carriers._id': carrierId
        }, {
            $set: {
                'galaxy.carriers.$.name': carrierName
            }
        });
    }

    async transferGift(game, gameUsers, star, carrier) {
        if (!star.ownedByPlayerId) {
            throw new ValidationError(`Cannot transfer ownership of a gifted carrier to this star, no player owns the star.`);
        }

        let starPlayer = game.galaxy.players.find(p => p._id.equals(star.ownedByPlayerId));
        let starUser = gameUsers.find(u => u._id.equals(starPlayer.userId));

        let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let carrierUser = gameUsers.find(u => u._id.equals(carrierPlayer.userId));

        const isSamePlayer = starPlayer._id.equals(carrierPlayer._id);

        if (!isSamePlayer) {
            // If the star is not owned by the same player then increment player achievements.
            if (starUser && !starPlayer.defeated) {
                starUser.achievements.trade.giftsReceived += carrier.ships;
            }

            if (carrierUser && !carrierPlayer.defeated) {
                carrierUser.achievements.trade.giftsSent += carrier.ships;
            }

            carrier.ownedByPlayerId = star.ownedByPlayerId; // Transfer ownership
            carrier.specialistId = null; // Remove the specialist. Note that this is required to get around an exploit where players can use a gift just before a battle to weaken the opponent.
        }

        carrier.isGift = false;
    }

    async scuttle(game, player, carrierId) {
        let carrier = this.getById(game, carrierId);

        if (!carrier) {
            throw new ValidationError('Carrier does not exist');
        }

        if (!carrier.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError(`Cannot scuttle carrier, you are not its owner.`);
        }

        if (carrier.isGift) {
            throw new ValidationError(`Cannot scuttle a gift.`);
        }

        await this.gameRepo.updateOne({
            _id: game._id
        }, {
            $pull: {
                'galaxy.carriers': {
                    _id: carrierId
                }
            }
        });

        // TODO: Event?
    }

    canPlayerSeeCarrierShips(game, player, carrier) {
        const isOwnedByPlayer = carrier.ownedByPlayerId.toString() === player._id.toString();

        if (isOwnedByPlayer) {
            return true;
        }

        // Check if the carrier is in orbit of a nebula as nebula always hides ships for other players.
        if (this.isInOrbitOfNebula(game, carrier)) {
            return false;
        }

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            // If the carrier has a hideShips spec and is not owned by the given player
            // then that player cannot see the carrier's ships.
            if (specialist.modifiers.special && specialist.modifiers.special.hideShips) {
                return false;
            }
        }

        return true;
    }

    isInOrbitOfNebula(game, carrier) {
        if (carrier.orbiting) {
            const orbitStar = this.starService.getById(game, carrier.orbiting);

            return orbitStar.isNebula;
        }

        return false;
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
        if (!currentWaypoint.isCarrier) {
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

            // Reignite dead stars if applicable
            // Note: Black holes cannot be reignited.
            if (!carrier.isGift && this.starService.isDeadStar(destinationStar) && this.specialistService.getReigniteDeadStar(carrier)) {
                let reigniteNaturalResources = this.specialistService.getReigniteDeadStarNaturalResources(carrier);

                this.starService.reigniteDeadStar(destinationStar, reigniteNaturalResources);

                carrier.specialistId = null;
            }

            // If the star is owned by another player, then perform combat.
            if (!destinationStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)) {
                // If the carrier is a gift, then transfer the carrier ownership to the star owning player.
                // Otherwise, perform combat.
                if (carrier.isGift) {
                    await this.transferGift(game, gameUsers, destinationStar, carrier);
                } else if (this.diplomacyService.isFormalAlliancesEnabled(game)) {
                    let isAllied = this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, [carrier.ownedByPlayerId, destinationStar.ownedByPlayerId]);

                    report.combatRequiredStar = !isAllied;
                } else {
                    report.combatRequiredStar = true;
                }
            } else {
                // Make sure the carrier gift is reset if the star is owned by the same player.
                carrier.isGift = false;
            }
        } else {
            if (!destinationStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)) {
                if (this.diplomacyService.isFormalAlliancesEnabled(game)) {
                    let isAllied = this.diplomacyService.isDiplomaticStatusBetweenPlayersAllied(game, [carrier.ownedByPlayerId, destinationStar.ownedByPlayerId]);
                    report.combatRequiredStar = !isAllied;
                } else {
                    report.combatRequiredStar = true;
                }
            }
            report.isCarrier = true;
        }

        return report;
    }

    async moveCarrier(game, gameUsers, carrier) {
        let waypoint = carrier.waypoints[0];

        // If the carrier is just about to launch, make damn sure the waypoint source is correct.
        // Note: This is a plaster over an issue with the saving waypoint logic that doesn't validate waypoints correctly.
        if (this.isLaunching(carrier)) {
            waypoint.source = carrier.orbiting;
        }

        let sourceStar = game.galaxy.stars.find(s => s._id.equals(waypoint.source));
        let destinationStar = waypoint.isCarrier ? game.galaxy.carriers.find(c => c._id.equals(waypoint.destination)) : game.galaxy.stars.find(s => s._id.equals(waypoint.destination));

        if (sourceStar === undefined) sourceStar = game.galaxy.carriers.find(c => c._id.equals(waypoint.source));

        let carrierOwner = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let warpSpeed = this.starService.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);
        let instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        let distancePerTick = this.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed, waypoint.toCarrier); // Null signifies instant travel

        let carrierMovementReport = {
            carrier,
            sourceStar,
            destinationStar,
            carrierOwner,
            warpSpeed,
            instantSpeed,
            distancePerTick,
            waypoint,
            combatRequiredStar: false,
            arrivedAtStar: false
        };

        if (instantSpeed || carrier.distanceToDestination <= distancePerTick) {
            let starArrivalReport = await this.arriveAtStar(game, gameUsers, carrier, destinationStar);

            carrierMovementReport.waypoint = starArrivalReport.waypoint;
            carrierMovementReport.combatRequiredStar = starArrivalReport.combatRequiredStar;
            carrierMovementReport.arrivedAtStar = true;
            carrierMovementReport.isCarrier = starArrivalReport.isCarrier;
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
        let destinationStar = waypoint.isCarrier ? game.galaxy.carriers.find(c => c._id.equals(waypoint.destination)) : game.galaxy.stars.find(s => s._id.equals(waypoint.destination));
        let carrierOwner = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));

        if (sourceStar === undefined) sourceStar = game.galaxy.carriers.find(c => c._id.equals(waypoint.source));

        let warpSpeed = false;
        let instantSpeed = false;

        if (sourceStar) {
            warpSpeed = this.starService.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar);
            instantSpeed = this.starService.isStarPairWormHole(sourceStar, destinationStar);
        }

        let nextLocation;
        let distancePerTick;
        let distanceToDestination = this.distanceService.getDistanceBetweenLocations(carrier.location, destinationStar.location);


        if (instantSpeed) {
            distancePerTick = distanceToDestination;
            nextLocation = destinationStar.location;
        } else {
            distancePerTick = this.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed);
            if (distancePerTick >= distanceToDestination) {
                distancePerTick = distanceToDestination;
                nextLocation = destinationStar.location;
            } else {
                nextLocation = this.distanceService.getNextLocationTowardsLocation(carrier.location, destinationStar.location, distancePerTick);
            }
        }

        return {
            location: nextLocation,
            distance: distancePerTick,
            warpSpeed,
            instantSpeed,
            sourceStar,
            destinationStar
        };
    }

    isInTransit(carrier) {
        return !carrier.orbiting;
    }

    isInTransitTo(carrier, star) {
        return this.isInTransit(carrier) && carrier.waypoints[0].destination.equals(star._id);
    }

    isLaunching(carrier) {
        return carrier.orbiting && carrier.waypoints.length && carrier.waypoints[0].delayTicks === 0;
    }

    destroyCarrier(game, carrier) {
        game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(carrier), 1);
    }

    getCarriersEnRouteToStar(game, star) {
        return game.galaxy.carriers.filter(c =>
            c.waypoints && c.waypoints.length && c.waypoints.find(w => w.destination.equals(star._id)) != null
        );
    }

    isLostInSpace(game, carrier) {
        // If not in transit then it obviously isn't lost in space
        if (!this.isInTransit(carrier)) {
            return false;
        }

        // If the carrier has a waypoint then check if the
        // current destination exists.
        if (carrier.waypoints.length) {
            return game.galaxy.stars.find(s => s._id.equals(carrier.waypoints[0].destination)) == null;
        }

        // If there are no waypoints and they are in transit then must be lost, otherwise all good.
        return carrier.waypoints.length === 0;
    }

    listGiftCarriersInOrbit(game) {
        return game.galaxy.carriers.filter(c => c.isGift && c.orbiting);
    }

};
