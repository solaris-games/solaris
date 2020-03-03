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
    }
};

const fakeStarService = {

};

describe('gameCreate', () => {

    let service;

    let settings = null;

    beforeAll(() => {
        service = new GameCreateService(fakeGameModel, fakeMapService, fakePlayerService, fakeStarService);
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

    it('should create a game with X number of stars', async () => {
        // Arrange
        let starsPerPlayer = 10;
        let playerLimit = 8;

        settings.galaxy.starsPerPlayer = starsPerPlayer;
        settings.general.playerLimit = playerLimit;

        // Act
        let game = await service.create(settings);

        // Assert
        let expectedStarCount = starsPerPlayer * playerLimit * 2.5;

        expect(game._doc.state.stars).toBe(expectedStarCount);
    });

    it('should create a game with X number of stars for victory', async () => {
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
    });

    it('should create a game with warp gates if enabled', async () => {
        // Arrange
        settings.specialGalaxy.randomGates = 'random';

        // Act
        let game = await service.create(settings);

        // Assert
        expect(game._doc.galaxy.stars[0].warpGate).toBeTruthy();
    });

    it('should not create a game with warp gates if disabled', async () => {
        // Arrange
        settings.specialGalaxy.randomGates = 'none';

        // Act
        let game = await service.create(settings);

        // Assert
        expect(game._doc.galaxy.stars[0].warpGate).toBeFalsy();
    });

    it('should create X number of players', async () => {
        // Arrange
        let playerCount = 5;

        settings.general.playerLimit = playerCount;

        // Act
        let game = await service.create(settings);

        // Assert
        expect(game._doc.galaxy.players.length).toBe(playerCount);
    });

});
