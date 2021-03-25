const EventEmitter = require('events');
const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class StarService extends EventEmitter {

    constructor(gameModel, randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService) {
        super();
        
        this.gameModel = gameModel;
        this.randomService = randomService;
        this.nameService = nameService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.userService = userService;
    }

    generateUnownedStar(game, name, location, naturalResources) {
        return {
            _id: mongoose.Types.ObjectId(),
            name,
            naturalResources,
            location,
            infrastructure: { }
        };
    }

    generateStarPosition(game, originX, originY, radius) {
        if (radius == null) {
            radius = game.constants.distances.maxDistanceBetweenStars;
        }

        return this.randomService.getRandomPositionInCircleFromOrigin(originX, originY, radius);
    }

    getByObjectId(game, id) {
        return game.galaxy.stars.find(s => s._id.equals(id));
    }

    getById(game, id) {
        return game.galaxy.stars.find(s => s._id.toString() === id.toString());
    }

    setupHomeStar(game, homeStar, player, gameSettings) {
        // Set up the home star
        player.homeStarId = homeStar._id;
        homeStar.ownedByPlayerId = player._id;
        homeStar.garrisonActual = Math.max(gameSettings.player.startingShips, 1); // Must be at least 1 star at the home star so that a carrier can be built there.
        homeStar.garrison = homeStar.garrisonActual;
        homeStar.naturalResources = game.constants.star.resources.maxNaturalResources; // Home stars should always get max resources.
        homeStar.warpGate = false;
        homeStar.ignoreBulkUpgrade = false;
        
        // ONLY the home star gets the starting infrastructure.
        homeStar.infrastructure.economy = gameSettings.player.startingInfrastructure.economy;
        homeStar.infrastructure.industry = gameSettings.player.startingInfrastructure.industry;
        homeStar.infrastructure.science = gameSettings.player.startingInfrastructure.science;
    }

    getPlayerHomeStar(stars, player) {
        return this.listStarsOwnedByPlayer(stars, player._id).find(s => s._id.equals(player.homeStarId));
    }

    listStarsOwnedByPlayer(stars, playerId) {
        return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(playerId));
    }

    listStarsOwnedByPlayerBulkIgnored(stars, playerId) {
        return this.listStarsOwnedByPlayer(stars, playerId)
            .filter(s => s.ignoreBulkUpgrade);
    }

    isStarWithinScanningRangeOfStars(game, star, stars) {
        // Go through all of the stars one by one and calculate
        // whether any one of them is within scanning range.
        for (let otherStar of stars) {
            if (otherStar.ownedByPlayerId == null) {
                continue;
            }

            // Use the effective scanning range of the other star to check if it can "see" the given star.
            let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, otherStar);
            let scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);
            let distance = this.starDistanceService.getDistanceBetweenStars(star, otherStar);

            if (distance <= scanningRangeDistance) {
                return true;
            }
        }

        return false;
    }

    filterStarsByScanningRange(game, player) {
        let starsInRange = [];

        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        let playerStars = this.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let starsToCheck = game.galaxy.stars.map(s => {
            return {
                _id: s._id,
                location: s.location
            }
        });

        for (let star of playerStars) {
            let starIds = this.getStarsWithinScanningRangeOfStarByStarIds(game, star, starsToCheck);

            for (let starId of starIds) {
                if (starsInRange.indexOf(starId) === -1) {
                    starsInRange.push(starId);
                    starsToCheck.splice(starsToCheck.indexOf(starId), 1);
                }
            }

            // If we've checked all stars then no need to continue.
            if (!starsToCheck.length) {
                break;
            }
        }

        return starsInRange.map(s => this.getByObjectId(game, s._id));
    }

    filterStarsByScanningRangeAndWaypointDestinations(game, player) {
        // Get all stars within the player's normal scanning vision.
        let starsInScanningRange = this.filterStarsByScanningRange(game, player);

        // If in dark mode then we need to also include any stars that are 
        // being travelled to by carriers in transit for the current player.
        let inTransitStars = game.galaxy.carriers
            .filter(c => c.ownedByPlayerId.equals(player._id) && !c.orbiting)
            .map(c => c.waypoints[0].destination)
            .map(d => this.getByObjectId(game, d));

        for (let transitStar of inTransitStars) {
            if (starsInScanningRange.indexOf(transitStar) < 0) {
                starsInScanningRange.push(transitStar);
            }
        }

        return starsInScanningRange;
    }
    
    getStarsWithinScanningRangeOfStarByStarIds(game, star, stars) {
        // If the star isn't owned then it cannot have a scanning range
        if (star.ownedByPlayerId == null) {
            return [];
        }

        // Calculate the scanning distance of the given star.
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);

        // Go through all stars and find each star that is in scanning range.
        let starsInRange = stars.filter(s => {
            return this.starDistanceService.getDistanceBetweenStars(s, star) <= scanningRangeDistance;
        });

        return starsInRange;
    }

    isStarInScanningRangeOfPlayer(game, star, player) {
        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        let playerStars = this.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let isInScanRange = this.isStarWithinScanningRangeOfStars(game, star, playerStars);

        return isInScanRange;
    }

    calculateTerraformedResources(naturalResources, terraforming) {
        return (terraforming * 5) + naturalResources;
    }

    calculateStarShipsByTicks(techLevel, industryLevel, ticks = 1, productionTicks = 24) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return +((industryLevel * (techLevel + 5) / productionTicks) * ticks).toFixed(2);
    }

    async abandonStar(game, player, starId) {
        // Get the star.
        let star = game.galaxy.stars.find(x => x._id.toString() === starId);

        // Check whether the star is owned by the player
        if ((star.ownedByPlayerId || '').toString() !== player._id.toString()) {
            throw new ValidationError(`Cannot abandon a star that is not owned by the player.`);
        }

        star.ownedByPlayerId = null;
        star.garrisonActual = 0;
        star.garrison = star.garrisonActual;
        star.ignoreBulkUpgrade = false;
        
        game.galaxy.carriers = game.galaxy.carriers.filter(x => (x.orbiting || '').toString() != star._id.toString());

        // TODO: Re-assign home star?
        // // If this was the player's home star, then we need to find a new home star.
        // if (star.homeStar) {
        //     let closestStars = this.starDistanceService.getClosestPlayerOwnedStars(star, game.galaxy.stars, player);

        //     if (closestStars.length) {
        //         closestStars[0].homeStar = true;
        //     }
        // }
        
        await game.save();

        this.emit('onPlayerStarAbandoned', {
            game,
            player,
            star
        });
    }

    canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar) {
        // If both stars have warp gates and they are both owned by players...
        if (sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
            // If both stars are owned by the player then carriers can always move at warp.
            if (destinationStar.ownedByPlayerId.equals(player._id) && sourceStar.ownedByPlayerId.equals(player._id)) {
                return true;
            }

            // If one of the stars are not owned by the current player then we need to check for
            // warp scramblers.

            // But if the carrier has the warp stabilizer specialist then it can travel at warp speed no matter
            // which player it belongs to or whether the stars it is travelling to or from have locked warp gates.
            if (carrier.specialistId) {
                let carrierSpecialist = this.specialistService.getByIdCarrier(carrier.specialistId);
        
                if (carrierSpecialist.modifiers.special && carrierSpecialist.modifiers.special.unlockWarpGates) {
                    return true;
                }
            }

            // If either star has a warp scrambler present then carriers cannot move at warp.
            // Note that we only need to check for scramblers on stars that do not belong to the player.
            if (!sourceStar.ownedByPlayerId.equals(player._id) && sourceStar.specialistId) {
                let specialist = this.specialistService.getByIdStar(sourceStar.specialistId);

                if (specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            if (!destinationStar.ownedByPlayerId.equals(player._id) && destinationStar.specialistId) {
                let specialist = this.specialistService.getByIdStar(destinationStar.specialistId);

                if (specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            // If none of the stars have scramblers then warp speed ahead.
            return true;
        }

        return false;
    }

    canPlayerSeeStarGarrison(player, star) {
        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            // If the star has a hideStarGarrison spec and is not owned by the given player
            // then that player cannot see the carrier's ships.
            if (specialist.modifiers.special && specialist.modifiers.special.hideStarGarrison
                && (star.ownedByPlayerId || '').toString() !== player._id.toString()) {
                return false;
            }
        }

        return true;
    }

    async claimUnownedStar(game, gameUsers, star, carrier) {
        if (star.ownedByPlayerId) {
            throw new ValidationError(`Cannot claim an owned star`);
        }

        star.ownedByPlayerId = carrier.ownedByPlayerId;
        star.ignoreBulkUpgrade = false;

        // Weird scenario, but could happen.
        if (carrier.isGift) {
            carrier.isGift = false;
        }

        let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let carrierUser = gameUsers.find(u => u._id.equals(carrierPlayer.userId));

        if (carrierUser && !carrierPlayer.defeated) {
            carrierUser.achievements.combat.stars.captured++;
        }
    }

    applyStarSpecialistSpecialModifiers(game) {
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = game.galaxy.stars[i];

            if (star.ownedByPlayerId) {
                if (star.specialistId) {
                    let specialist = this.specialistService.getByIdStar(star.specialistId);

                    if (specialist.modifiers.special) {
                        if (specialist.modifiers.special.addNaturalResourcesOnTick) {
                            star.naturalResources += specialist.modifiers.special.addNaturalResourcesOnTick;
                        }

                        if (specialist.modifiers.special.deductNaturalResourcesOnTick) {
                            star.naturalResources -= specialist.modifiers.special.deductNaturalResourcesOnTick;

                            // Retire the specialist if there are no longer any natural resources.
                            if (star.naturalResources < 0) {
                                star.naturalResources = 0;
                                star.specialistId = null;
                            }
                        }
                    }
                }
            }
        }
    }

    produceShips(game) {
        let starsToProduce = game.galaxy.stars.filter(s => s.infrastructure.industry > 0);

        for (let i = 0; i < starsToProduce.length; i++) {
            let star = starsToProduce[i];

            if (star.ownedByPlayerId) {
                let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
    
                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.garrisonActual += this.calculateStarShipsByTicks(effectiveTechs.manufacturing, star.infrastructure.industry, 1, game.settings.galaxy.productionTicks);
                star.garrison = Math.floor(star.garrisonActual);
            }
        }
    }

    async toggleIgnoreBulkUpgrade(game, player, starId) {
        let star = this.getById(game, starId);

        if (!star.ownedByPlayerId || !star.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError(`You do not own this star.`);
        }

        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.stars._id': starId
        }, {
            $set: {
                'galaxy.stars.$.ignoreBulkUpgrade': star.ignoreBulkUpgrade ? false : true
            }
        });
    }

}
