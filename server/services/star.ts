import { shuffle } from "solaris-common";
import mongoose from 'mongoose';
import { DBObjectId } from './types/DBObjectId';
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Carrier } from './types/Carrier';
import { Game } from './types/Game';
import { Location } from './types/Location';
import { Player } from './types/Player';
import { InfrastructureType, NaturalResources, Star, TerraformedResources } from './types/Star';
import { User } from './types/User';
import { DistanceService } from 'solaris-common';
import GameStateService from './gameState';
import { GameTypeService } from 'solaris-common'
import NameService from './name';
import RandomService from './random';
import SpecialistService from './specialist';
import { StarDistanceService } from 'solaris-common';
import { TechnologyService } from 'solaris-common';
import UserService from './user';
import { MathRandomGen } from "../utils/randomGen";
import StatisticsService from "./statistics";
import { GameSettings } from "solaris-common";
import EventEmitter from "events";
import { StarDataService } from "solaris-common";

const RNG = require('random-seed');

export const StarServiceEvents = {
    onPlayerStarAbandoned: 'onPlayerStarAbandoned',
    onPlayerStarDied: 'onPlayerStarDied',
    onPlayerStarReignited: 'onPlayerStarReignited'
}

export default class StarService extends EventEmitter {
    gameRepo: Repository<Game>;
    randomService: RandomService;
    nameService: NameService;
    distanceService: DistanceService;
    starDistanceService: StarDistanceService;
    technologyService: TechnologyService;
    specialistService: SpecialistService;
    userService: UserService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    statisticsService: StatisticsService;
    starDataService: StarDataService;

    constructor(
        gameRepo: Repository<Game>,
        randomService: RandomService,
        nameService: NameService,
        distanceService: DistanceService,
        starDistanceService: StarDistanceService,
        technologyService: TechnologyService,
        specialistService: SpecialistService,
        userService: UserService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        statisticsService: StatisticsService,
        starDataService: StarDataService,
    ) {
        super();

        this.gameRepo = gameRepo;
        this.randomService = randomService;
        this.nameService = nameService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.userService = userService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.statisticsService = statisticsService;
        this.starDataService = starDataService;
    }

    generateUnownedStar(name: string, location: Location, naturalResources: NaturalResources) {
        naturalResources = naturalResources || {
            economy: 0,
            industry: 0,
            science: 0
        };

        return {
            _id: new mongoose.Types.ObjectId(),
            name,
            location,
            naturalResources,
            infrastructure: {
                economy: 0,
                industry: 0,
                science: 0
            }
        };
    }

    generateStarPosition(game: Game, originX: number, originY: number, radius: number) {
        if (radius == null) {
            radius = game.constants.distances.maxDistanceBetweenStars;
        }

        return this.randomService.getRandomPositionInCircleFromOrigin(originX, originY, radius);
    }

    getById(game: Game, id: DBObjectId | string) {
        return this.getByIdBS(game, id); // Experimental
    }

    getByIdBS(game: Game, id: DBObjectId | string) {
        return this.getByIdBSForStars<Star>(game.galaxy.stars, id);
    }

    _binarySearchIndex<T extends { _id: DBObjectId | string }>(stars: T[], id: DBObjectId | string) {
        let low = 0,
            high = stars.length;

        while (low < high) {
            // the midpoint is both the lower and upper bounds of the search area bit shifted one bit to the right to divide by 2
            let mid = (low + high) >>> 1;
            // if the midpoint is less than the target, then the target is in the upper half of the search area
            if (stars[mid]._id.toString() < id.toString()) low = mid + 1;
            // otherwise the target is in the lower half of the search area
            else high = mid;
        }
        // return the index of the found value (or where it would be if it were there)
        return low;
    }

    binarySearchStars<T extends { _id: DBObjectId | string }>(stars: T[], id: DBObjectId | string): T | undefined {
        const index = this._binarySearchIndex(stars, id.toString());
        if (stars[index] && stars[index]._id.toString() === id.toString()) {
            return stars[index];
        }
        // id wasn't found, return undefined to match how array.find handles not finding an item
        return undefined;
    }

    getByIdBSForStars<T extends { _id: DBObjectId | string }>(stars: T[], id: DBObjectId | string): T {
        let star = this.binarySearchStars(stars, id);
        if (star) {
            return star;
        }
        // id wasn't found
        // Return the old way
        return stars.find(s => s._id.toString() === id.toString())!;
    }

    setupHomeStar(game: Game, homeStar: Star, player: Player, gameSettings: GameSettings<DBObjectId>) {
        // Set up the home star
        player.homeStarId = homeStar._id;
        homeStar.ownedByPlayerId = player._id;

        this.resetIgnoreBulkUpgradeStatuses(homeStar);

        homeStar.homeStar = true;
        homeStar.warpGate = false;
        homeStar.specialistId = null;

        homeStar.naturalResources.economy = game.constants.star.resources.maxNaturalResources;
        homeStar.naturalResources.industry = game.constants.star.resources.maxNaturalResources;
        homeStar.naturalResources.science = game.constants.star.resources.maxNaturalResources;

        // Seed the home star with the starting infrastructure.
        homeStar.infrastructure.economy = gameSettings.player.startingInfrastructure.economy;
        homeStar.infrastructure.industry = gameSettings.player.startingInfrastructure.industry;
        homeStar.infrastructure.science = gameSettings.player.startingInfrastructure.science;

        homeStar.shipsActual = Math.max(gameSettings.player.startingShips, 1); // Must be at least 1 ship at the home star so that a carrier can be built there.
        homeStar.ships = homeStar.shipsActual;

    }

    getPlayerHomeStar(stars: Star[], player: Player) {
        return this.listStarsOwnedByPlayer(stars, player._id).find(s => s._id.toString() === player.homeStarId!.toString());
    }

    listStarsOwnedByPlayer(stars: Star[], playerId: DBObjectId) {
        return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.toString() === playerId.toString());
    }

    listStarsOwnedByPlayers(stars: Star[], playerIds: DBObjectId[]) {
        const ids = playerIds.map(p => p.toString());

        return stars.filter(s => s.ownedByPlayerId && ids.includes(s.ownedByPlayerId.toString()));
    }

    listStarIdsWithPlayerCarriersInOrbit(game: Game, playerId: DBObjectId): string[] {
        return game.galaxy.carriers
            .filter(c => c.orbiting)
            .filter(c => c.ownedByPlayerId!.toString() === playerId.toString())
            .map(c => c.orbiting!.toString());
    }

    listStarIdsWithPlayersCarriersInOrbit(game: Game, playerIds: DBObjectId[]): string[] {
        const ids = playerIds.map(p => p.toString());

        return game.galaxy.carriers
            .filter(c => c.orbiting)
            .filter(c => ids.includes(c.ownedByPlayerId!.toString()))
            .map(c => c.orbiting!.toString());
    }

    listStarsOwnedOrInOrbitByPlayers(game: Game, playerIds: DBObjectId[]): Star[] {
        let starIds: string[] = this.listStarsOwnedByPlayers(game.galaxy.stars, playerIds).map(s => s._id.toString());

        if (game.settings.diplomacy.enabled === 'enabled') { // Don't need to check in orbit carriers if alliances is disabled
            starIds = starIds.concat(this.listStarIdsWithPlayersCarriersInOrbit(game, playerIds));
        }

        starIds = [...new Set(starIds)];

        return starIds
            .map(id => this.getById(game, id));
    }

    listStarsOwnedByPlayerBulkIgnored(stars: Star[], playerId: DBObjectId, infrastructureType: InfrastructureType) {
        return this.listStarsOwnedByPlayer(stars, playerId)
            .filter(s => s.ignoreBulkUpgrade![infrastructureType]);
    }

    calculateActualNaturalResources(star: Star): NaturalResources {
        return {
            economy: Math.max(Math.floor(star.naturalResources.economy), 0),
            industry: Math.max(Math.floor(star.naturalResources.industry), 0),
            science: Math.max(Math.floor(star.naturalResources.science), 0)
        }
    }

    calculateTerraformedResources(star: Star, terraforming: number): TerraformedResources {
        return {
            economy: this.calculateTerraformedResource(star.naturalResources.economy, terraforming),
            industry: this.calculateTerraformedResource(star.naturalResources.industry, terraforming),
            science: this.calculateTerraformedResource(star.naturalResources.science, terraforming)
        }
    }

    calculateTerraformedResource(naturalResource: number, terraforming: number) {
        return Math.floor(naturalResource + (5 * terraforming));
    }

    async abandonStar(game: Game, player: Player, starId: DBObjectId) {
        if (game.settings.player.allowAbandonStars === 'disabled') {
            throw new ValidationError(`Abandoning stars has been disabled in this game.`);
        }

        // Get the star.
        let star = game.galaxy.stars.find(x => x._id.toString() === starId.toString())!;

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
                && x.orbiting.toString() === star._id.toString()
                && x.ownedByPlayerId!.toString() === player._id.toString()
            );

        for (let playerCarrier of playerCarriers) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(playerCarrier), 1);
        }

        star.ownedByPlayerId = null;
        star.shipsActual = 0;
        star.ships = star.shipsActual;

        await game.save();

        this.emit(StarServiceEvents.onPlayerStarAbandoned, {
            gameId: game._id,
            gameTick: game.state.tick,
            player,
            star
        });
    }

    canPlayersSeeStarShips(star: Star, playerIds: DBObjectId[]) {
        const ids = playerIds.map(p => p.toString());
        const isOwnedByPlayer = ids.includes((star.ownedByPlayerId || '').toString());

        if (isOwnedByPlayer) {
            return true;
        }

        // Nebula always hides ships for other players
        if (star.isNebula) {
            return false;
        }

        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            // If the star has a hideShips spec and is not owned by the given player
            // then that player cannot see the carrier's ships.
            if (specialist && specialist.modifiers.special && specialist.modifiers.special.hideShips) {
                return false;
            }
        }

        return true;
    }

    claimUnownedStar(game: Game, gameUsers: User[], star: Star, carrier: Carrier) {
        if (star.ownedByPlayerId) {
            throw new ValidationError(`Cannot claim an owned star`);
        }

        star.ownedByPlayerId = carrier.ownedByPlayerId;

        this.resetIgnoreBulkUpgradeStatuses(star);

        // Weird scenario, but could happen.
        if (carrier.isGift) {
            carrier.isGift = false;
        }

        let carrierPlayer = game.galaxy.players.find(p => p._id.toString() === carrier.ownedByPlayerId!.toString())!;
        let carrierUser = gameUsers.find(u => carrierPlayer.userId && u._id.toString() === carrierPlayer.userId.toString()) || null;

        if (carrierUser && !carrierPlayer.defeated && !this.gameTypeService.isTutorialGame(game)) {
            this.statisticsService.modifyStats(game._id, carrierPlayer._id, (stats) => {
                stats.combat.stars.captured++;

                if (star.homeStar) {
                    stats.combat.homeStars.captured++;
                }
            });
        }
    }

    applyStarSpecialistSpecialModifiers(game: Game) {
        // NOTE: Specialist modifiers that affect stars on tick only apply
        // to stars that are owned by players. i.e NOT abandoned stars.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = game.galaxy.stars[i];

            if (star.ownedByPlayerId) {
                if (star.specialistId) {
                    let specialist = this.specialistService.getByIdStar(star.specialistId);

                    if (specialist && specialist.modifiers.special) {
                        if (specialist.modifiers.special.addNaturalResourcesOnTick) {
                            this.addNaturalResources(game, star, specialist.modifiers.special.addNaturalResourcesOnTick);
                        }
                    }
                }
            }
        }
    }

    addNaturalResources(game: Game, star: Star, amount: number) {
        let wasDeadStar = this.starDataService.isDeadStar(star);

        if (this.gameTypeService.isSplitResources(game)) {
            let total = star.naturalResources.economy + star.naturalResources.industry + star.naturalResources.science;

            star.naturalResources.economy += 3 * amount * (star.naturalResources.economy / total);
            star.naturalResources.industry += 3 * amount * (star.naturalResources.industry / total);
            star.naturalResources.science += 3 * amount * (star.naturalResources.science / total);
        } else {
            star.naturalResources.economy += amount;
            star.naturalResources.industry += amount;
            star.naturalResources.science += amount;
        }

        // TODO: Allow negative values here so we can keep the ratio.
        if (Math.floor(star.naturalResources.economy) <= 0) {
            star.naturalResources.economy = 0;
        }

        if (Math.floor(star.naturalResources.industry) <= 0) {
            star.naturalResources.industry = 0;
        }

        if (Math.floor(star.naturalResources.science) <= 0) {
            star.naturalResources.science = 0;
        }

        // if the star reaches 0 of all resources then reduce the star to a dead hunk.
        if (this.starDataService.isDeadStar(star)) {
            star.specialistId = null;
            star.warpGate = false;
            star.infrastructure.economy = 0;
            star.infrastructure.industry = 0;
            star.infrastructure.science = 0;

            if (star.ownedByPlayerId) {
                this.emit(StarServiceEvents.onPlayerStarDied, {
                    gameId: game._id,
                    gameTick: game.state.tick,
                    playerId: star.ownedByPlayerId,
                    starId: star._id,
                    starName: star.name
                });
            }
        }
        // If it was a dead star but is now not a dead star then it has been reignited.
        else if (wasDeadStar && star.ownedByPlayerId) {
            this.emit(StarServiceEvents.onPlayerStarReignited, {
                gameId: game._id,
                gameTick: game.state.tick,
                playerId: star.ownedByPlayerId,
                starId: star._id,
                starName: star.name
            });
        }
    }

    reigniteDeadStar(game: Game, star: Star, naturalResources: NaturalResources) {
        if (!this.starDataService.isDeadStar(star)) {
            throw new Error('The star cannot be reignited, it is not dead.');
        }

        star.naturalResources = naturalResources;

        if (star.ownedByPlayerId) {
            this.emit(StarServiceEvents.onPlayerStarReignited, {
                gameId: game._id,
                gameTick: game.state.tick,
                playerId: star.ownedByPlayerId,
                starId: star._id,
                starName: star.name
            });
        }
    }

    destroyStar(game: Game, star: Star) {
        game.galaxy.stars.splice(game.galaxy.stars.indexOf(star), 1);

        game.state.stars--;

        // If the star was paired with a worm hole, then clear the other side.
        if (star.wormHoleToStarId) {
            const wormHolePairStar = this.getById(game, star.wormHoleToStarId);

            if (wormHolePairStar) {
                wormHolePairStar.wormHoleToStarId = null;
            }
        }

        // Recalculate how many stars are needed for victory in conquest mode.
        if (game.settings.general.mode === 'conquest' || game.settings.general.mode === 'teamConquest') {
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

    async toggleIgnoreBulkUpgrade(game: Game, player: Player, starId: DBObjectId, infrastructureType: InfrastructureType) {
        let star = this.getById(game, starId);

        if (!star.ownedByPlayerId || star.ownedByPlayerId.toString() !== player._id.toString()) {
            throw new ValidationError(`You do not own this star.`);
        }

        let newValue = star.ignoreBulkUpgrade![infrastructureType] ? false : true;

        let updateObject = {
            $set: {}
        };

        updateObject['$set'][`galaxy.stars.$.ignoreBulkUpgrade.${infrastructureType}`] = newValue

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.stars._id': starId
        }, updateObject);
    }

    async toggleIgnoreBulkUpgradeAll(game: Game, player: Player, starId: DBObjectId, ignoreStatus: boolean) {
        let star = this.getById(game, starId);

        if (!star.ownedByPlayerId || star.ownedByPlayerId.toString() !== player._id.toString()) {
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

    resetIgnoreBulkUpgradeStatuses(star: Star) {
        star.ignoreBulkUpgrade = {
            economy: false,
            industry: false,
            science: false
        }

        return star.ignoreBulkUpgrade;
    }

    listHomeStars(game: Game) {
        return game.galaxy.stars.filter(s => s.homeStar);
    }

    getKingOfTheHillStar(game: Game) {
        const center = this.starDistanceService.getGalaxyCenterOfMass(game.galaxy.stars.map(s => s.location));

        // Note: We have to get the closest one to the center as its possible
        // to move the center star by using a stellar engine so we can't assume
        // the center star will always be at 0,0
        const closestToCenter = game.galaxy.stars.map(star => {
            const distance = this.distanceService.getDistanceBetweenLocations(center, star.location);

            return {
                star,
                distance
            }
        }).sort((a, b) => a.distance - b.distance)[0].star;

        return closestToCenter;
    }

    isKingOfTheHillStar(game: Game, star: Star) {
        return star._id.toString() === this.getKingOfTheHillStar(game)._id.toString();
    }

    setupPlayerStarForGameStart(game: Game, star: Star, player: Player) {
        if (player.homeStarId!.toString() === star._id.toString()) {
            this.setupHomeStar(game, star, player, game.settings);
        } else {
            star.ownedByPlayerId = player._id;
            star.shipsActual = game.settings.player.startingShips;
            star.ships = star.shipsActual;

            star.warpGate = false; // TODO: BUG - This resets warp gates generated by map terrain.
            star.specialistId = null;

            if (game.settings.player.developmentCost.economy !== 'none') {
                star.infrastructure.economy = 0;
            }

            if (game.settings.player.developmentCost.industry !== 'none') {
                star.infrastructure.industry = 0;
            }

            if (game.settings.player.developmentCost.science !== 'none') {
                star.infrastructure.science = 0;
            }

            this.resetIgnoreBulkUpgradeStatuses(star);
        }
    }

    setupStarsForGameStart(game: Game) {
        // If any of the development costs are set to null then we need to randomly
        // assign a portion of stars for each type to be seeded with the starting infrastructure.
        // For example, if eco is disabled then each star in the galaxy will have a 1 in 3 chance of being seeded with eco.
        // Note that we will not allow a mix of seeds, a star can only be seeded with one infrastructure type.
        if (game.settings.player.developmentCost.economy !== 'none' &&
            game.settings.player.developmentCost.industry !== 'none' &&
            game.settings.player.developmentCost.science !== 'none') {
            return;
        }

        // Note: Because each setting is independent, we only want to seed the
        // ones where the development cost is set to none.
        const types: (InfrastructureType | null)[] = [
            game.settings.player.developmentCost.economy === 'none' ? 'economy' : null,
            game.settings.player.developmentCost.industry === 'none' ? 'industry' : null,
            game.settings.player.developmentCost.science === 'none' ? 'science' : null,
        ]

        const rng = RNG.create(game._id.toString());

        for (let star of game.galaxy.stars) {
            const i = rng(types.length);
            const type = types[i];

            if (type == null) {
                continue;
            }

            star.infrastructure[type] = game.settings.player.startingInfrastructure[type];
        }
    }

    pairWormHoleConstructors(game: Game) {
        const constructors = game.galaxy.stars
            .filter(s => s.specialistId && this.specialistService.getByIdStar(s.specialistId)?.modifiers.special?.wormHoleConstructor);

        shuffle(new MathRandomGen(), constructors);

        let pairs = Math.floor(constructors.length / 2);

        if (pairs < 1) {
            return;
        }

        while (pairs--) {
            const starA = constructors.pop()!;
            const starB = constructors.pop()!;

            starA.wormHoleToStarId = starB._id;
            starB.wormHoleToStarId = starA._id;

            starA.specialistId = null;
            starB.specialistId = null;
        }
    }
}
