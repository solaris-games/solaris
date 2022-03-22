import GameListService from '../services/gameList';

const fakeGameModel = {
    find() {
        return 1;
    }
};

describe('game list', () => {
    let gameListService;

    beforeAll(() => {
        // @ts-ignore
        gameListService = new GameListService(fakeGameModel);
    });
    
    // Not really sure what's the point in testing this. Maybe there's a better way to mock
    // and intercept calling of mongoose functions?
    it('should list official games', async () => {
        let result = await gameListService.listOfficialGames();

        expect(result).toBe(1);
    });

});
