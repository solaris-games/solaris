import {Player} from "../services/types/Player";

import mongoose from 'mongoose';

import { DistanceService } from 'solaris-common';
import { StarDistanceService } from 'solaris-common';
import MapService from '../services/map';
import RandomService from '../services/random';
import StarService from '../services/star';
import CarrierService from '../services/carrier';
import PlayerService from '../services/player';
import NameService from '../services/name';
import { TechnologyService } from 'solaris-common';
import PlayerColourService from "../services/playerColour";

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
            },
            developmentCost: {
                economy: 'standard',
                industry: 'standard',
                science: 'standard'
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
        stars: [],
        players: []
    }
}

function generateStarGrid() {
    let stars: any[] = [];
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
                infrastructure: {},
                naturalResources: {}
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

describe('player', () => {

    let randomService;
    let distanceService;
    let starDistanceService;
    let carrierService;
    let starService;
    let nameService;
    let mapService;
    let technologyService;
    let playerService;
    let playerColourService;

    beforeEach(() => {
        // Use real services because I cannot fathom how to fake all this shit.
        randomService = new RandomService();
        distanceService = new DistanceService();
        starDistanceService = new StarDistanceService(distanceService);
        // @ts-ignore
        carrierService = new CarrierService();
        // @ts-ignore
        starService = new StarService({}, randomService);
        // @ts-ignore
        nameService = new NameService(gameNames, starNames, randomService);
        // @ts-ignore
        mapService = new MapService(randomService, starService, distanceService, starDistanceService, nameService);
        // @ts-ignore
        technologyService = new TechnologyService();
        // @ts-ignore
        playerColourService = new PlayerColourService(randomService);
        // @ts-ignore
        playerService = new PlayerService(null, randomService, mapService, starService, carrierService, starDistanceService, technologyService, null, null, null, null, playerColourService);

    });

    it('should create an empty player', () => {
        const yellow = { alias: 'Yellow', value: '0xFFC000' };

        const newPlayer = playerService.createEmptyPlayer(game, yellow);

        assertNewPlayer(newPlayer, yellow);
    });

    it('should create a list of empty players', () => {
        const allStars: any[] = generateStarGrid();
        // @ts-ignore
        game.galaxy.stars = allStars;
        playerService.setupEmptyPlayers(game);
        const players: Player[] = game.galaxy.players;

        expect(players.length).toEqual(game.settings.general.playerLimit);

        for(let i = 0; i < players.length; i++) {
            let newPlayer = players[i];

            assertNewPlayer(newPlayer, null);

            // Assert owned stars.
            const starsOwned = allStars.filter(x => x.ownedByPlayerId === newPlayer._id);

            expect(starsOwned.length).toEqual(game.settings.player.startingStars);

            // Assert non-home star ships.
            starsOwned.filter(x => !x.homeStar).forEach(s => {
                expect(s.ships).toEqual(game.settings.player.startingShips);
            });

            // Assert home star.
            const homeStar: any = allStars.find(x => x._id === newPlayer.homeStarId);
            
            expect(homeStar.ships).toEqual(game.settings.player.startingShips);
        }
    });

});
