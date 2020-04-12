const RandomService = require('../services/random');
const MapService = require('../services/map');

const fakeStarService = {
    generateUnownedStar(name) {
        return {
            name,
            location: {
                x: 10,
                y: 10
            }
        }
    }
};

const fakeStarDistanceService = {
    isStarTooClose(star1, star2) {
        return false;
    },
    isDuplicateStarPosition(star, stars) {
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
    getRandomStarNames(count) {
        let names = [];

        for (let i = 0; i < count; i++) {
            names.push(`Star ${i}`);
        }
        
        return names;
    }
};

describe('map', () => {

    const starCount = 10;
    const playerCount = 2;
    let mapService;

    beforeEach(() => {
        // Use a real random service because it would not be easy to fake for these tests.
        randomService = new RandomService();
        mapService = new MapService(randomService, fakeStarService, fakeDistanceService, fakeStarDistanceService, fakeStarNameService);
    });

    it('should generate a given number of stars', () => {
        const stars = mapService.generateStars(starCount, playerCount);
        
        expect(stars).toBeTruthy();
        expect(stars.length).toEqual(starCount);
    });

    it('should generate stars with no duplicate names.', () => {
        const stars = mapService.generateStars(starCount, playerCount);
        
        for(let i = 0; i < stars.length; i++) {
            let star = stars[i];

            let duplicates = stars.filter(s => s.name === star.name);

            // Should equal 1 because we are checking against the same star.
            expect(duplicates.length).toEqual(1);
        }
    });

    it('close star check should return false if no stars are close', () => {
        let star = {}; // Doesn't need to contain anything because of the fake.
        let otherStars = [{}];

        fakeStarDistanceService.isStarTooClose = () => false;

        let result = mapService.isStarTooCloseToOthers(star, otherStars);

        expect(result).toBeFalsy();
    });

    it('close star check should return true if stars are close', () => {
        let star = {}; // Doesn't need to contain anything because of the fake.
        let otherStars = [{}];

        fakeStarDistanceService.isStarTooClose = () => true;

        let result = mapService.isStarTooCloseToOthers(star, otherStars);

        expect(result).toBeTruthy();
    });

});
