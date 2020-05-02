const GameCreateService = require('../services/gameCreate');

const fakeGameModel = class FakeGameModel {
    constructor(settings) {
        this._doc = settings;

        this._doc.state = {
            stars: 0
        };

        this._doc.galaxy = {

        };
    }

    save() {
        return this;
    }
};

const fakeMapService = {
    generateStars(starCount) {
        let stars = [];

        for (let i = 0; i < starCount; i++) {
            stars.push({
                _id: i,
                name: `Star ${i}`
            });
        }

        return stars;
    },
    generateGates(stars, gateSetting, playerLimit) {
        // Set the first star to be a warp gate.
        stars[0].warpGate = true;
    }
};

const fakePlayerService = {
    createEmptyPlayers(settings, stars) {
        let players = [];

        for (let i = 0; i < settings.general.playerLimit; i++) {
            players.push({
                _id: i,
                name: `Player ${i}`
            });
        }

        return players;
    },
    createEmptyPlayerCarriers(stars, players) {
        let carriers = [];

        for (let i = 0; i < players.length; i++) {
            carriers.push({
                _id: i,
                name: `Carrier ${i}`
            });
        }

        return carriers;
    }
};

describe('gameCreate', () => {

    let service;

    let settings = null;

    beforeAll(() => {
        service = new GameCreateService(fakeGameModel, fakeMapService, fakePlayerService);
    });

    beforeEach(() => {
        settings = {
            galaxy: {
                starsPerPlayer: 5,
                stars: []
            },
            general: {
                playerLimit: 2,
                starVictoryPercentage: 50
            },
            specialGalaxy: {
                randomGates: 'none'
            }
        };
    });

    it('should create a game with X number of stars', async (done) => {
        // Arrange
        let starsPerPlayer = 10;
        let playerLimit = 8;

        settings.galaxy.starsPerPlayer = starsPerPlayer;
        settings.general.playerLimit = playerLimit;

        // Act
        let game = await service.create(settings);

        // Assert
        let expectedStarCount = starsPerPlayer * playerLimit;

        expect(game._doc.state.stars).toBe(expectedStarCount);

        done();
    });

    it('should create a game with X number of stars for victory', async (done) => {
        // Arrange
        let starsPerPlayer = 10;
        let playerLimit = 8;
        let starVictoryPercentage = 60;

        settings.galaxy.starsPerPlayer = starsPerPlayer;
        settings.general.playerLimit = playerLimit;
        settings.general.starVictoryPercentage = starVictoryPercentage;

        // Act
        let game = await service.create(settings);

        // Assert
        let expectedStarsForVictory = (game._doc.state.stars / 100) * starVictoryPercentage;

        expect(game._doc.state.starsForVictory).toBe(expectedStarsForVictory);

        done();
    });

    // it('should create a game with warp gates if enabled', async (done) => {
    //     // Arrange
    //     settings.specialGalaxy.randomGates = 'random';

    //     // Act
    //     let game = await service.create(settings);

    //     // Assert
    //     expect(game._doc.galaxy.stars[0].warpGate).toBeTruthy();

    //     done();
    // });

    it('should not create a game with warp gates if disabled', async (done) => {
        // Arrange
        settings.specialGalaxy.randomGates = 'none';

        // Act
        let game = await service.create(settings);

        // Assert
        expect(game._doc.galaxy.stars[0].warpGate).toBeFalsy();

        done();
    });

    it('should create X number of players', async (done) => {
        // Arrange
        let playerCount = 5;

        settings.general.playerLimit = playerCount;

        // Act
        let game = await service.create(settings);

        // Assert
        expect(game._doc.galaxy.players.length).toBe(playerCount);

        done();
    });

});
