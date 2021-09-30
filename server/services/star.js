const EventEmitter = require('events');
const mongoose = require('mongoose');
const ValidationError = require('../errors/validation');

module.exports = class StarService extends EventEmitter {

    constructor(gameRepo, randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService, diplomacyService) {
        super();
        
        this.gameRepo = gameRepo;
        this.randomService = randomService;
        this.nameService = nameService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.userService = userService;
        this.diplomacyService = diplomacyService;
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
        homeStar.shipsActual = Math.max(gameSettings.player.startingShips, 1); // Must be at least 1 star at the home star so that a carrier can be built there.
        homeStar.ships = homeStar.shipsActual;
        homeStar.naturalResources = game.constants.star.resources.maxNaturalResources; // Home stars should always get max resources.
        homeStar.homeStar = true;
        homeStar.warpGate = false;
        homeStar.specialistId = null;

        this.resetIgnoreBulkUpgradeStatuses(homeStar);
        
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

    listStarsAliveOwnedByPlayer(stars, playerId) {
        return this.listStarsOwnedByPlayer(stars, playerId).filter(s => !this.isDeadStar(s))
    }

    listStarsWithScanningRangeByPlayer(game, playerId) {
        // A player has access to the scanning range of a star if
        // - The player owns the star
        // - The player has a carrier in orbit regardless of who owns the star
        let starIds = this.listStarsAliveOwnedByPlayer(game.galaxy.stars, playerId).map(s => s._id.toString());
        
        if (game.settings.player.alliances === 'enabled') { // This never occurs when alliances is disabled.
            starIds = starIds.concat(
                game.galaxy.carriers
                    .filter(c => c.ownedByPlayerId.equals(playerId) && c.orbiting)
                    .map(c => c.orbiting.toString())
            );

            starIds = [...new Set(starIds)];
        }

        return starIds.map(id => this.getById(game, id));
    }

    listStarsOwnedByPlayerBulkIgnored(stars, playerId, infrastructureType) {
        return this.listStarsOwnedByPlayer(stars, playerId)
            .filter(s => s.ignoreBulkUpgrade[infrastructureType]);
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
        let playerStars = this.listStarsWithScanningRangeByPlayer(game, player._id);
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
        let playerStars = this.listStarsWithScanningRangeByPlayer(game, player._id);
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

        this.resetIgnoreBulkUpgradeStatuses(star);
        
        // Destroy the carriers owned by the player who abandoned the star.
        // Note: If an ally is currently in orbit then they will capture the star on the next tick.
        let playerCarriers = game.galaxy.carriers
            .filter(x => 
                x.orbiting
                && x.orbiting.equals(star._id)
                && x.ownedByPlayerId.equals(player._id)
            );

        for (let playerCarrier of playerCarriers) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(playerCarrier), 1);
        }

        star.ownedByPlayerId = null;
        star.shipsActual = 0;
        star.ships = star.shipsActual;

        await game.save();

        this.emit('onPlayerStarAbandoned', {
            gameId: game._id,
            gameTick: game.state.tick,
            player,
            star
        });
    }

    canTravelAtWarpSpeed(player, carrier, sourceStar, destinationStar) {
        // Double check for destroyed stars.
        if (sourceStar == null || destinationStar == null) {
            return false;
        }

        // If both stars have warp gates and they are both owned by players...
        if (sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
            // If both stars are owned by the player then carriers can always move at warp.
            let sourceAllied = (player?.diplomacy?.allies.includes(sourceStar.ownedByPlayerId)) || sourceStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)
            let desinationAllied = (player?.diplomacy?.allies.includes(destinationStar.ownedByPlayerId)) || sourceStar.ownedByPlayerId.equals(carrier.ownedByPlayerId)
            // If both stars are owned by the player then carriers can always move at warp.
            if (sourceAllied && desinationAllied) {
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
            if (!sourceAllied && sourceStar.specialistId) {
                let specialist = this.specialistService.getByIdStar(sourceStar.specialistId);

                if (specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                    return false;
                }
            }

            if (!desinationAllied && destinationStar.specialistId) {
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

    canPlayerSeeStarShips(player, star) {
        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            // If the star has a hideStarShips spec and is not owned by the given player
            // then that player cannot see the carrier's ships.
            if (specialist.modifiers.special && specialist.modifiers.special.hideStarShips
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

        this.resetIgnoreBulkUpgradeStatuses(star);

        // Weird scenario, but could happen.
        if (carrier.isGift) {
            carrier.isGift = false;
        }

        let carrierPlayer = game.galaxy.players.find(p => p._id.equals(carrier.ownedByPlayerId));
        let carrierUser = gameUsers.find(u => u._id.equals(carrierPlayer.userId));

        if (carrierUser && !carrierPlayer.defeated) {
            carrierUser.achievements.combat.stars.captured++;

            if (star.homeStar) {
                carrierUser.achievements.combat.homeStars.captured++;
            }
        }
    }

    applyStarSpecialistSpecialModifiers(game) {
        // NOTE: Specialist modifiers that affect stars on tick only apply
        // to stars that are owned by players. i.e NOT abandoned stars.
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
                            this.deductNaturalResources(star, specialist.modifiers.special.deductNaturalResourcesOnTick);
                        }
                    }
                }
            }
        }
    }

    isDeadStar(star) {
        return star.naturalResources <= 0;
    }

    deductNaturalResources(star, amount) {
        star.naturalResources -= amount;

        // if the star reaches 0 resources then reduce the star to a dead hunk.
        if (star.naturalResources <= 0) {
            star.naturalResources = 0;
            star.specialistId = null;
            star.warpGate = false;
            star.infrastructure.economy = 0;
            star.infrastructure.industry = 0;
            star.infrastructure.science = 0;
        }
    }

    reigniteDeadStar(star, naturalResources) {
        if (!this.isDeadStar(star)) {
            throw new Error('The star cannot be reignited, it is not dead.');
        }

        star.naturalResources = naturalResources || 1;
    }

    destroyStar(game, star) {
        game.galaxy.stars.splice(game.galaxy.stars.indexOf(star), 1);

        game.state.stars--;

        // Recalculate how many stars are needed for victory in conquest mode.
        if (game.settings.general.mode === 'conquest') {
            // TODO: Find a better place for this as its shared in the gameCreate service.
            switch (game.settings.conquest.victoryCondition) {
                case 'starPercentage':
                    game.state.starsForVictory = Math.ceil((game.state.stars / 100) * game.settings.conquest.victoryPercentage);
                    break;
                case 'homeStarPercentage':
                    game.state.starsForVictory = Math.ceil((game.settings.general.playerLimit / 100) * game.settings.conquest.victoryPercentage);
                    break;
                default:
                    throw new Error(`Unsupported conquest victory condition: ${game.settings.conquest.victoryCondition}`)
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
                star.shipsActual += this.calculateStarShipsByTicks(effectiveTechs.manufacturing, star.infrastructure.industry, 1, game.settings.galaxy.productionTicks);
                star.ships = Math.floor(star.shipsActual);
            }
        }
    }

    async toggleIgnoreBulkUpgrade(game, player, starId, infrastructureType) {
        let star = this.getById(game, starId);

        if (!star.ownedByPlayerId || !star.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError(`You do not own this star.`);
        }

        let newValue = star.ignoreBulkUpgrade[infrastructureType] ? false : true;

        let updateObject = {
            $set: {}
        };

        updateObject['$set'][`galaxy.stars.$.ignoreBulkUpgrade.${infrastructureType}`] = newValue

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.stars._id': starId
        }, updateObject);
    }

    async toggleIgnoreBulkUpgradeAll(game, player, starId, ignoreStatus) {
        let star = this.getById(game, starId);

        if (!star.ownedByPlayerId || !star.ownedByPlayerId.equals(player._id)) {
            throw new ValidationError(`You do not own this star.`);
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.stars._id': starId
        }, {
            $set: {
                'galaxy.stars.$.ignoreBulkUpgrade.economy': ignoreStatus,
                'galaxy.stars.$.ignoreBulkUpgrade.industry': ignoreStatus,
                'galaxy.stars.$.ignoreBulkUpgrade.science': ignoreStatus
            }
        });
    }

    captureStar(game, star, owner, defenders, defenderUsers, attackers, attackerUsers, attackerCarriers) {
        let specialist = this.specialistService.getByIdStar(star.specialistId);

        // If the star had a specialist that destroys infrastructure then perform demolition.
        if (specialist && specialist.modifiers.special && specialist.modifiers.special.destroyInfrastructureOnLoss) {
            star.specialistId = null;
            star.infrastructure.economy = 0;
            star.infrastructure.industry = 0;
            star.infrastructure.science = 0;
            star.warpGate = false;
        }

        let closestPlayerId = attackerCarriers.sort((a, b) => a.distanceToDestination - b.distanceToDestination)[0].ownedByPlayerId;

        // Capture the star.
        let newStarPlayer = attackers.find(p => p._id.equals(closestPlayerId));
        let newStarUser = attackerUsers.find(u => u._id.toString() === newStarPlayer.userId.toString());
        let newStarPlayerCarriers = attackerCarriers.filter(c => c.ownedByPlayerId.equals(newStarPlayer._id));

        let captureReward = star.infrastructure.economy * 10; // Attacker gets 10 credits for every eco destroyed.

        // Check to see whether to double the capture reward.
        let captureRewardMultiplier = this.specialistService.hasAwardDoubleCaptureRewardSpecialist(newStarPlayerCarriers);

        captureReward *= captureRewardMultiplier;

        star.ownedByPlayerId = newStarPlayer._id;
        newStarPlayer.credits += captureReward;
        star.infrastructure.economy = 0;
        star.shipsActual = 0;
        star.ships = 0;

        // Reset the ignore bulk upgrade statuses as it has been captured by a new player.
        this.resetIgnoreBulkUpgradeStatuses(star);

        const oldStarUser = defenderUsers.find(u => u._id.equals(owner.userId));

        if (oldStarUser && !owner.defeated) {
            oldStarUser.achievements.combat.stars.lost++;

            if (star.homeStar) {
                oldStarUser.achievements.combat.homeStars.lost++;
            }
        }
        
        if (newStarUser && !newStarPlayer.defeated) {
            newStarUser.achievements.combat.stars.captured++;

            if (star.homeStar) {
                newStarUser.achievements.combat.homeStars.captured++;
            }
        }

        return {
            capturedById: newStarPlayer._id,
            capturedByAlias: newStarPlayer.alias,
            captureReward
        };
    }

    resetIgnoreBulkUpgradeStatuses(star) {
        star.ignoreBulkUpgrade = {
            economy: false,
            industry: false,
            science: false
        }
    }

    listHomeStars(game) {
        return game.galaxy.stars.filter(s => s.homeStar);
    }

    listContestedStars(game) {
        return game.galaxy.stars
            .map(s => {
                // Calculate other players in orbit of the star
                let carriersInOrbit = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.equals(s._id));
                let otherPlayerIdsInOrbit = [...new Set(carriersInOrbit.map(c => c.ownedByPlayerId.toString()))];

                if (otherPlayerIdsInOrbit.indexOf(s.ownedByPlayerId.toString()) > -1) {
                    otherPlayerIdsInOrbit.splice(otherPlayerIdsInOrbit.indexOf(s.ownedByPlayerId.toString()), 1); // Remove the star owner as we don't need it here.
                }

                return {
                    star: s,
                    carriersInOrbit,
                    otherPlayerIdsInOrbit
                };
            })
            .filter(x => {
                // Filter stars where there are other players in orbit and those players are not allied with the star owner.
                return x.otherPlayerIdsInOrbit.length
                    && !this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, x.star.ownedByPlayerId, x.otherPlayerIdsInOrbit);
            });
    }

    listContestedUnownedStars(game) {
        return game.galaxy.stars
            .filter(s => s.ownedByPlayerId == null)
            .map(s => {
                let carriersInOrbit = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.equals(s._id));

                return {
                    star: s,
                    carriersInOrbit
                };
            })
            .filter(x => x.carriersInOrbit.length);
    }
}
