import { ValidationError } from "solaris-common";
import { Location } from '../types/Location';
import { DistanceService } from 'solaris-common';
import { GameTypeService } from 'solaris-common'
import RandomService from '../random';
import ResourceService from '../resource';
import StarService from '../star';
import StarDistanceService from '../starDistance';
import {GameResourceDistribution} from "solaris-common";

export default class DoughnutMapService {

    randomService: RandomService;
    starService: StarService;
    starDistanceService: StarDistanceService;
    distanceService: DistanceService;
    resourceService: ResourceService;
    gameTypeService: GameTypeService;

    constructor(
        randomService: RandomService,
        starService: StarService,
        starDistanceService: StarDistanceService,
        distanceService: DistanceService,
        resourceService: ResourceService,
        gameTypeService: GameTypeService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
        this.resourceService = resourceService;
        this.gameTypeService = gameTypeService;
    }

    generateLocations(game, starCount: number, resourceDistribution: GameResourceDistribution): Location[] {
        if (this.gameTypeService.isKingOfTheHillMode(game)) {
            throw new ValidationError(`King of the hill is not supported in doughnut maps.`);
        }

        // The starDensity constant can really be a setting, once it is turned into an intuitive variable...
        const starDensity = 1.3 * 10**-4;
        const maxRadius = ((4 * starCount) / (3 * Math.PI * starDensity))**0.5;
        const locations: Location[] = [];

        // Generating locations for each star on the map
        do {
            // Try and find a suitable position for star X
            while(true) {
                let location = this.randomService.getRandomPositionInDoughnut(0.5*maxRadius, maxRadius);

                if (!this.isLocationTooCloseToOthers(game, location, locations)) {
                    locations.push(location)
                    break;
                }
            }

        } while(locations.length < starCount)

        // Giving each star its resources
        this.resourceService.distribute(game, locations, resourceDistribution);

        return locations;
    }

    isLocationTooCloseToOthers(game, location: Location, locations: Location[]): boolean {
        // Return False if there are no stars in range, True if there is a star in range
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};
