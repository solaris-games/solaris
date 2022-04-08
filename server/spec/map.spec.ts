import RandomService from '../services/random';
import MapService from '../services/map';
import CircularMapService from '../services/maps/circular';

const game = {
    settings: {
        galaxy: {
            galaxyType: 'circular'
        },
        specialGalaxy: {
            resourceDistribution: 'random'
        }
    },
    constants: {
        distances: {
            maxDistanceBetweenStars: 300
        },
        star: {
            resources: {
                minNaturalResources: 10,
                maxNaturalResources: 50
            }
        }
    }
}

const fakeStarService = {
    generateUnownedStar(name: string, location) {
        return {
            name,
            location
        }
    },
    generateStarPosition(game, x: number, y: number) {
        return {
            x: 10,
            y: 10
        }
    }
};

const fakeStarDistanceService = {
    isStarTooClose(game, star1, star2) {
        return false;
    },
    isDuplicateStarPosition(location, stars) {
        return false;
    },
    isStarLocationTooClose(game, location, stars) {
        return false;
    },
    isLocationTooClose(game, location, locations) {
        return false;
    }
};

const fakeDistanceService = {
    getFurthestLocation() {
        return 1;
    },
    getDistanceBetweenLocations() {
        return 2;
    }
};

const fakeStarNameService = {
    getRandomStarNames(count: number) {
        let names: string[] = [];

        for (let i = 0; i < count; i++) {
            names.push(`Star ${i}`);
        }
        
        return names;
    }
};

const fakeResourceService = {
    distribute() { }
};

const fakeGameTypeService = {
    isKingOfTheHillMode() { return false; }
};

describe('map', () => {

    const starCount = 10;
    const playerCount = 2;
    let randomService;
    let mapService;
    let starMapService;

    beforeEach(() => {
        // Use a real random service because it would not be easy to fake for these tests.
        randomService = new RandomService();
        // @ts-ignore
        starMapService = new CircularMapService(randomService, fakeStarService, fakeStarDistanceService, fakeDistanceService, fakeResourceService, fakeGameTypeService);
        // @ts-ignore
        mapService = new MapService(randomService, fakeStarService, fakeStarDistanceService, fakeStarNameService, starMapService);
    });

    it('should generate a given number of stars', () => {
        const stars = mapService.generateStars(game, starCount, playerCount).stars;
        
        expect(stars).toBeTruthy();
        expect(stars.length).toEqual(starCount);
    });

    it('should generate stars with no duplicate names.', () => {
        const stars = mapService.generateStars(game, starCount, playerCount);
        
        for(let i = 0; i < stars.length; i++) {
            let star = stars[i];

            let duplicates = stars.filter((s) => s.name === star.name);

            // Should equal 1 because we are checking against the same star.
            expect(duplicates.length).toEqual(1);
        }
    });

    // it('close star check should return false if no stars are close', () => {
    //     let star = {}; // Doesn't need to contain anything because of the fake.
    //     let otherStars = [{}];

    //     fakeStarDistanceService.isStarTooClose = () => false;

    //     let result = starService.isStarTooCloseToOthers(star, otherStars);

    //     expect(result).toBeFalsy();
    // });

    // it('close star check should return true if stars are close', () => {
    //     let star = {}; // Doesn't need to contain anything because of the fake.
    //     let otherStars = [{}];

    //     fakeStarDistanceService.isStarTooClose = () => true;

    //     let result = starMapService.isStarTooCloseToOthers(star, otherStars);

    //     expect(result).toBeTruthy();
    // });

});
