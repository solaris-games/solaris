const EventEmitter = require('events');
const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class StarService extends EventEmitter {

    constructor(randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService) {
        super();
        
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
        homeStar.garrisonActual = gameSettings.player.startingShips;
        homeStar.garrison = homeStar.garrisonActual;
        homeStar.naturalResources = game.constants.star.resources.maxNaturalResources; // Home stars should always get max resources.
        homeStar.warpGate = false;
        
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
        let starIdsInRange = [];

        // Stars may have different scanning ranges independently so we need to check
        // each star to check what is within its scanning range.
        let playerStars = this.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let starIdsToCheck = game.galaxy.stars.map(s => s._id);

        for (let star of playerStars) {
            let starIds = this.getStarsWithinScanningRangeOfStarByStarIds(game, star._id, starIdsToCheck);

            for (let starId of starIds) {
                if (starIdsInRange.indexOf(starId) === -1) {
                    starIdsInRange.push(starId);
                    starIdsToCheck.splice(starIdsToCheck.indexOf(starId), 1);
                }
            }
        }

        return starIdsInRange.map(s => this.getByObjectId(game, s));
    }
    
    getStarsWithinScanningRangeOfStarByStarIds(game, starId, starIds) {
        let star = this.getByObjectId(game, starId);

        // If the star isn't owned then it cannot have a scanning range
        if (star.ownedByPlayerId == null) {
            return [];
        }

        // Calculate the scanning distance of the given star.
        let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        let scanningRangeDistance = this.distanceService.getScanningDistance(game, effectiveTechs.scanning);

        let stars = starIds.map(s => this.getByObjectId(game, s));

        // Go through all stars and find each star that is in scanning range.
        let starsInRange = stars.filter(s => {
            return this.starDistanceService.getDistanceBetweenStars(s, star) <= scanningRangeDistance;
        });

        return starsInRange.map(s => s._id);
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

    calculateStarShipsByTicks(techLevel, industryLevel, ticks = 1) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return +((industryLevel * (techLevel + 5) / 24) * ticks).toFixed(2);
    }

    async abandonStar(game, player, starId) {
        // Get the star.
        let star = game.galaxy.stars.find(x => x.id === starId);

        // Check whether the star is owned by the player
        if ((star.ownedByPlayerId || '').toString() !== player.id) {
            throw new ValidationError(`Cannot abandon a star that is not owned by the player.`);
        }

        star.ownedByPlayerId = null;
        star.garrisonActual = 0;
        star.garrison = star.garrisonActual;
        
        game.galaxy.carriers = game.galaxy.carriers.filter(x => (x.orbiting || '').toString() != star.id);

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

            // But if the carrier has the warp stablizer specialist then it can travel at warp speed no matter
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

    async claimUnownedStar(game, star, carrier) {
        if (star.ownedByPlayerId) {
            throw new ValidationError(`Cannot claim an owned star`);
        }

        star.ownedByPlayerId = carrier.ownedByPlayerId;

        // Weird scenario, but could happen.
        if (carrier.isGift) {
            carrier.isGift = false;
        }

        let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));

        let playerUser = await this.userService.getById(carrierPlayer.userId);

        if (playerUser) {
            playerUser.achievements.combat.stars.captured++;
            await playerUser.save();
        }
    }

    applyStarSpecialistSpecialModifiers(game, report) {
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = game.galaxy.stars[i];

            if (star.ownedByPlayerId) {
                let hasModifiedStar = false;

                if (star.specialistId) {
                    let specialist = this.specialistService.getByIdStar(star.specialistId);

                    if (specialist.modifiers.special) {
                        if (specialist.modifiers.special.addNaturalResourcesOnTick) {
                            star.naturalResources += specialist.modifiers.special.addNaturalResourcesOnTick;

                            hasModifiedStar = true;
                        }

                        if (specialist.modifiers.special.deductNaturalResourcesOnTick) {
                            star.naturalResources -= specialist.modifiers.special.deductNaturalResourcesOnTick;

                            // Retire the specialist if there are no longer any natural resources.
                            if (star.naturalResources < 0) {
                                star.naturalResources = 0;
                                star.specialistId = null;
                            }

                            hasModifiedStar = true;
                        }
                    }
                }

                // If the star isn't already in the report, add it.
                if (hasModifiedStar && !report.stars.find(s => s.equals(star._id))) {
                    report.stars.push(star._id);
                }
            }
        }
    }

    produceShips(game, report) {
        let starsToProduce = game.galaxy.stars.filter(s => s.infrastructure.industry > 0);

        for (let i = 0; i < starsToProduce.length; i++) {
            let star = starsToProduce[i];

            if (star.ownedByPlayerId) {
                let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
    
                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.garrisonActual += this.calculateStarShipsByTicks(effectiveTechs.manufacturing, star.infrastructure.industry);
                star.garrison = Math.floor(star.garrisonActual);

                // If the star isn't already in the report, add it.
                if (!report.stars.find(s => s.equals(star._id))) {
                    report.stars.push(star._id);
                }
            }
        }
    }

}