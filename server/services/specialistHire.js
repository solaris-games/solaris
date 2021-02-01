const ValidationError = require("../errors/validation");

module.exports = class SpecialistHireService {

    constructor(gameModel, specialistService, achievementService, waypointService) {
        this.gameModel = gameModel;
        this.specialistService = specialistService;
        this.achievementService = achievementService;
        this.waypointService = waypointService;
    }

    async hireCarrierSpecialist(game, player, carrierId, specialistId) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        let carrier = game.galaxy.carriers.find(x => x.ownedByPlayerId && x.ownedByPlayerId.equals(player._id) && x._id.toString() === carrierId);

        if (!carrier) {
            throw new ValidationError(`Cannot assign a specialist to a carrier that you do not own.`);
        }

        if (!carrier.orbiting) {
            throw new ValidationError(`Cannot assign a specialist to a carrier in transit.`);
        }

        const specialist = this.specialistService.getByIdCarrier(specialistId);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (carrier.specialistId && carrier.specialistId === specialist.id) {
            throw new ValidationError(`The carrier already has the specialist assigned.`);
        }
        
        // Calculate how much the spec will cost.
        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        if (player.credits < cost) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        carrier.specialistId = specialist.id;
        player.credits -= cost;

        // Update the DB.
        await this.gameModel.bulkWrite([
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': player._id
                    },
                    update: {
                        $inc: {
                            'galaxy.players.$.credits': -cost
                        }
                    }
                }
            },
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.carriers._id': carrier._id
                    },
                    update: {
                        'galaxy.carriers.$.specialistId': carrier.specialistId
                    }
                }
            }
        ]);

        if (!player.defeated) {
            await this.achievementService.incrementSpecialistsHired(player.userId);
        }

        // TODO: Need to consider local and global effects and update the UI accordingly.

        let waypoints = await this.waypointService.cullWaypointsByHyperspaceRange(game, carrier);

        let result = {
            game,
            carrier,
            specialist,
            cost,
            waypoints
        };

        return result;
    }

    async hireStarSpecialist(game, player, starId, specialistId) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        let star = game.galaxy.stars.find(x => x.ownedByPlayerId && x.ownedByPlayerId.equals(player._id) && x._id.toString() === starId);

        if (!star) {
            throw new ValidationError(`Cannot assign a specialist to a star that you do not own.`);
        }

        const specialist = this.specialistService.getByIdStar(specialistId);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (star.specialistId && star.specialistId === specialist.id) {
            throw new ValidationError(`The star already has the specialist assigned.`);
        }
        
        // Calculate how much the spec will cost.
        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        if (player.credits < cost) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        star.specialistId = specialist.id;
        player.credits -= cost;

        // Update the DB.
        await this.gameModel.bulkWrite([
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': player._id
                    },
                    update: {
                        $inc: {
                            'galaxy.players.$.credits': -cost
                        }
                    }
                }
            },
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.stars._id': star._id
                    },
                    update: {
                        'galaxy.stars.$.specialistId': star.specialistId
                    }
                }
            }
        ]);

        if (!player.defeated) {
            await this.achievementService.incrementSpecialistsHired(player.userId);
        }

        // TODO: The star may have its manufacturing changed so return back the new manufacturing.
        // TODO: Need to consider local and global effects and update the UI accordingly.

        return {
            star,
            specialist,
            cost
        };
    }

};
