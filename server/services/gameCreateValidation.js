const ValidationError = require('../errors/validation');

module.exports = class GameCreateValidationService {
    
    constructor(starService,
        carrierService, specialistService) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.specialistService = specialistService;
    }

    validate(game) {
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

            // Assert that all players start with 1 carrier.
            let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

            if (carriers.length !== 1) {
                throw new ValidationError(`All players must have 1 carrier.`);
            }
        }

        // Assert that the galaxy has the correct number of stars.
        const noOfStars = game.settings.galaxy.starsPerPlayer * game.settings.general.playerLimit;

        if (game.galaxy.stars.length !== noOfStars) {
            throw new ValidationError(`The galaxy must have a total of ${noOfStars} stars.`);
        }

        for (let star of game.galaxy.stars) {
            // Assert that all stars in the galaxy have valid natural resources
            if (star.naturalResources.economy < 0 || star.naturalResources.economy > game.constants.star.resources.maxNaturalResources
                || star.naturalResources.industry < 0 || star.naturalResources.industry > game.constants.star.resources.maxNaturalResources
                || star.naturalResources.science < 0 || star.naturalResources.science > game.constants.star.resources.maxNaturalResources) {
                    throw new ValidationError(`All stars must have valid natural resources.`);
                }

            // Assert that all stars in the galaxy have valid infrastructure
            if (star.infrastructure.economy < 0
                || star.infrastructure.industry < 0
                || star.infrastructure.science < 0) {
                    throw new ValidationError(`All stars must have valid infrastructure.`);
                }

            // Assert that dead stars have valid infrastructure
            if (this.starService.isDeadStar(star)
                && (
                    star.infrastructure.economy > 0
                    || star.infrastructure.industry > 0
                    || star.infrastructure.science > 0
                    || star.specialistId
                    || star.warpGate
                )) {
                    throw new ValidationError(`All dead stars must have 0 infrastructure, no specialists and no warp gates.`);
                }
    
            // Assert that all stars have valid starting ships
            if (star.ships < 0 || star.shipsActual < 0) {
                throw new ValidationError(`All stars must have 0 or greater ships.`);
            }
    
            // Assert that all stars have valid specialists.
            if (star.specialistId && !this.specialistService.getByIdStar(star.specialistId)) {
                throw new ValidationError(`All stars with specialists must have a valid specialist.`);
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
            if (carrier.ships < 0 || carrier.ships > game.settings.player.startingShips) {
                throw new ValidationError(`All carriers must start with ${game.settings.player.startingShips} ships.`);
            }
    
            // Assert that all carriers have valid specialists.
            if (carrier.specialistId && !this.specialistService.getByIdCarrier(carrier.specialistId)) {
                throw new ValidationError(`All carriers with specialists must have a valid specialist.`);
            }
        }
    }
}