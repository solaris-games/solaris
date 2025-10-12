import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { Game } from "./types/Game";
import { Player } from "./types/Player";
import { Specialist } from 'solaris-common';
import UserAchievementService from "./userAchievement";
import { GameTypeService } from 'solaris-common'
import SpecialistService from "./specialist";
import StarService from "./star";

import { ValidationError } from "solaris-common";
import SpecialistBanService from "./specialistBan";
import PlayerCreditsService from "./playerCredits";
import { TechnologyService } from 'solaris-common';
import StatisticsService from "./statistics";
import CullWaypointsService from "./cullWaypoints";

export default class SpecialistHireService {
    gameRepo: Repository<Game>;
    specialistService: SpecialistService;
    achievementService: UserAchievementService;
    cullWaypointsService: CullWaypointsService;
    playerCreditsService: PlayerCreditsService;
    starService: StarService;
    gameTypeService: GameTypeService;
    specialistBanService: SpecialistBanService;
    technologyService: TechnologyService;
    statisticsService: StatisticsService;

    constructor(
        gameRepo: Repository<Game>,
        specialistService: SpecialistService,
        achievementService: UserAchievementService,
        cullWaypointsService: CullWaypointsService,
        playerCreditsService: PlayerCreditsService,
        starService: StarService,
        gameTypeService: GameTypeService,
        specialistBanService: SpecialistBanService,
        technologyService: TechnologyService,
        statisticsService: StatisticsService,
    ) {
        this.gameRepo = gameRepo;
        this.specialistService = specialistService;
        this.achievementService = achievementService;
        this.cullWaypointsService = cullWaypointsService;
        this.playerCreditsService = playerCreditsService;
        this.starService = starService;
        this.gameTypeService = gameTypeService;
        this.specialistBanService = specialistBanService;
        this.technologyService = technologyService;
        this.statisticsService = statisticsService;
    }

    async hireCarrierSpecialist(game: Game, player: Player, carrierId: DBObjectId, specialistId: number) {
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            throw new ValidationError('The game settings has disabled the hiring of specialists.');
        }

        if (this.specialistBanService.isCarrierSpecialistBanned(game, specialistId)) {
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
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist or is disabled.`);
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

            if (carrierSpecialist && carrierSpecialist.oneShot) {
                throw new ValidationError(`The current specialist cannot be replaced.`);
            }
        }

        carrier.specialistId = specialist.id;
        carrier.specialistExpireTick = specialist.expireTicks ? game.state.tick + specialist.expireTicks : null;

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
                        'galaxy.carriers.$.specialistId': carrier.specialistId,
                        'galaxy.carriers.$.specialistExpireTick': carrier.specialistExpireTick
                    }
                }
            }
        ]);

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure.specialistsHired += 1;
            });
        }

        // TODO: Need to consider local and global effects and update the UI accordingly.

        carrier.effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(game, carrier, true);

        let waypoints = await this.cullWaypointsService.cullWaypointsByHyperspaceRangeDB(game, carrier);

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

        if (this.specialistBanService.isStarSpecialistBanned(game, specialistId)) {
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
            throw new ValidationError(`A specialist with ID ${specialistId} does not exist or is disabled.`);
        }

        if (star.specialistId && star.specialistId === specialist.id) {
            throw new ValidationError(`The star already has the specialist assigned.`);
        }
        
        // Calculate whether the player can afford to buy the specialist.
        if (!this._canAffordSpecialist(game, player, specialist)) {
            throw new ValidationError(`You cannot afford to buy this specialist.`);
        }

        // // If the specialist is one that destroys stars and the target star is a worm hole, we cannot allow
        // // this due to an exploit where worm holes become effectively one way since a player may go through a worm hole
        // // but cannot see any nearby stars due to no scanning range. This is only really a problem when stellar bombs are banned.
        // // TODO: Find a more effective solution to this exploit, ideally we want to allow war machines on worm holes.
        // if (specialist.modifiers.special && (specialist.modifiers.special.addNaturalResourcesOnTick || 0) < 0 && star.wormHoleToStarId != null) {
        //     throw new ValidationError(`Cannot hire a War Machine on a Worm Hole star.`);
        // }

        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        if (star.specialistId) {
            let starSpecialist = this.specialistService.getByIdStar(star.specialistId);

            if (starSpecialist && starSpecialist.oneShot) {
                throw new ValidationError(`The current specialist cannot be replaced.`);
            }
        }

        // If the spec hired is one that builds worm holes, validate that the star isn't already a worm hole.
        if (star.wormHoleToStarId && specialist.modifiers.special?.wormHoleConstructor) {
            throw new ValidationError(`The star already has a worm hole connected to another star.`);
        }

        star.specialistId = specialist.id;
        star.specialistExpireTick = specialist.expireTicks ? game.state.tick + specialist.expireTicks : null;

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
                        'galaxy.stars.$.specialistId': star.specialistId,
                        'galaxy.stars.$.specialistExpireTick': star.specialistExpireTick
                    }
                }
            }
        ]);

        if (player.userId && !player.defeated && !this.gameTypeService.isTutorialGame(game)) {
            await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                stats.infrastructure.specialistsHired += 1;
            });
        }

        // TODO: The star may have its manufacturing changed so return back the new manufacturing.
        // TODO: Scanning changes are done by refreshing the entire game on the UI, would be ideally better to calculate it here?
        // TODO: Need to consider local and global effects and update the UI accordingly.

        star.effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star, true);

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

    async _deductSpecialistCost(game: Game, player: Player, specialist: Specialist) {
        let cost = this.specialistService.getSpecialistActualCost(game, specialist);

        switch (game.settings.specialGalaxy.specialistsCurrency) {
            case 'credits':
                player.credits -= cost.credits;

                return await this.playerCreditsService.addCredits(game, player, -cost.credits, false);
            case 'creditsSpecialists':
                player.creditsSpecialists -= cost.creditsSpecialists;

                return await this.playerCreditsService.addCreditsSpecialists(game, player, -cost.creditsSpecialists, false);
            default:
                throw new Error(`Unsupported specialist currency type: ${game.settings.specialGalaxy.specialistsCurrency}`);
        }
        
    }

};
