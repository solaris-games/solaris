import {GameResourceDistribution} from "@solaris-common";

const RNG = require('random-seed');
import { ValidationError } from "@solaris-common";
import { Location } from "../types/Location";
import DistanceService from "../distance";
import GameTypeService from "../gameType";
import RandomService from "../random";
import ResourceService from "../resource";
import StarService from "../star";
import StarDistanceService from "../starDistance";

export default class CircularBalancedMapService {

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

    _generateStarPositionInSector(currentRadius: number, rng, playerCount: number) {
        const tau = 2.0*Math.PI;
        let angle = rng.random()*(tau/playerCount);
        //let angle = (tau/playerCount);
        let posx = 0;
        let posy = currentRadius/2.0 + rng.random()*(currentRadius*2.0);

        return {
          x: Math.cos(angle)*posx + Math.sin(angle)*posy,
          y: Math.sin(angle)*-posx + Math.cos(angle)*posy,
          linked: false
        };
    }

    _getRotatedLocation(location: Location, angle: number) {
        return {
          x: Math.cos(angle)*location.x + Math.sin(angle)*location.y,
          y: Math.sin(angle)*-location.x + Math.cos(angle)*location.y,
          homeStar: null,
          distanceToClosestReachable: null,
          closestReachable: null,
          linkedLocations: []
        };
    }

    _moveLocationTowards(location, towards, minDistance: number) {
        let dx = towards.x - location.x;
        let dy = towards.y - location.y;
        let dist = this.distanceService.getDistanceBetweenLocations(location, towards);
        if (dist < minDistance) { return; }
        let amount = 1.0-(minDistance/dist);
        location.x += dx*amount;
        location.y += dy*amount;
    }

    generateLocations(game, starCount: number, resourceDistribution: GameResourceDistribution, playerCount: number): Location[] {
        if (this.gameTypeService.isKingOfTheHillMode(game)) {
            throw new ValidationError(`King of the hill is not supported in circular balanced maps.`);
        }

        const locations: any[] = [];
        let seed = ( Math.random()*(10**8) ).toFixed(0);
        const rng = RNG.create(seed); //TODO get seed from player
        const tau = 2.0*Math.PI;
        
        let currentRadius = game.constants.distances.minDistanceBetweenStars;
        let radiusStep = game.constants.distances.minDistanceBetweenStars;
        let maxTries = 2;
        let sectorAngle = tau/playerCount;

        do {
            let createdLocations = false;

            // Try to find a set of locations X number of times.
            // if a location is rejected, all locations on this set are rejected aswell
            // otherwise, all are accepted
            // this garantees that evey sector is identical
            for (let i = 0; i < maxTries; i++) {
                let candidateLocations: any[] = [];
                let baseLocation = this._generateStarPositionInSector(currentRadius, rng, playerCount);
                let locationRejected = false;

                for (let sectorIndex = 0; sectorIndex<playerCount; sectorIndex++) {
                  let location = this._getRotatedLocation(baseLocation, sectorIndex*sectorAngle);

                  // Stars must not be too close to eachother.
                  if ((this.isLocationTooCloseToOthers(game, location, locations)) ||
                    (this.isLocationTooCloseToOthers(game, location, candidateLocations)) ) {
                      locationRejected = true;
                      break;
                  }

                  candidateLocations.push(location);
                }

                if (locationRejected) { continue; }

                locations.push(...candidateLocations);
                createdLocations = true;
                break;
            }

            // If we didn't find a valid location, increase radius.
            if (!createdLocations) {
                currentRadius += radiusStep;
            }
        } while (locations.length < starCount);

        // choose home stars

        // The desired distance from the center is half way from the galaxy center and the edge.
        const distanceFromCenter = this.starDistanceService.getMaxGalaxyDiameter(locations) / 2 / 2;
        let playerAngle = (sectorAngle/2.0);//take a location from the middle of the sector
        let desiredLocation = this._getRotatedLocation({x: 0.0, y: distanceFromCenter}, playerAngle);
        let firstHomeLocation = this.distanceService.getClosestLocation(desiredLocation, locations);
        let firstHomeLocationIndex = locations.indexOf(firstHomeLocation);

        for(let i=0; i<playerCount; i++) {
            let locationIndex = (firstHomeLocationIndex+i);
            locations[locationIndex].homeStar = true;
        }
        
        let homeLocations = locations.filter( (location) => { return location.homeStar; } );
        let initialHyperRange = game.settings.technology.startingTechnologyLevel.hyperspace;
        let startingStarsCount = game.settings.player.startingStars-1;

        for(let homeLocation of homeLocations) {
            homeLocation.linkedLocations = [];
        }

        let unlinkedLocations = locations.filter( (loc) => { return !loc.homeStar;} );

        while(startingStarsCount--) {
            for(let homeLocation of homeLocations) {
                let closestUnlinkedLocation = this.distanceService.getClosestLocation(homeLocation, unlinkedLocations) as any;
                homeLocation.linkedLocations.push(closestUnlinkedLocation);
                closestUnlinkedLocation.linked = true;
                unlinkedLocations = unlinkedLocations.filter( (loc) => { return loc !== closestUnlinkedLocation; } );
            }
        }

        // pull the closest stars that will be linked so they are in hyper range
        let minimumClaimDistance = this.distanceService.getHyperspaceDistance(game, initialHyperRange)-2;//-2 to avoid floating point imprecisions

        for(let homeLocation of homeLocations) {
            let reachableLocations: any[] = [];
            let unreachebleLocations: any[] = [];

            reachableLocations.push(homeLocation);
            
            for(let location of homeLocation.linkedLocations) {
                unreachebleLocations.push(location);
            }

            while( unreachebleLocations.length > 0) {
                //find the unreachable location that is closer to any of the reachable locations
                for(let unreachebleLocation of unreachebleLocations) {
                    let distanceToClosestReachable;
                    let closestReachableLocation;
                    let smallestDistance = Number.MAX_VALUE;
                    
                    for(let reachableLocation of reachableLocations) {
                        let distance = this.distanceService.getDistanceBetweenLocations(unreachebleLocation, reachableLocation);
                        
                        if (distance < smallestDistance ) { 
                            smallestDistance = distance;
                            distanceToClosestReachable = distance;
                            closestReachableLocation = reachableLocation;
                        }
                    }

                    unreachebleLocation.distanceToClosestReachable = distanceToClosestReachable;
                    unreachebleLocation.closestReachable = closestReachableLocation;
                }

                let closestUnreachable = unreachebleLocations[0];

                for (let unreachebleLocation of unreachebleLocations) {
                    if (unreachebleLocation.distanceToClosestReachable! < closestUnreachable.distanceToClosestReachable!) {
                        closestUnreachable = unreachebleLocation;
                    }
                }

                this._moveLocationTowards(closestUnreachable, closestUnreachable.closestReachable!, minimumClaimDistance);
                
                // after moving closer we can change the location from the unreachable to the reachable array
                unreachebleLocations.splice(unreachebleLocations.indexOf(closestUnreachable), 1);
                reachableLocations.push(closestUnreachable);
            }

            //now all linked stars should be reachable
        }

        this.resourceService.distribute(game, locations, resourceDistribution);

        return locations;
    }

    isLocationTooCloseToOthers(game, location: Location, locations: Location[]): boolean {
        return locations.find(l => this.starDistanceService.isLocationTooClose(game, location, l)) != null;
    }

};

