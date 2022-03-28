import StarService from '../services/star';
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
    },
    generateStarNaturalResources() {
        return 10;
    }
};

const fakeStarNameService = {
    index: 0,
    getRandomStarName() {
        return `Test ${this.index++}`;
    }
};

const fakeDistanceService = {

}

const fakeStarDistanceService = {

}

const game = {
    constants: {
        star: {
            resources: {
                minNaturalResources: 10,
                maxNaturalResources: 50
            }
        }
    }
};

describe('star', () => {

    let starService;

    beforeEach(() => {
        // @ts-ignore
        starService = new StarService({}, fakeRandomService, fakeStarNameService, fakeDistanceService, fakeStarDistanceService);
    });

    it('should generate an unowned star', () => {
        const name = 'test star name';

        const newStar = starService.generateUnownedStar(name, { x: 0, y: 0 }, {
            economy: 10,
            industry: 10,
            science: 10
        });

        expect(newStar).not.toBe(null);
        expect(newStar._id).not.toBe(null);
        expect(newStar.name).toEqual(name);
        expect(newStar.naturalResources.economy).toBeGreaterThanOrEqual(game.constants.star.resources.minNaturalResources);
        expect(newStar.naturalResources.economy).toBeLessThanOrEqual(game.constants.star.resources.maxNaturalResources);
        expect(newStar.naturalResources.industry).toBeGreaterThanOrEqual(game.constants.star.resources.minNaturalResources);
        expect(newStar.naturalResources.industry).toBeLessThanOrEqual(game.constants.star.resources.maxNaturalResources);
        expect(newStar.naturalResources.science).toBeGreaterThanOrEqual(game.constants.star.resources.minNaturalResources);
        expect(newStar.naturalResources.science).toBeLessThanOrEqual(game.constants.star.resources.maxNaturalResources);
        expect(newStar.location).not.toBe(null);
    });

    it('should calculate terraformed resources', () => {
        const star1 = {
            naturalResources: {
                economy: 34,
                industry: 34,
                science: 34
            }
        };
        const star2 = {
            naturalResources: {
                economy: 23,
                industry: 53,
                science: 10
            }
        }

        const result1 = starService.calculateTerraformedResources(star1, 5); // Normal resources
        const result2 = starService.calculateTerraformedResources(star2, 2); // Split resources

        expect(result1.economy).toBe(59);
        expect(result1.industry).toBe(59);
        expect(result1.science).toBe(59);

        expect(result2.economy).toBe(33);
        expect(result2.industry).toBe(63);
        expect(result2.science).toBe(20);
    });

    it('should setup a player\'s home star', () => {
        const newPlayer = {
            _id: 1
        }

        const homeStar = {
            _id: 2,
            infrastructure: {
                economy: 0,
                industry: 0,
                science: 0
            },
            naturalResources: {},
            ownedByPlayerId: 0,
            ships: 0
        };

        const gameSettings = {
            player: {
                startingShips: 10,
                startingInfrastructure: {
                    economy: 10,
                    industry: 10,
                    science: 1
                }
            },
            galaxy: {
                galaxyType: 'irregular'
            }
        };

        starService.setupHomeStar(game, homeStar, newPlayer, gameSettings);

        expect(homeStar.ownedByPlayerId).toBe(newPlayer._id);
        expect(homeStar.ships).toEqual(gameSettings.player.startingShips);
        expect(homeStar.infrastructure.economy).toEqual(gameSettings.player.startingInfrastructure.economy);
        expect(homeStar.infrastructure.industry).toEqual(gameSettings.player.startingInfrastructure.industry);
        expect(homeStar.infrastructure.science).toEqual(gameSettings.player.startingInfrastructure.science);
    });
    
});
