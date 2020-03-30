const ResearchService = require('../services/research');

let gameObject = null;

describe('research', () => {
    let service;

    beforeAll(() => {
        service = new ResearchService();
    });

    beforeEach(() => {
        // Reset the game object.
        gameObject = {
            _id: 1,
            galaxy: {
                players: [
                    {
                        userId: 1,
                        researchingNow: 0,
                        researchingNext: 1
                    },
                    {
                        userId: 2,
                        researchingNow: 10,
                        researchingNext: 11
                    }
                ]
            },
            save() {
                return true;
            }
        };
    });
    
    it('should save the document after updating the preference', async (done) => {
        let userId = 1, preference = 5;

        let result = await service.updateResearchNow(gameObject, userId, preference);

        expect(result).toBeTruthy(); // Expect save to be called.

        done();
    });

    it('should update researching now of given player', async (done) => {
        let userId = 1, preference = 5;

        await service.updateResearchNow(gameObject, userId, preference);

        expect(gameObject.galaxy.players[0].researchingNow).toBe(preference);

        done();
    });
    
    it('should update researching now of a different given player', async (done) => {
        let userId = 2, preference = 100;

        await service.updateResearchNow(gameObject, userId, preference);

        expect(gameObject.galaxy.players[1].researchingNow).toBe(preference);

        done();
    });

    it('should update researching next of given player', async (done) => {
        let userId = 1, preference = 5;

        await service.updateResearchNext(gameObject, userId, preference);

        expect(gameObject.galaxy.players[0].researchingNext).toBe(preference);

        done();
    });
    
    it('should update researching next of a different given player', async (done) => {
        let userId = 2, preference = 100;

        await service.updateResearchNext(gameObject, userId, preference);

        expect(gameObject.galaxy.players[1].researchingNext).toBe(preference);

        done();
    });

});
