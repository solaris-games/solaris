const ValidationError = require("../../errors/validation");
const randomSeeded = require('random-seed');
const simplexNoise = require('simplex-noise');

module.exports = class IrregularMapService {

    constructor(randomService, starService, starDistanceService, distanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
    }
    
    //TODO this is generator agnostic and could be on a base class or service
    _moveLocationTowards(location, towards, minDistance) {
        let dx = towards.x - location.x;
        let dy = towards.y - location.y;
        let dist = this.distanceService.getDistanceBetweenLocations(location, towards);
        if (dist < minDistance) { return; }
        let amount = 1.0-(minDistance/dist);
        location.x += dx*amount;
        location.y += dy*amount;
    }

    //TODO this is generator agnostic and could be on a base class or service
    _removeLocationFromArray(array, location) {
        let index = array.indexOf(location);
        array.splice(index, 1);
    }


    //TODO this is generator agnostic and could be on a base class or service
    _rotatedLocation( location, angle ) {
        return {
          x: Math.cos(angle)*location.x + Math.sin(angle)*location.y,
          y: Math.sin(angle)*-location.x + Math.cos(angle)*location.y
        };
    }

    
    //TODO this is generator agnostic and could be on a base class or service
    _displacedLocation( location1, location2 ) {
        return {
            x: location1.x + location2.x,
            y: location1.y + location2.y
        };
    }

    _getRingCount( starsPerPlayerMin, starsPerPlayerMax ) {
      let ringCount = this._getNecessaryRingCount(starsPerPlayerMin)
      ringCount += 1 
      while(this._getStarCountInRings(ringCount)<starsPerPlayerMax) {
        ringCount += 1 
      }
      ringCount -= 1
      return ringCount
    }

    _getStarCountInRings( ringCount ) {
        let starCount = 0;
        let ringIndex = 0;
        let lastLayerPruning = 0;
        while(ringIndex<ringCount) {
            starCount += lastLayerPruning;
            starCount += 6+(ringIndex*6);
            lastLayerPruning = 4 + ( (ringIndex*6)/2 );
            starCount -= lastLayerPruning;
            ringIndex += 1;
        }
        return starCount;
    }

    _getNecessaryRingCount( starsPerPlayer ) {
        let starCount = 0;
        let ringIndex = 0;
        let lastLayerPruning = 0;
        while(starCount<starsPerPlayer) {
            starCount += lastLayerPruning;
            starCount += 6+(ringIndex*6);
            lastLayerPruning = 4 + ( (ringIndex*6)/2 );
            starCount -= lastLayerPruning;
            ringIndex += 1;
        }
        return ringIndex;
    }

    _generateHomeLocations( pivotDistance, playerCount, rng, simplexNoiseGenerator, noiseSpread ) {
        const ONE_SIXTH = 1.0/6.0;
        const TAU = 2.0*Math.PI;

        let homeLocations = [];
        let firstLocation = { x: 0.0, y: 0.0 };
        homeLocations.push(firstLocation);

        while(homeLocations.length<playerCount) {
            let position;
            let positionIsValid = false;
            let attempts = 0;
            while(!positionIsValid) {
                let baseLocation = homeLocations[rng.range(homeLocations.length)];
                let pivot = { x: pivotDistance, y: 0.0 };
                let pivotRotation = ONE_SIXTH*TAU * rng.range(6);
                pivot = this._rotatedLocation(pivot, pivotRotation);
                pivot = this._displacedLocation(baseLocation, pivot);
                
                position = { x: pivotDistance, y: 0.0 };
                let rotation;
                if(rng.random()<0.5) {
                    rotation = pivotRotation - (ONE_SIXTH*TAU);
                }
                else{
                    rotation = pivotRotation + (ONE_SIXTH*TAU);
                }
                position = this._rotatedLocation(position, rotation);
                position = this._displacedLocation(position, pivot);
                position.noiseIntensity = simplexNoiseGenerator.noise2D(position.x/noiseSpread, position.y/noiseSpread);

                positionIsValid = true;
                for( let homeLocation of homeLocations ) {
                    if( this.distanceService.getDistanceBetweenLocations(position, homeLocation) < pivotDistance ) {
                        positionIsValid = false;
                        break;
                    }
                    if( (position.noiseIntensity>0.65 ) && (attempts<6) ) { 
                        positionIsValid = false;
                        attempts += 1;
                        break;
                    }
                }
            }
            homeLocations.push(position);
        }
        
        return homeLocations;
    }

    _generateSupplementaryHomeLocations( pivotDistance, homeLocations ) {
        const ONE_SIXTH = 1.0/6.0;
        const TAU = 2.0*Math.PI;

        let supplementaryHomeLocations = [];

        for( let homeLocation of homeLocations ) {
            for(let i = 0; i<6; i++) {
                let pivot = { x: pivotDistance, y: 0.0 };
                let pivotRotation = ONE_SIXTH*TAU * i;
                pivot = this._rotatedLocation(pivot, pivotRotation);
                pivot = this._displacedLocation(homeLocation, pivot);

                let position = { x: pivotDistance, y: 0.0 };
                let rotation = (ONE_SIXTH*TAU) * (i+1)
                position = this._rotatedLocation(position, rotation);
                position = this._displacedLocation(pivot, position);
                
                let isValidPosiiton = true;
                for( let homeLocation of homeLocations ) {
                    if(this.distanceService.getDistanceBetweenLocations(homeLocation, position) < pivotDistance) {
                        isValidPosiiton = false;
                    }
                }
                for( let supplementaryHomeLocation of supplementaryHomeLocations ) {
                    if(this.distanceService.getDistanceBetweenLocations(supplementaryHomeLocation, position) < pivotDistance) {
                        isValidPosiiton = false;
                    }
                }
                if(isValidPosiiton) {
                    supplementaryHomeLocations.push( position );
                }
            }
        }
        return supplementaryHomeLocations;
    }
    
    //populates the given `locations` array with new locations around the `baseLocation`
    //locations are created in hexagonal rings around the base locations, respecting a triangular grid
    _generateConcentricHexRingsLocations( baseLocation, ringCount, distance, locations ) {
        const ONE_SIXTH = 1.0/6.0;
        const TAU = 2.0*Math.PI;
        
        for(let ringIndex = 0; ringIndex < ringCount; ringIndex++) {
            for(let sliceIndex = 0; sliceIndex < 6; sliceIndex++) {
                if( (ringIndex==(ringCount-1))&&(sliceIndex<3) ) { continue; } //only create the first 3 edges of the outer ring

                let position = { x: distance+(distance*ringIndex), y: 0.0 };
                let rotation = sliceIndex * ONE_SIXTH*TAU;
                position = this._rotatedLocation(position, rotation);
                position = this._displacedLocation(baseLocation, position);

                if( (ringIndex!=(ringCount-1))||(sliceIndex==3)||(sliceIndex==4) ) {
                    //only add 2 of the corner stars for the last ring
                    locations.push(position);
                }

                for(let i = 0; i < ringIndex; i++ ) {
                    let edgePosition = { x: distance*(i+1), y: 0.0 };
                    let edgeRotation = (sliceIndex+2) * (ONE_SIXTH*TAU);
                    edgePosition = this._rotatedLocation(edgePosition, edgeRotation);
                    edgePosition = this._displacedLocation(position, edgePosition);
                    locations.push(edgePosition);
                }
            }
        }
    }

    _randomlyDislocateLocations(locations, threshold, rng) {
        const ONE_SIXTH = 1.0/6.0;
        const TAU = 2.0*Math.PI;
        for( let location of locations ) {
            let amount = (3.0*(threshold/4.0)) + ((rng.random()*threshold)/4.0);
            amount *= 0.866 // sqrt(3)/2.0
            let rotation = rng.random()*TAU
            let dislocation = { x: amount, y: 0.0 };
            dislocation = this._rotatedLocation(dislocation, rotation);
            let newLocation = this._displacedLocation(location, dislocation);
            //cant set location directly
            location.x = newLocation.x;
            location.y = newLocation.y;
        }
    }

    _pruneLocationsWithNoise(locations, desiredLocationCount, simplexNoiseGenerator, noiseSpread) {
        for( let location of locations ) {
            location.noiseIntensity = simplexNoiseGenerator.noise2D(location.x/noiseSpread, location.y/noiseSpread);
        }
        locations.sort( (loc1, loc2) => {
            return (loc1.noiseIntensity-loc2.noiseIntensity);
        });
        locations.splice(desiredLocationCount);
    }

    //removes locations outside the metaball composed of home locations
    //locations have a chance of beeing removed based on the distance from the metaball
    _pruneLocationsOutsideMetaball(locations, homeLocations, homeStarRadius, rng) {
        const METABALL_FALLOFF = 8.0; //higher values reduces the spread of the metaball
        // probably better not to remove items while iterating, so add to this array instead
        let toRemove = [];
        for( let location of locations ) {
            let metaballFieldIntensity = 0;
            for( let homeLocation of homeLocations ) {
                let distance = this.distanceService.getDistanceBetweenLocations(homeLocation, location);
                distance = homeStarRadius/distance;
                metaballFieldIntensity += Math.pow(distance, METABALL_FALLOFF);
            }
            let chanceToRemove = 1.0-metaballFieldIntensity;
            if(rng.random()<chanceToRemove) {
                toRemove.push(location);
            }
        }
        for( let location of toRemove ) {
            this._removeLocationFromArray(locations, location);
        }

    }

    generateLocations(game, starCount, resourceDistribution, playerCount) {

        const SEED = ( Math.random()*(10**8) ).toFixed(0);
        const SPREAD = 2.5
        const RNG = randomSeeded.create(SEED);
        const SIMPLEX_NOISE = new simplexNoise(SEED);
        const NOISE_BASE_SPREAD = 32.0;
        //const NOISE_SPREAD = NOISE_BASE_SPREAD * Math.sqrt(starCount*1.3);// try to make the noise spread with the size of the galaxy. this makes the void gaps also proportional to galaxy size. 
        //const NOISE_SPREAD = 512; //optionally could keep the voids constant in size, no matter the galaxy size
        const TAU = 2.0*Math.PI;
        const STARS_PER_PLAYER = starCount/playerCount;
        const INITIAL_HYPER_RANGE = game.settings.technology.startingTechnologyLevel.hyperspace;
        const STARTING_STAR_COUNT = game.settings.player.startingStars-1;
        const MINIMUM_STAR_DISTANCE = game.constants.distances.minDistanceBetweenStars * 0.75; // TODO: This is a bit of a bodge to ensure that stars do not spawn too far away from players.

        const NOISE_SPREAD = NOISE_BASE_SPREAD * ( (STARS_PER_PLAYER+20)/9.0 )
       
        //the amount of rings must produce about 30% more stars then requested. this way they can be pruned latter with noise to produce nice gap
        const STAR_COUNT_MULTIPLYER = 1.3;
        const RING_COUNT = this._getRingCount(STARS_PER_PLAYER, (STARS_PER_PLAYER*STAR_COUNT_MULTIPLYER));
        const STAR_DISTANCE = MINIMUM_STAR_DISTANCE*SPREAD;
        const STAR_DISLOCATION_THRESHOLD = MINIMUM_STAR_DISTANCE*((SPREAD-1.0)/2.0);
        const PIVOT_DISTANCE = RING_COUNT*STAR_DISTANCE;

        let locations = [];
        let homeLocations = this._generateHomeLocations(PIVOT_DISTANCE, playerCount, RNG, SIMPLEX_NOISE, NOISE_SPREAD);
        let supplementaryHomeLocations = this._generateSupplementaryHomeLocations(PIVOT_DISTANCE, homeLocations);
        let baseLocations = [];
        let supplementaryLocations = [];

        
        for( let homeLocation of homeLocations ) {
            this._generateConcentricHexRingsLocations( homeLocation, RING_COUNT, STAR_DISTANCE, baseLocations );
        }
        for( let supplementaryHomeLocation of supplementaryHomeLocations ) {
            this._generateConcentricHexRingsLocations( supplementaryHomeLocation, RING_COUNT, STAR_DISTANCE, supplementaryLocations );
        }

        locations = locations.concat(baseLocations, supplementaryLocations);

        this._pruneLocationsOutsideMetaball(locations, homeLocations, PIVOT_DISTANCE, RNG);
        this._randomlyDislocateLocations(locations, STAR_DISLOCATION_THRESHOLD, RNG);
        this._pruneLocationsWithNoise( locations, (starCount-playerCount), SIMPLEX_NOISE, NOISE_SPREAD );

        
        
        //------------------------------------------------------------------------------------------

        //TODO move the selecting star logic to its own function that is mapgen agnostic
        //TODO move the pulling star logic --/--

        for(let homeLocation of homeLocations) {
            homeLocation.isHomeStar = true;
            homeLocation.linkedLocations = [];
        }


        let unlinkedLocations = locations.filter( (loc) => { return true;} );
        let startingStarsCount = STARTING_STAR_COUNT;

        while(startingStarsCount--) {
            for(let homeLocation of homeLocations) {
                let closestUnlinkedLocation = this.distanceService.getClosestLocation(homeLocation, unlinkedLocations);
                homeLocation.linkedLocations.push(closestUnlinkedLocation);
                closestUnlinkedLocation.linked = true;
                unlinkedLocations = unlinkedLocations.filter( (loc) => { return loc !== closestUnlinkedLocation; } );
            }
        }

        // pull the closest stars that will be linked so they are in hyper range
        let minimumClaimDistance = this.distanceService.getHyperspaceDistance(game, INITIAL_HYPER_RANGE)-2;//-2 to avoid floating point imprecisions

        for(let homeLocation of homeLocations) {
            let reachableLocations = [];
            let unreachebleLocations = [];

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
                    if (unreachebleLocation.distanceToClosestReachable < closestUnreachable.distanceToClosestReachable) {
                        closestUnreachable = unreachebleLocation;
                    }
                }

                this._moveLocationTowards(closestUnreachable, closestUnreachable.closestReachable, minimumClaimDistance);
                
                // after moving closer we can change the location from the unreachable to the reachable array
                unreachebleLocations.splice(unreachebleLocations.indexOf(closestUnreachable), 1);
                reachableLocations.push(closestUnreachable);
            }

            //now all linked stars should be reachable
        }

        locations = locations.concat(homeLocations);

        this.setResources(game, locations, resourceDistribution, playerCount, RNG);
        
        return locations;
    }

    setResources(game, locations, resourceDistribution, playerCount, rng) {
        switch (resourceDistribution) {
            case 'random': 
                this._setResourcesRandom(game, locations, playerCount, rng);
                break;
            case 'weightedCenter': 
                this._setResourcesWeightedCenter(game, locations, playerCount, rng);
                break;
            default:
                throw new ValidationError(`Unsupported resource distribution type: ${resourceDistribution}`);
        }
    }

    _setResourcesRandom(game, locations, playerCount, rng) { 
        let RMIN = game.constants.star.resources.minNaturalResources;
        let RMAX = game.constants.star.resources.maxNaturalResources;

        for (let i = 0; i<locations.length; i++ ) {
            let naturalResources = Math.floor(this.randomService.getRandomNumberBetween(RMIN, RMAX));
            locations[i].resources = naturalResources;
        }
    }

    // set random instead, since the galaxy shape is unpredictible, the 'center' has not meaing
    _setResourcesWeightedCenter(game, locations, playerCount, rng) {
        this._setResourcesRandom(game, locations, playerCount, rng);
    }

    //TODO this is generator agnostic and could be on a base class or service
    _getGalaxyDiameter(locations) {
        let xArray = locations.map( (location) => { return location.x; } );
        let yArray = locations.map( (location) => { return location.y; } );

        let maxX = Math.max(...xArray);
        let maxY = Math.max(...yArray);

        let minX = Math.min(...xArray);
        let minY = Math.min(...yArray);

        return {
            x: maxX - minX,
            y: maxY - minY
        };
    }

};

