const random = require('../data/random');

describe('random', () => {

    it('should generate a random number', () => {
        const max = 10;
        const res = random.getRandomNumber(max);
        
        expect(res).toBeGreaterThanOrEqual(0);
        expect(res).toBeLessThan(max);
    });

    it('should generate a random number between x and y', () => {
        const min = 0;
        const max = 10;

        const res = random.getRandomNumberBetween(min, max);
        
        expect(res).toBeGreaterThanOrEqual(min);
        expect(res).toBeLessThan(max);
    });

    it('should generate a random angle', () => {
        const res = random.getRandomAngle();
        
        expect(res).toBeGreaterThanOrEqual(0);
        expect(res).toBeLessThanOrEqual(1 + Math.PI * 2);
    });

    it('should generate a random position in a circle', () => {
        const radius = 10;

        const res = random.getRandomPositionInCircle(radius);

        expect(res).not.toBe(null);

        expect(res.x).toBeGreaterThanOrEqual(radius * -1);
        expect(res.x).toBeLessThanOrEqual(radius);

        expect(res.y).toBeGreaterThanOrEqual(radius * -1);
        expect(res.y).toBeLessThanOrEqual(radius);
    });

});
