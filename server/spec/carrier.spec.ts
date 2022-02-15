import CarrierService from '../services/carrier';

describe('carrier', () => {
    let carrierService;

    beforeAll(() => {
        // @ts-ignore
        carrierService = new CarrierService();
    });
    
    it('should create a carrier at a star', () => {
        const star = {
            _id: '123',
            location: {
                x: 10,
                y: 15
            },
            name: 'Super star',
            ships: 10,
            shipsActual: 10
        };

        const ships = 1;
        const newCarrier = carrierService.createAtStar(star, [], ships);

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
            ships: 10,
            shipsActual: 10
        };

        const ships = 5;
        const newCarrier = carrierService.createAtStar(star, [], ships);

        expect(newCarrier.ships).toEqual(ships);
        expect(star.ships).toEqual(5);
    });

});
