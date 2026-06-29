import GameListService from "../services/gameList";

const fakeGames = [
    { settings: { general: { type: "official" } } },
    { settings: { general: { type: "official" } } },
];

const fakeGameModel = {
    async find() {
        return fakeGames;
    },
};

const fakeGameService = {
    maskState() {},
};

describe("game list", () => {
    let gameListService;

    beforeAll(() => {
        gameListService = new GameListService(
            // @ts-ignore
            fakeGameModel,
            fakeGameService,
            {},
            {},
            {},
            {},
        );
    });

    it("should list official games", async () => {
        let result = await gameListService.listOfficialGames();

        expect(result).toEqual(fakeGames);
    });
});
