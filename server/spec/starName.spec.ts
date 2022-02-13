import RandomService from '../services/random';
import NameService from '../services/name';

const gameNames = [
    'Game 1',
    'Game 2',
    'Game 3',
    'Game 4',
    'Game 5'
];

const starNames = [
    '1',
    '2',
    '3',
    '4',
    '5'
];

describe('star name', () => {

    let randomService;
    let starService;

    beforeEach(() => {
        // Use a real random service because it would not be easy to fake for these tests.
        randomService = new RandomService();
        starService = new NameService(gameNames, starNames, randomService);
    });

    it('should generate a random star name', () => {
        const name = starService.getRandomStarName();

        expect(name).toBeTruthy();
        
        const i = starNames.find(x => x == name);

        expect(i).toBeTruthy();
    });

    it('should generate a list of random star names', () => {
        const count = 3;
        const names = starService.getRandomStarNames(count);

        expect(names.length).toEqual(count);
    });

    it('should generate a list of random unique star names', () => {
        const count = 3;
        const names = starService.getRandomStarNames(count);
        const distinct = [...new Set(names)];

        expect(distinct.length).toEqual(count);
    });

});
