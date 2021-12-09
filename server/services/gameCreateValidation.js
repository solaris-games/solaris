const ValidationError = require('../errors/validation');

module.exports = class GameCreateValidationService {
    
    constructor(playerService, starService, carrierService, specialistService) {
        this.playerService = playerService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.specialistService = specialistService;
    }

    // Note: The reason why this isn't in a unit test is because custom galaxies
    // need to run through this validation.
    validate(game) {
        // Assert that there is the correct number of players.
        if (game.galaxy.players.length !== game.settings.general.playerLimit) {
            throw new ValidationError(`The game must have ${game.settings.general.playerLimit} players.`);
        }

        for (let player of game.galaxy.players) {
            // Assert that all players have the correct number of stars.
            let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

            if (playerStars.length !== game.settings.player.startingStars) {
                throw new ValidationError(`All players must have ${game.settings.player.startingStars} stars.`);
            }

            // Assert that all players have a home star.
            if (!player.homeStarId || !this.starService.getById(game, player.homeStarId)) {
                throw new ValidationError(`All players must have a capital star.`);
            }
            
            // Assert that all players have a unique colour and shape combination.
            let otherPlayer = game.galaxy.players
                .find(p => !p._id.equals(player._id) 
                    && p.shape === player.shape 
                    && p.colour.value === player.colour.value);

            if (otherPlayer) {
                throw new ValidationError(`All players must have a unique colour/shape combination.`);
            }

            // Assert that the player has the correct amount of starting credits
            if (player.credits !== game.settings.player.startingCredits) {
                throw new ValidationError(`All players must start with ${game.settings.player.startingCredits} credits.`);
            }

            // Assert that the player has the correct amount of starting tokens
            if (player.creditsSpecialists !== game.settings.player.startingCreditsSpecialists) {
                throw new ValidationError(`All players must start with ${game.settings.player.startingCreditsSpecialists} specialist tokens.`);
            }

            // Assert that all players start with 1 carrier.
            let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

            if (carriers.length !== 1) {
                throw new ValidationError(`All players must have 1 carrier.`);
            }

            // Assert that all players have the correct starting technology levels.
            if (
                player.research.terraforming.level !== game.settings.technology.startingTechnologyLevel.terraforming ||
                player.research.experimentation.level !== game.settings.technology.startingTechnologyLevel.experimentation ||
                player.research.scanning.level !== game.settings.technology.startingTechnologyLevel.scanning ||
                player.research.hyperspace.level !== game.settings.technology.startingTechnologyLevel.hyperspace ||
                player.research.manufacturing.level !== game.settings.technology.startingTechnologyLevel.manufacturing ||
                player.research.banking.level !== game.settings.technology.startingTechnologyLevel.banking ||
                player.research.weapons.level !== game.settings.technology.startingTechnologyLevel.weapons ||
                player.research.specialists.level !== game.settings.technology.startingTechnologyLevel.specialists
            ) {
                throw new ValidationError(`All players must start with valid starting technology levels.`);
            }
        }

        // Assert that the galaxy has the correct number of stars.
        const noOfStars = game.settings.galaxy.starsPerPlayer * game.settings.general.playerLimit;

        if (game.galaxy.stars.length !== noOfStars) {
            throw new ValidationError(`The galaxy must have a total of ${noOfStars} stars.`);
        }

        // Assert that there are the correct number of home stars.
        if (game.galaxy.stars.filter(s => s.homeStar).length !== game.settings.general.playerLimit) {
            throw new ValidationError(`The galaxy must have a total of ${game.settings.general.playerLimit} capital stars.`);
        }

        for (let star of game.galaxy.stars) {
            // Assert that home stars are owned by players.
            if (star.homeStar && (
                !star.ownedByPlayerId || !this.playerService.getById(game, star.ownedByPlayerId)
            )) {
                throw new ValidationError(`All capital stars must be owned by a player.`);
            }

            // Assert that all stars in the galaxy have valid natural resources
            if (star.naturalResources.economy < 0
                || star.naturalResources.industry < 0
                || star.naturalResources.science < 0) {
                    throw new ValidationError(`All stars must have valid natural resources.`);
                }

            // Assert that the natural resources are correct based on normal vs. split resources setting.
            if (game.settings.specialGalaxy.splitResources === 'disabled' && (
                star.naturalResources.economy !== star.naturalResources.industry
                && star.naturalResources.economy !== star.naturalResources.science
            )) {
                throw new ValidationError(`All stars must have equal natural resources for non-split resources.`);
            }

            // Assert that all stars in the galaxy have valid infrastructure
            if (star.infrastructure.economy < 0
                || star.infrastructure.industry < 0
                || star.infrastructure.science < 0) {
                    throw new ValidationError(`All stars must have valid infrastructure.`);
                }

            if (star.homeStar && (
                star.infrastructure.economy !== game.settings.player.startingInfrastructure.economy
                || star.infrastructure.industry !== game.settings.player.startingInfrastructure.industry
                || star.infrastructure.science !== game.settings.player.startingInfrastructure.science
            )) {
                throw new ValidationError(`All capital stars must start with valid starting infrastructure.`);
            }

            if (!star.homeStar && (
                star.infrastructure.economy > 0
                || star.infrastructure.industry > 0
                || star.infrastructure.science > 0
            )) {
                throw new ValidationError(`All non capital stars must start with 0 starting infrastructure.`);
            }

            // Assert that dead stars have valid infrastructure
            if (this.starService.isDeadStar(star)
                && (
                    star.infrastructure.economy > 0
                    || star.infrastructure.industry > 0
                    || star.infrastructure.science > 0
                    || star.specialistId
                    // || star.warpGate // TODO: This is a bug, dead stars cannot have warp gates however the map gen sometimes assigns them which is incorrect.
                )) {
                    throw new ValidationError(`All dead stars must have 0 infrastructure, no specialists and no warp gates.`);
                }
    
            // Assert that all stars have valid starting ships
            if (star.ships < 0 || star.shipsActual < 0) {
                throw new ValidationError(`All stars must have 0 or greater ships.`);
            }

            if (!star.homeStar && star.ownedByPlayerId && (
                star.ships !== game.settings.player.startingShips
                || star.shipsActual !== game.settings.player.startingShips
            )) {
                throw new ValidationError(`All non capital stars owned by players must have ${game.settings.player.startingShips} ships.`);
            }
    
            // Assert that all stars have valid specialists.
            if (star.specialistId && !this.specialistService.getByIdStar(star.specialistId)) {
                throw new ValidationError(`All stars with specialists must have a valid specialist.`);
            }

            // Assert that home stars have the correct number of starting ships and infrastructure
            if (star.homeStar && (
                star.ships !== game.settings.player.startingShips - 1
                || star.shipsActual !== game.settings.player.startingShips - 1
                || star.infrastructure.economy !== game.settings.player.startingInfrastructure.economy
                || star.infrastructure.industry !== game.settings.player.startingInfrastructure.industry
                || star.infrastructure.science !== game.settings.player.startingInfrastructure.science
            )) {
                throw new ValidationError(`All capital stars must start with valid ships and infrastructure.`);
            }

            // Assert that the worm home IDs are valid
            if (star.wormHoleToStarId && !this.starService.getById(game, star.wormHoleToStarId)) {
                throw new ValidationError(`All worm holes must be paired with a valid star.`);
            }
        }

        for (let carrier of game.galaxy.carriers) {
            // Assert that all carriers are owned by players.
            if (!carrier.ownedByPlayerId) {
                throw new ValidationError(`All carriers must be owned by a player.`);
            }

            // Assert that all carriers must be in orbit
            if (!carrier.orbiting) {
                throw new ValidationError(`All carriers must be in orbit.`);
            }

            // Assert that all carriers must have 0 waypoints.
            if (carrier.waypoints.length) {
                throw new ValidationError(`All carriers must have 0 waypoints.`);
            }

            // Assert that all carriers have valid starting ships.
            if (carrier.ships !== 1) {
                throw new ValidationError(`All carriers must start with ${game.settings.player.startingShips} ships.`);
            }
    
            // Assert that all carriers have valid specialists.
            if (carrier.specialistId && !this.specialistService.getByIdCarrier(carrier.specialistId)) {
                throw new ValidationError(`All carriers with specialists must have a valid specialist.`);
            }
        }
    }
}
