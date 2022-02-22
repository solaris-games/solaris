import { DBObjectId } from "../types/DBObjectId";
import DatabaseRepository from "../models/DatabaseRepository";
import { Game } from "../types/Game";
import { Player } from "../types/Player";
import { Specialist } from "../types/Specialist";
import AchievementService from "./achievement";
import GameTypeService from "./gameType";
import PlayerService from "./player";
import SpecialistService from "./specialist";
import StarService from "./star";
import WaypointService from "./waypoint";

import ValidationError from "../errors/validation";

export default class SpecialistHireService {
    gameRepo: DatabaseRepository<Game>;
    specialistService: SpecialistService;
    achievementService: AchievementService;
    waypointService: WaypointService;
    playerService: PlayerService;
    starService: StarService;
    gameTypeService: GameTypeService;

    constructor(
        gameRepo: DatabaseRepository<Game>,
        specialistService: SpecialistService,
        achievementService: AchievementService,
        waypointService: WaypointService,
        playerService: PlayerService,
        starService: StarService,
        gameTypeService: GameTypeService
    ) {
        this.gameRepo = gameRepo;
        this.specialistService = specialistService;
        this.achievementService = achievementService;
        this.waypointService = waypointService;
        this.playerService = playerService;
        this.starService = starService;
        this.gameTypeService = gameTypeService;
    }

    async hireCarrierSpecialist(game: Game, player: Player, carrierId: DBObjectId, specialistId: number) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        if (this._isCarrierSpecialistBanned(game, specialistId)) {
            throw new ValidationError('This specialist has been banned from this game.');
        }

        let carrier = game.galaxy.carriers.find(x => x.ownedByPlayerId && x.ownedByPlayerId.toString() === player._id.toString() && x._id.toString() === carrierId.toString());

        if (!carrier) {
            throw new ValidationError(`Cannot assign a specialist to a carrier that you do not own.`);
        }

        if (!carrier.orbiting) {
            throw new ValidationError(`Cannot assign a specialist to a carrier in transit.`);
        }

        let star = this.starService.getById(game, carrier.orbiting);

        if (this.starService.isDeadStar(star)) {
            throw new ValidationError('Cannot hire a specialist while in orbit of a dead star.');
        }

        if (!this.starService.isOwnedByPlayer(star, player)) {
            throw new ValidationError('Cannot hire a specialist while in orbit of a star that you do not own.');
        }

        const specialist = this.specialistService.getByIdCarrier(specialistId);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (carrier.specialistId && carrier.specialistId === specialist.id) {
            throw new ValidationError(`The carrier already has the specialist assigned.`);
        }
        
        // Calculate whether the player can afford to buy the specialist.
        if (!this._canAffordSpecialist(game, player, specialist)) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        if (carrier.specialistId) {
            let carrierSpecialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (carrierSpecialist.oneShot) {
                throw new ValidationError(`The current specialist cannot be replaced.`);
            }
        }

        carrier.specialistId = specialist.id;

        // Update the DB.
        await this.gameRepo.bulkWrite([
            await this._deductSpecialistCost(game, player, specialist),
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

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementSpecialistsHired(player.userId);
        }

        // TODO: Need to consider local and global effects and update the UI accordingly.

        let waypoints = await this.waypointService.cullWaypointsByHyperspaceRangeDB(game, carrier);

        let result = {
            game,
            carrier,
            specialist,
            cost,
            waypoints
        };

        return result;
    }

    async hireStarSpecialist(game: Game, player: Player, starId: DBObjectId, specialistId: number) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        if (this._isStarSpecialistBanned(game, specialistId)) {
            throw new ValidationError('This specialist has been banned from this game.');
        }

        let star = game.galaxy.stars.find(x => x.ownedByPlayerId && x.ownedByPlayerId.toString() === player._id.toString() && x._id.toString() === starId.toString());

        if (!star) {
            throw new ValidationError(`Cannot assign a specialist to a star that you do not own.`);
        }

        if (this.starService.isDeadStar(star)) {
            throw new ValidationError('Cannot hire a specialist on a dead star.');
        }

        const specialist = this.specialistService.getByIdStar(specialistId);

        if (!specialist) {
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist.`);
        }

        if (star.specialistId && star.specialistId === specialist.id) {
            throw new ValidationError(`The star already has the specialist assigned.`);
        }
        
        // Calculate whether the player can afford to buy the specialist.
        if (!this._canAffordSpecialist(game, player, specialist)) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        if (star.specialistId) {
            let starSpecialist = this.specialistService.getByIdStar(star.specialistId);

            if (starSpecialist.oneShot) {
                throw new ValidationError(`The current specialist cannot be replaced.`);
            }
        }

        star.specialistId = specialist.id;

        // Update the DB.
        await this.gameRepo.bulkWrite([
            await this._deductSpecialistCost(game, player, specialist),
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

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementSpecialistsHired(player.userId);
        }

        // TODO: The star may have its manufacturing changed so return back the new manufacturing.
        // TODO: Scanning changes are done by refreshing the entire game on the UI, would be ideally better to calculate it here?
        // TODO: Need to consider local and global effects and update the UI accordingly.

        return {
            star,
            specialist,
            cost
        };
    }

    _canAffordSpecialist(game: Game, player: Player, specialist: Specialist) {
        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        switch (game.settings.specialGalaxy.specialistsCurrency) {
            case 'credits':
                return player.credits >= cost.credits;
            case 'creditsSpecialists':
                return player.creditsSpecialists >= cost.creditsSpecialists;
            default:
                throw new Error(`Unsupported specialist currency type: ${game.settings.specialGalaxy.specialistsCurrency}`);
        }
    }

    _isStarSpecialistBanned(game: Game, specialistId: number) {
        return game.settings.specialGalaxy.specialistBans.star.indexOf(specialistId) > -1;
    }

    _isCarrierSpecialistBanned(game: Game, specialistId: number) {
        return game.settings.specialGalaxy.specialistBans.carrier.indexOf(specialistId) > -1;
    }

    async _deductSpecialistCost(game: Game, player: Player, specialist: Specialist) {
        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        switch (game.settings.specialGalaxy.specialistsCurrency) {
            case 'credits':
                player.credits -= cost.credits;

                return await this.playerService.addCredits(game, player, -cost.credits, false);
            case 'creditsSpecialists':
                player.creditsSpecialists -= cost.creditsSpecialists;

                return await this.playerService.addCreditsSpecialists(game, player, -cost.creditsSpecialists, false);
            default:
                throw new Error(`Unsupported specialist currency type: ${game.settings.specialGalaxy.specialistsCurrency}`);
        }
        
    }

};
