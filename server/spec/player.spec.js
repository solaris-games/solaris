const DistanceService = require('../services/distance');
const StarDistanceService = require('../services/starDistance');
const MapService = require('../services/map');
const RandomService = require('../services/random');
const StarService = require('../services/star');
const CarrierService = require('../services/carrier');
const PlayerService = require('../services/player');

const gameSettings = {
    general: {
        playerLimit: 4
    },
    player: {
        startingCash: 500,
        startingShips: 10,
        startingStars: 3,
        startingInfrastructure: {
            economy: 5,
            industry: 5,
            science: 1
        }
    },
    technology: {
        startingTechnologyLevel: {
            terraforming: 1,
            experimentation: 1,
            scanning: 1,
            hyperspace: 1,
            manufacturing: 1,
            banking: 1,
            weapons: 1
        }
    },
    galaxy: {
        startingDistance: 'close'
    }
};

function generateStarGrid() {
    let stars = [];
    let i = 0;

    // Generate a grid of stars.
    for(let x = 0; x < 100; x += 10) {
        for(let y = 0; y < 100; y += 10) {
            i++;

            stars.push({
                _id: i,
                name: `Star ${i}`,
                location: {
                    x, y
                }
            });
        }
    }

    return stars;
}

function assertNewPlayer(newPlayer, colour) {
    colour = colour || newPlayer.colour;

    expect(newPlayer).not.toBe(null);
    expect(newPlayer._id).not.toBe(null);
    expect(newPlayer.userId).toBe(null);
    expect(newPlayer.alias).not.toBe(null);
    expect(newPlayer.cash).toEqual(gameSettings.player.startingCash);
    expect(newPlayer.colour).toBe(colour);

    for(var key in newPlayer.research) {
        const res1 = newPlayer.research[key].level;
        const res2 = gameSettings.technology.startingTechnologyLevel[key];
        expect(res1).toEqual(res2);
    }
}

function printStars(allStars) {
    console.log();
        
    for(let y = 0; y < 100; y += 10) {
        let starsOnY = allStars.filter(x => x.location.y == y);

        console.log(starsOnY.map(p => {
            if (p.ownedByPlayerId) {
                let key = p.ownedByPlayerId.toString();
                return key[key.length - 1] + ' ';
            }

            return '. ';
        }).join(''));
    }
}

describe('player', () => {

    let playerService;

    beforeEach(() => {
        // Use real services because I cannot fathom how to fake all this shit.
        randomService = new RandomService();
        distanceService = new DistanceService();
        starDistanceService = new StarDistanceService(distanceService);
        carrierService = new CarrierService();
        starService = new StarService(randomService);
        mapService = new MapService(randomService, starService, starDistanceService, distanceService);
        playerService = new PlayerService(randomService, mapService, starService, carrierService, starDistanceService);
    });

    it('should create an empty player', () => {
        const yellow = { alias: 'Yellow', value: '0xFFC000' };

        const newPlayer = playerService.createEmptyPlayer(gameSettings, yellow);

        assertNewPlayer(newPlayer, yellow);
    });

    it('should create a list of empty players', () => {
        const allStars = generateStarGrid();
        const players = playerService.createEmptyPlayers(gameSettings, allStars);

        expect(players.length).toEqual(gameSettings.general.playerLimit);

        for(let i = 0; i < players.length; i++) {
            let newPlayer = players[i];

            assertNewPlayer(newPlayer);

            // Assert player carriers.
            expect(newPlayer.carriers.length).toEqual(1);

            // Assert owned stars.
            const starsOwned = allStars.filter(x => x.ownedByPlayerId === newPlayer._id);

            expect(starsOwned.length).toEqual(gameSettings.player.startingStars);

            // Assert non-home star garrisons.
            starsOwned.filter(x => !x.homeStar).forEach(s => {
                expect(s.garrison).toEqual(gameSettings.player.startingShips);
            });

            // Assert home star.
            const homeStar = allStars.find(x => x._id === newPlayer.homeStarId);
            
            expect(homeStar.garrison).toEqual(gameSettings.player.startingShips - 1); // -1 because of carrier at this star.
        }

        //printStars(allStars);
    });

});
