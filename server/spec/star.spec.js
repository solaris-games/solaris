const star = require('../data/star');
const starNames = require('../data/db/misc/starNames');

describe('star', () => {

    it('should generate a random star name', () => {
        const name = star.getRandomStarName();

        expect(name).toBeTruthy();
        
        const i = starNames.find(x => x == name);

        expect(i).toBeTruthy();
    });

    it('should generate a list of random star names', () => {
        const count = 100;

        const names = star.getRandomStarNames(100);

        expect(names.length).toEqual(count);
    });

    it('should generate a list of random unique star names', () => {
        const count = 100;
        const names = star.getRandomStarNames(100);
        const distinct = [...new Set(names)];

        expect(distinct.length).toEqual(count);
    });

    it('should generate an unowned star', () => {
        const name = 'test star name';
        const maxRadius = 10;

        const newStar = star.generateUnownedStar(name, maxRadius);

        expect(newStar).not.toBe(null);
        expect(newStar._id).not.toBe(null);
        expect(newStar.name).toEqual(name);
        expect(newStar.naturalResources).toBeGreaterThanOrEqual(star.DEFAULTS.MIN_NATURAL_RESOURCES);
        expect(newStar.naturalResources).toBeLessThanOrEqual(star.DEFAULTS.MAX_NATURAL_RESOURCES);
        expect(newStar.terraformedResources).toEqual(0);
        expect(newStar.location).not.toBe(null);
    });

    it('should calculate terraformed resources', () => {
        const result = star.calculateTerraformedResources(10, 5);

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

        star.setupHomeStar(homeStar, newPlayer, gameSettings);

        expect(homeStar.ownedByPlayerId).toBe(newPlayer._id);
        expect(homeStar.garrison).toEqual(gameSettings.player.startingShips);
        expect(homeStar.naturalResources).toEqual(star.DEFAULTS.MAX_NATURAL_RESOURCES);
        expect(homeStar.economy).toEqual(gameSettings.player.startingInfrastructure.economy);
        expect(homeStar.industry).toEqual(gameSettings.player.startingInfrastructure.industry);
        expect(homeStar.science).toEqual(gameSettings.player.startingInfrastructure.science);
        expect(homeStar.homeStar).toBeTruthy();
    });

});
