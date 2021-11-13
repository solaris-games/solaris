const mongoose = require('mongoose');

const DistanceService = require('../services/distance');
const StarDistanceService = require('../services/starDistance');
const MapService = require('../services/map');
const RandomService = require('../services/random');
const StarService = require('../services/star');
const CarrierService = require('../services/carrier');
const PlayerService = require('../services/player');
const NameService = require('../services/name');
const TechnologyService = require('../services/technology');

const gameNames = require('../config/game/gameNames');
const starNames = require('../config/game/starNames');

const game = {
    settings: {
        general: {
            playerLimit: 4
        },
        player: {
            startingCredits: 500,
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
                weapons: 1,
                specialists: 1
            },
            researchCosts: {
                terraforming: 'standard',
                experimentation: 'standard',
                scanning: 'standard',
                hyperspace: 'standard',
                manufacturing: 'standard',
                banking: 'standard',
                weapons: 'standard',
                specialists: 'standard'
            }
        },
        galaxy: {
            galaxyType: 'circular'
        },
        specialGalaxy: {
            playerDistribution: 'circular',
            carrierSpeed: 5
        }
    },
    constants: {
        distances: {
            lightYear: 30,
            minDistanceBetweenStars: 30,
            maxDistanceBetweenStars: 300
        },
        star: {
            resources: {
                minNaturalResources: 10,
                maxNaturalResources: 50
            }
        }
    },
    galaxy: {
        stars: []
    }
}

function generateStarGrid() {
    let stars = [];
    let i = 0;

    // Generate a grid of stars.
    for(let x = 0; x < 100; x += 10) {
        for(let y = 0; y < 100; y += 10) {
            i++;

            stars.push({
                _id: new mongoose.Types.ObjectId(),
                name: `Star ${i}`,
                location: {
                    x, y
                },
                infrastructure: {}
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
    expect(newPlayer.credits).toEqual(game.settings.player.startingCredits);
    expect(newPlayer.colour).toBe(colour);

    for(var key in newPlayer.research) {
        const res1 = newPlayer.research[key].level;
        const res2 = game.settings.technology.startingTechnologyLevel[key];
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
        starService = new StarService({}, randomService);
        nameService = new NameService(gameNames, starNames, randomService);
        mapService = new MapService(randomService, starService, distanceService, starDistanceService, nameService);
        technologyService = new TechnologyService();
        playerService = new PlayerService(null, randomService, mapService, starService, carrierService, starDistanceService, technologyService);
    });

    it('should create an empty player', () => {
        const yellow = { alias: 'Yellow', value: '0xFFC000' };

        const newPlayer = playerService.createEmptyPlayer(game, yellow);

        assertNewPlayer(newPlayer, yellow);
    });

    it('should create a list of empty players', () => {
        const allStars = generateStarGrid();
        game.galaxy.stars = allStars;
        const players = playerService.createEmptyPlayers(game);

        expect(players.length).toEqual(game.settings.general.playerLimit);

        for(let i = 0; i < players.length; i++) {
            let newPlayer = players[i];

            assertNewPlayer(newPlayer);

            // Assert owned stars.
            const starsOwned = allStars.filter(x => x.ownedByPlayerId === newPlayer._id);

            expect(starsOwned.length).toEqual(game.settings.player.startingStars);

            // Assert non-home star ships.
            starsOwned.filter(x => !x.homeStar).forEach(s => {
                expect(s.ships).toEqual(game.settings.player.startingShips);
            });

            // Assert home star.
            const homeStar = allStars.find(x => x._id === newPlayer.homeStarId);
            
            expect(homeStar.ships).toEqual(game.settings.player.startingShips);
        }

        //printStars(allStars);
    });

});
