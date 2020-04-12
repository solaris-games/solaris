const StarService = require('../services/star');
const starNames = require('../config/game/starNames');

const fakeRandomService = {
    getRandomNumber(max) {
        return max;
    },
    getRandomNumberBetween(min, max) {
        return max;
    },
    getRandomPositionInCircle(radius) {
        return radius;
    },
    getRandomPositionInCircleFromOrigin(originX, originY, radius) {
        return radius;
    }
};

const fakeStarNameService = {
    index: 0,
    getRandomStarName() {
        return `Test ${this.index++}`;
    }
};

const fakeDistanceService = {
    DISTANCES: {
        MAX_DISTANCE_BETWEEN_STARS: 100
    }
}

describe('star', () => {

    let starService;

    beforeEach(() => {
        starService = new StarService(fakeRandomService, fakeStarNameService, fakeDistanceService);
    });

    it('should generate an unowned star', () => {
        const name = 'test star name';

        const newStar = starService.generateUnownedStar(name);

        expect(newStar).not.toBe(null);
        expect(newStar._id).not.toBe(null);
        expect(newStar.name).toEqual(name);
        expect(newStar.naturalResources).toBeGreaterThanOrEqual(starService.DEFAULTS.MIN_NATURAL_RESOURCES);
        expect(newStar.naturalResources).toBeLessThanOrEqual(starService.DEFAULTS.MAX_NATURAL_RESOURCES);
        expect(newStar.location).not.toBe(null);
    });

    it('should calculate terraformed resources', () => {
        const result = starService.calculateTerraformedResources(10, 5);

        expect(result).toEqual(35);
    });

    it('should setup a player\'s home star', () => {
        const newPlayer = {
            _id: 1
        }

        const homeStar = {
            _id: 2
        };

        const gameSettings = {
            player: {
                startingShips: 10,
                startingInfrastructure: {
                    economy: 10,
                    industry: 10,
                    science: 1
                }
            }
        };

        starService.setupHomeStar(homeStar, newPlayer, gameSettings);

        expect(homeStar.ownedByPlayerId).toBe(newPlayer._id);
        expect(homeStar.garrison).toEqual(gameSettings.player.startingShips);
        expect(homeStar.naturalResources).toEqual(starService.DEFAULTS.MAX_NATURAL_RESOURCES);
        expect(homeStar.infrastructure.economy).toEqual(gameSettings.player.startingInfrastructure.economy);
        expect(homeStar.infrastructure.industry).toEqual(gameSettings.player.startingInfrastructure.industry);
        expect(homeStar.infrastructure.science).toEqual(gameSettings.player.startingInfrastructure.science);
        expect(homeStar.homeStar).toBeTruthy();
    });

});
