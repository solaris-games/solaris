const carrier = require('../data/carrier');

describe('carrier', () => {
    
    it('should create a carrier at a star', () => {
        const star = {
            _id: '123',
            location: {
                x: 10,
                y: 15
            },
            name: 'Super star',
            garrison: 10
        };

        const ships = 1;
        const newCarrier = carrier.createAtStar(star, ships);

        expect(newCarrier).not.toBe(null);
        expect(newCarrier.ships).toEqual(ships);
        expect(newCarrier.orbiting).toBe(star._id);
        expect(newCarrier.location).toEqual(star.location);
        expect(newCarrier.name).toContain(star.name);
    });

    it('should deduct the ships from the garrisoning star', () => {
        const star = {
            _id: '123',
            location: {
                x: 10,
                y: 15
            },
            name: 'Super star',
            garrison: 10
        };

        const ships = 5;
        const newCarrier = carrier.createAtStar(star, ships);

        expect(newCarrier.ships).toEqual(ships);
        expect(star.garrison).toEqual(5);
    });

});
