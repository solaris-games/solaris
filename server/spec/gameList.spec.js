const GameListService = require('../services/gameList');

const fakeGameModel = {
    // Bit of a pain in the ass to fake this model because mongoose is a dick.
    find() {
        return {
            select() {
                return {
                    exec() {
                        return 1;
                    }
                }
            }
        }
    }
};

describe('gameList', () => {
    let gameListService;

    beforeAll(() => {
        gameListService = new GameListService(fakeGameModel);
    });
    
    // Not really sure what's the point in testing this. Maybe there's a better way to mock
    // and intercept calling of mongoose functions?
    it('should list official games', async () => {
        let result = await gameListService.listOfficialGames();

        expect(result).toBe(1);
    });

});
