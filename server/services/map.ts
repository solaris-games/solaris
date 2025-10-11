import { Game } from "./types/Game";
import { Star } from "./types/Star";
import { GameTypeService } from 'solaris-common'
import CircularMapService from "./maps/circular";
import CircularBalancedMapService from "./maps/circularBalanced";
import DoughnutMapService from "./maps/doughnut";
import IrregularMapService from "./maps/irregular";
import SpiralMapService from "./maps/spiral";
import NameService from "./name";
import RandomService from "./random";
import StarService from "./star";
import { StarDistanceService } from 'solaris-common';
import { ValidationError } from "solaris-common";
import { shuffle, RandomGen } from "solaris-common";
import { DBObjectId } from "./types/DBObjectId";

const OFFSET = 20000;

export default class MapService {
    randomService: RandomService;
    starService: StarService;
    starDistanceService: StarDistanceService;
    nameService: NameService;
    circularMapService: CircularMapService;
    spiralMapService: SpiralMapService;
    doughnutMapService: DoughnutMapService;
    circularBalancedMapService: CircularBalancedMapService;
    irregularMapService: IrregularMapService;
    gameTypeService: GameTypeService;

    constructor(
        randomService: RandomService,
        starService: StarService,
        starDistanceService: StarDistanceService,
        nameService: NameService,
        circularMapService: CircularMapService,
        spiralMapService: SpiralMapService,
        doughnutMapService: DoughnutMapService,
        circularBalancedMapService: CircularBalancedMapService,
        irregularMapService: IrregularMapService,
        gameTypeService: GameTypeService
    ) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.nameService = nameService;
        this.circularMapService = circularMapService;
        this.spiralMapService = spiralMapService;
        this.doughnutMapService = doughnutMapService;
        this.circularBalancedMapService = circularBalancedMapService;
        this.irregularMapService = irregularMapService;
        this.gameTypeService = gameTypeService;
    }

    generateStars(rand: RandomGen, game: Game, starCount: number, playerLimit: number, customSeed?: string | null) {
        const stars: Star[] = [];
        const homeStarIds: DBObjectId[] = [];
        const linkedStarIds: DBObjectId[][] = [];

        // Get an array of random star names for however many stars we want.
        const starNames = this.nameService.getRandomStarNames(starCount);

        // Generate all of the locations for stars.
        let starLocations: any[] = [];

        // TODO: Use randGen for all generators

        switch (game.settings.galaxy.galaxyType) {
            case 'circular':
                starLocations = this.circularMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution);
                break;
            case 'spiral':
                starLocations = this.spiralMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution);
                break;
            case 'doughnut':
                starLocations = this.doughnutMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution);
                break;
            case 'circular-balanced':
                starLocations = this.circularBalancedMapService.generateLocations(game, starCount, game.settings.specialGalaxy.resourceDistribution, playerLimit);
                break;
            case 'irregular':
                starLocations = this.irregularMapService.generateLocations(rand, game, starCount, game.settings.specialGalaxy.resourceDistribution, playerLimit, customSeed);
                break;
            default:
                throw new ValidationError(`Galaxy type ${game.settings.galaxy.galaxyType} is not supported or has been disabled.`);
        }

        let starNamesIndex = 0;

        let unlinkedStars = starLocations.filter(l => !l.linked);

        // Create a star for all locations returned by the map generator
        for (let i = 0; i < unlinkedStars.length; i++) {
            let starLocation: any = unlinkedStars[i];

            let star;
            let starName = starNames[starNamesIndex++];

            star = this.starService.generateUnownedStar(starName, starLocation, starLocation.resources);

            stars.push(star);

            if (starLocation.homeStar) {
                let locLinkedStars: DBObjectId[] = [];

                for (let linkedLocation of starLocation.linkedLocations) {
                    let linkedStar;
                    let linkedStarName = starNames[starNamesIndex++];

                    linkedStar = this.starService.generateUnownedStar(linkedStarName, linkedLocation, linkedLocation.resources);

                    stars.push(linkedStar);
                    locLinkedStars.push(linkedStar._id);
                }

                homeStarIds.push(star._id)
                linkedStarIds.push(locLinkedStars);
            }
        }

        return {
            stars,
            homeStarIds,
            linkedStarIds,
            starLocations
        };
    }

    translateCoordinates(game: Game) {
        if (!this.gameTypeService.isDarkMode(game)) {
            return;
        }

        const offsetX = this.randomService.getRandomNumberBetween(-OFFSET, OFFSET);
        const offsetY = this.randomService.getRandomNumberBetween(-OFFSET, OFFSET);

        for (let star of game.galaxy.stars) {
            star.location.x += offsetX;
            star.location.y += offsetY;
        }
    }

    generateTerrain(rand: RandomGen, game: Game) {
        const playerCount = game.settings.general.playerLimit;

        // If warp gates are enabled, assign random stars to start as warp gates.
        if (game.settings.specialGalaxy.randomWarpGates) {
            this._generateGates(rand, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomWarpGates);
        }

        // If worm holes are enabled, assign random warp gates to start as worm hole pairs
        if (game.settings.specialGalaxy.randomWormHoles) {
            this._generateWormHoles(rand, game, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomWormHoles);
        }

        // If nebulas are enabled, assign random nebulas to start
        if (game.settings.specialGalaxy.randomNebulas) {
            this._generateNebulas(rand, game, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomNebulas);
        }

        // If asteroid fields are enabled, assign random asteroid fields to start
        if (game.settings.specialGalaxy.randomAsteroidFields) {
            this._generateAsteroidFields(rand, game, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomAsteroidFields);
        }

        // If binary stars are enabled, assign random binary stars to start
        if (game.settings.specialGalaxy.randomBinaryStars) {
            this._generateBinaryStars(rand, game, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomBinaryStars);
        }

        // If black holes are enabled, assign random black holes to start
        if (game.settings.specialGalaxy.randomBlackHoles) {
            this._generateBlackHoles(rand, game, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomBlackHoles);
        }

        // If pulsars are enabled, assign random pulsars to start
        if (game.settings.specialGalaxy.randomPulsars) {
            this._generatePulsars(rand, game, game.galaxy.stars, playerCount, game.settings.specialGalaxy.randomPulsars);
        }
    }

    _generateGates(rand: RandomGen, stars: Star[], playerCount: number, percentage: number) {
        const gateCount = Math.floor((stars.length - playerCount) / 100 * percentage);

        const applicableStars = stars.filter(s => !s.homeStar && !s.warpGate && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const warpGateStars = applicableStars.slice(0, gateCount);

        for (let star of warpGateStars) {
            star.warpGate = true;
        }
    }

    _generateWormHoles(rand: RandomGen, game: Game, stars: Star[], playerCount: number, percentage: number) {
        const wormHoleCount = Math.floor((stars.length - playerCount) / 2 / 100 * percentage); // Wormholes come in pairs so its half of stars

        const applicableStars = stars.filter(s => !s.homeStar && !s.wormHoleToStarId && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const wormHoleStars = applicableStars.slice(0, wormHoleCount * 2);

        for (let i = 0; i < wormHoleCount; i++) {
            const starA = wormHoleStars[i * 2];
            const starB = wormHoleStars[i * 2 + 1];
            starA.wormHoleToStarId = starB._id;
            starB.wormHoleToStarId = starA._id;
        }
    }

    _generateNebulas(rand: RandomGen, game: Game, stars: Star[], playerCount: number, percentage: number) {
        const count = Math.floor((stars.length - playerCount) / 100 * percentage);

        const applicableStars = stars.filter(s => !s.homeStar && !s.isNebula && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const nebulaStars = applicableStars.slice(0, count);

        for (let nebulaStar of nebulaStars) {
            nebulaStar.isNebula = true;

            // Overwrite natural resources if splitResources
            if (this.gameTypeService.isSplitResources(game)) {
                let minResources = game.constants.star.resources.maxNaturalResources * 1.5;
                let maxResources = game.constants.star.resources.maxNaturalResources * 3;

                nebulaStar.naturalResources.science = this.randomService.getRandomNumberBetween(minResources, maxResources);
            }
        }
    }

    _generateAsteroidFields(rand: RandomGen, game: Game, stars: Star[], playerCount: number, percentage: number) {
        const count = Math.floor((stars.length - playerCount) / 100 * percentage);

        const applicableStars = stars.filter(s => !s.homeStar && !s.isAsteroidField && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const asteroidFieldStars = applicableStars.slice(0, count);

        for (let asteroidFieldStar of asteroidFieldStars) {
            asteroidFieldStar.isAsteroidField = true;

            // Overwrite natural resources if splitResources
            if (this.gameTypeService.isSplitResources(game)) {
                let minResources = game.constants.star.resources.maxNaturalResources * 1.5;
                let maxResources = game.constants.star.resources.maxNaturalResources * 3;

                asteroidFieldStar.naturalResources.economy = this.randomService.getRandomNumberBetween(minResources, maxResources);
            }
        }
    }

    _generateBinaryStars(rand: RandomGen, game: Game, stars: Star[], playerCount: number, percentage: number) {
        const minResources = game.constants.star.resources.maxNaturalResources * 1.5;
        const maxResources = game.constants.star.resources.maxNaturalResources * 3;

        const count = Math.floor((stars.length - playerCount) / 100 * percentage);

        const applicableStars = stars.filter(s => !s.homeStar && !s.isBinaryStar && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const binaryStars = applicableStars.slice(0, count);

        for (let binaryStar of binaryStars) {
            binaryStar.isBinaryStar = true;

            // Overwrite natural resources
            if (this.gameTypeService.isSplitResources(game)) {
                binaryStar.naturalResources.industry = this.randomService.getRandomNumberBetween(minResources, maxResources);
            } else {
                let resources = this.randomService.getRandomNumberBetween(minResources, maxResources);

                binaryStar.naturalResources = {
                    economy: resources,
                    industry: resources,
                    science: resources
                };
            }
        }
    }

    _generateBlackHoles(rand: RandomGen, game: Game, stars: Star[], playerCount: number, percentage: number) {
        const count = Math.floor((stars.length - playerCount) / 100 * percentage);

        const applicableStars = stars.filter(s => !s.homeStar && !s.isBlackHole && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const blackHoleStars = applicableStars.slice(0, count);

        for (let blackHoleStar of blackHoleStars) {
            blackHoleStar.isBlackHole = true;

            // Overwrite the natural resources
            blackHoleStar.naturalResources.economy = Math.ceil(blackHoleStar.naturalResources.economy * 0.2);
            blackHoleStar.naturalResources.industry = Math.ceil(blackHoleStar.naturalResources.industry * 0.2);
            blackHoleStar.naturalResources.science = Math.ceil(blackHoleStar.naturalResources.science * 0.2);
        }
    }

    _generatePulsars(rand: RandomGen, game: Game, stars: Star[], playerCount: number, percentage: number) {
        const count = Math.floor((stars.length - playerCount) / 100 * percentage);

        const applicableStars = stars.filter(s => !s.homeStar && !s.isPulsar && !this.starService.isDeadStar(s));
        shuffle(rand, applicableStars);

        const pulsarStars = applicableStars.slice(0, count);

        for (let pulsarStar of pulsarStars) {
            pulsarStar.isPulsar = true;
        }
    }

};
