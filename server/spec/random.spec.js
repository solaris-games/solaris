const RandomService = require('../services/random');

describe('random', () => {

    let randomService;

    beforeEach(() => {
        randomService = new RandomService();
    });

    it('should generate a random number', () => {
        const max = 10;
        const res = randomService.getRandomNumber(max);
        
        expect(res).toBeGreaterThanOrEqual(0);
        expect(res).toBeLessThan(max);
    });

    it('should generate a random number between x and y', () => {
        const min = 0;
        const max = 10;

        const res = randomService.getRandomNumberBetween(min, max);
        
        expect(res).toBeGreaterThanOrEqual(min);
        expect(res).toBeLessThanOrEqual(max);
    });

    it('should generate a random angle', () => {
        const res = randomService.getRandomAngle();
        
        expect(res).toBeGreaterThanOrEqual(0);
        expect(res).toBeLessThanOrEqual(1 + Math.PI * 2);
    });

    it('should generate a random position in a circle', () => {
        const radius = 10;

        const res = randomService.getRandomPositionInCircle(radius);

        expect(res).not.toBe(null);

        expect(res.x).toBeGreaterThanOrEqual(radius * -1);
        expect(res.x).toBeLessThanOrEqual(radius);

        expect(res.y).toBeGreaterThanOrEqual(radius * -1);
        expect(res.y).toBeLessThanOrEqual(radius);
    });


    describe('getResourceScore', () => {

        const minResourceValue = 10;
        const maxResourceValue = 50;

        it('should generate a minimum resource score', () => {

            radius = 5;
            let x = 3
            let y = 4;

            let res = randomService.getResourceScore(radius, x, y);
            expect(res).toBe(minResourceValue);

            radius = Math.sqrt(5);
            x = 1;
            y = 2;

            res = randomService.getResourceScore(radius, x, y);
            expect(res).toBe(minResourceValue);
        });

        it('should generate a maximum resource score', () => {

            let radius = 5;
            let x = 0
            let y = 0;

            let res = randomService.getResourceScore(radius, x, y);
            expect(res).toBe(maxResourceValue);

            radius = 10;
            res = randomService.getResourceScore(radius, x, y);
            expect(res).toBe(maxResourceValue);
        });

        it('should generate a resource score based on the distance from the centre', () => {

            const radius = 5;
            let x = 0
            let y = 0;

            let limit = Math.sqrt(Math.pow(radius)/2);

            let lastRes = maxResourceValue;

            for(let i = 0; i < limit; i+=0.5) {

                x = i;
                y = i;
             
                let res = randomService.getResourceScore(radius, x, y);

                expect(res).toBeGreaterThanOrEqual(minResourceValue);
                expect(res).toBeLessThanOrEqual(maxResourceValue);

                expect(res).toBeLessThan(lastRes);

                lastRes = res;
            }
        })
    });

});
