const mongoose = require('mongoose');
const moment = require('moment');
const EventEmitter = require('events');
import DatabaseRepository from '../models/DatabaseRepository';
import { DBObjectId } from '../types/DBObjectId';
import { Game } from '../types/Game';
import { Location } from '../types/Location';
import { Player, PlayerColour, PlayerColourShapeCombination, PlayerShape } from '../types/Player';
import { Star } from '../types/Star';
import CarrierService from './carrier';
import GameTypeService from './gameType';
import MapService from './map';
import PlayerReadyService from './playerReady';
import RandomService from './random';
import SpecialistService from './specialist';
import StarService from './star';
import StarDistanceService from './starDistance';
import TechnologyService from './technology';

export default class PlayerService extends EventEmitter {
    gameRepo: DatabaseRepository<Game>;
    randomService: RandomService;
    mapService: MapService;
    starService: StarService;
    carrierService: CarrierService;
    starDistanceService: StarDistanceService;
    technologyService: TechnologyService;
    specialistService: SpecialistService;
    gameTypeService: GameTypeService;
    playerReadyService: PlayerReadyService;

    constructor(
        gameRepo: DatabaseRepository<Game>,
        randomService: RandomService,
        mapService: MapService,
        starService: StarService,
        carrierService: CarrierService,
        starDistanceService: StarDistanceService,
        technologyService: TechnologyService,
        specialistService: SpecialistService,
        gameTypeService: GameTypeService,
        playerReadyService: PlayerReadyService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.randomService = randomService;
        this.mapService = mapService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.gameTypeService = gameTypeService;
        this.playerReadyService = playerReadyService;
    }

    getById(game: Game, playerId: DBObjectId) {
        return game.galaxy.players.find(p => p._id.toString() === playerId.toString());
    }

    getByUserId(game: Game, userId: DBObjectId) {
        return game.galaxy.players.find(p => p.userId && p.userId.toString() === userId.toString());
    }

    getPlayersWithinScanningRangeOfPlayer(game: Game, players: Player[], player: Player) {
        let inRange = [player];
        let playerStars = this.starService.listStarsWithScanningRangeByPlayer(game, player._id);

        for (let otherPlayer of players) {
            if (inRange.indexOf(otherPlayer) > -1) {
                continue;
            }

            let otherPlayerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, otherPlayer._id);

            let isInRange = false;

            for (let s of otherPlayerStars) {
                if (this.starService.isStarWithinScanningRangeOfStars(game, s, playerStars)) {
                    isInRange = true;
                    break;
                }
            }

            if (isInRange) {
                inRange.push(otherPlayer);
            }
        }

        return inRange;
    }

    isInScanningRangeOfPlayer(game: Game, sourcePlayer: Player, targetPlayer: Player) {
        return this.getPlayersWithinScanningRangeOfPlayer(game, [targetPlayer], sourcePlayer)
            .find(p => p._id.toString() === targetPlayer._id.toString()) != null;
    }

    createEmptyPlayer(game: Game, colour: PlayerColour, shape: PlayerShape) {
        let player = {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: 'Empty Slot',
            colour: colour,
            shape: shape,
            credits: game.settings.player.startingCredits,
            creditsSpecialists: game.settings.player.startingCreditsSpecialists,
            renownToGive: game.settings.general.playerLimit,
            carriers: [],
            research: {
                terraforming: { level: game.settings.technology.startingTechnologyLevel.terraforming },
                experimentation: { level: game.settings.technology.startingTechnologyLevel.experimentation },
                scanning: { level: game.settings.technology.startingTechnologyLevel.scanning },
                hyperspace: { level: game.settings.technology.startingTechnologyLevel.hyperspace },
                manufacturing: { level: game.settings.technology.startingTechnologyLevel.manufacturing },
                banking: { level: game.settings.technology.startingTechnologyLevel.banking },
                weapons: { level: game.settings.technology.startingTechnologyLevel.weapons },
                specialists: { level: game.settings.technology.startingTechnologyLevel.specialists }
            }
        };

        this._setDefaultResearchTechnology(game, player as any);

        return player;
    }

    createEmptyPlayers(game: Game) {
        let players: any[] = [];

        let shapeColours = this._generatePlayerColourShapeList(game.settings.general.playerLimit);

        for (let i = 0; i < game.settings.general.playerLimit; i++) {
            let shapeColour = shapeColours[i];

            players.push(this.createEmptyPlayer(game, shapeColour.colour, shapeColour.shape));
        }

        if (game.galaxy.homeStars && game.galaxy.homeStars.length) {
            this._distributePlayerLinkedHomeStars(game, players);
        } else {
            this._distributePlayerHomeStars(game, players);
        }

        if (game.galaxy.linkedStars && game.galaxy.linkedStars.length) {
            this._distributePlayerLinkedStartingStars(game, players);
        }
        else {
            this._distributePlayerStartingStars(game, players);
        }

        return players;
    }

    _generatePlayerColourShapeList(playerCount: number) {
        let shapes: PlayerShape[] = ['circle', 'square', 'diamond', 'hexagon'];
        let colours = require('../config/game/colours').slice();

        let combinations: PlayerColourShapeCombination[] = [];

        for (let shape of shapes) {
            for (let colour of colours) {
                combinations.push({
                    shape,
                    colour
                });
            }
        }

        let result: PlayerColourShapeCombination[] = [];

        const maxAttempts: number = 2;
        let attempts: number = 0;

        while (result.length !== playerCount) {
            // Choose a random shape colour combination
            let shapeColourIndex = this.randomService.getRandomNumber(combinations.length - 1);
            let shapeColour = combinations[shapeColourIndex];

            // Test if the colour is already in the list,
            // if it is, try again up to the max attempt limit.
            // Ideally we do not want to have the same colours often.
            let existingColour = result.find(r => r.colour.alias === shapeColour.colour.alias);

            if (!existingColour || attempts >= maxAttempts) {
                combinations.splice(shapeColourIndex, 1);
                result.push(shapeColour);
                attempts = 0;
            } else {
                attempts++;
            }
        }

        return result;
    }

    _distributePlayerLinkedHomeStars(game: Game, players: Player[]) {
        for (let player of players) {
            let homeStarId = game.galaxy.homeStars!.pop()!;

            // Set up the home star
            let homeStar = this.starService.getById(game, homeStarId);

            this.starService.setupHomeStar(game, homeStar, player, game.settings);
        }
    }

    _distributePlayerHomeStars(game: Game, players: Player[]) {
        // Divide the galaxy into equal chunks, each player will spawned
        // at near equal distance from the center of the galaxy.
        const starLocations = game.galaxy.stars.map(s => s.location);

        // Calculate the center point of the galaxy as we need to add it onto the starting location.
        let galaxyCenter = this.mapService.getGalaxyCenterOfMass(starLocations);

        const distanceFromCenter = this._getDesiredPlayerDistanceFromCenter(game);

        let radians = this._getPlayerStartingLocationRadians(game.settings.general.playerLimit);

        // Create each player starting at angle 0 at a distance of half the galaxy radius

        for(let player of players) {
            let homeStar = this._getNewPlayerHomeStar(game, starLocations, galaxyCenter, distanceFromCenter, radians);

            // Set up the home star
            this.starService.setupHomeStar(game, homeStar, player, game.settings);
        }
    }

    _getDesiredPlayerDistanceFromCenter(game: Game) {
        let distanceFromCenter;
        const locations = game.galaxy.stars.map(s => s.location);

        // doughnut galaxies need the distance from the center needs to be slightly more than others
        // spiral galaxies need the distance to be slightly less, and they have a different galactic center
        if (game.settings.galaxy.galaxyType === 'doughnut') {
            distanceFromCenter = (this.starDistanceService.getMaxGalaxyDiameter(locations) / 2) * (3/4);
        } else if(game.settings.galaxy.galaxyType === 'spiral') {
            distanceFromCenter = this.starDistanceService.getMaxGalaxyDiameter(locations) / 2 / 2;
        } else{
            // The desired distance from the center is on two thirds from the galaxy center and the edge
            // for all galaxies other than doughnut and spiral.
            distanceFromCenter = (this.starDistanceService.getMaxGalaxyDiameter(locations) / 2) * (2/3);
        }

        return distanceFromCenter;
    }

    _distributePlayerLinkedStartingStars(game: Game, players: Player[]) {
        for (let player of players) {
            let linkedStars = game.galaxy.linkedStars.pop()!;

            for (let starId of linkedStars) {
                let star = this.starService.getById(game, starId);

                this.setupStarForGameStart(game, star, player, false);
            }
        }
    }

    _distributePlayerStartingStars(game: Game, players: Player[]) {
        // The fairest way to distribute stars to players is to
        // iterate over each player and give them 1 star at a time, this is arguably the fairest way
        // otherwise we'll end up with the last player potentially having a really bad position as their
        // stars could be miles away from their home star.
        let starsToDistribute = game.settings.player.startingStars - 1;

        while (starsToDistribute--) {
            for (let player of players) {
                let homeStar = this.starService.getById(game, player.homeStarId);

                // Get X closest stars to the home star and also give those to the player.
                let s = this.starDistanceService.getClosestUnownedStar(homeStar, game.galaxy.stars);

                // Set up the closest star.
                this.setupStarForGameStart(game, s, player, false);
            }
        }
    }

    // TODO: Shouldn't this be in the starService?
    setupStarForGameStart(game: Game, star: Star, player: Player, resetWarpGates: boolean) {
        if (player.homeStarId.toString() === star._id.toString()) {
            this.starService.setupHomeStar(game, star, player, game.settings);
        } else {
            star.ownedByPlayerId = player._id;
            star.shipsActual = game.settings.player.startingShips;
            star.ships = star.shipsActual;

            star.warpGate = star.warpGate ?? false;
            star.specialistId = star.specialistId ?? null;
            star.infrastructure.economy = star.infrastructure.economy ?? 0;
            star.infrastructure.industry = star.infrastructure.industry ?? 0;
            star.infrastructure.science = star.infrastructure.science ?? 0;

            if (resetWarpGates) {
                star.warpGate = false;
            }

            this.starService.resetIgnoreBulkUpgradeStatuses(star);
        }
    }

    resetPlayerForGameStart(game: Game, player: Player) {
        player.userId = null;
        player.alias = "Empty Slot";
        player.avatar = null;
        player.credits = game.settings.player.startingCredits;
        player.creditsSpecialists = game.settings.player.startingCreditsSpecialists;
        player.ready = false;
        player.readyToCycle = false;
        player.readyToQuit = false;

        // Reset the player's research
        this._setDefaultResearchTechnology(game, player);

        // Reset the player's stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            this.setupStarForGameStart(game, star, player, true);
        }

        // Reset the player's carriers
        this.carrierService.clearPlayerCarriers(game, player);

        let homeCarrier = this.createHomeStarCarrier(game, player);

        game.galaxy.carriers.push(homeCarrier as any);
    }

    _getNewPlayerHomeStar(game: Game, starLocations: Location[], galaxyCenter: Location, distanceFromCenter: number, radians: number[]) {
        switch (game.settings.specialGalaxy.playerDistribution) {
            case 'circular':
                return this._getNewPlayerHomeStarCircular(game, starLocations, galaxyCenter, distanceFromCenter, radians);
            case 'random':
                return this._getNewPlayerHomeStarRandom(game);
        }

        throw new Error(`Unsupported player distribution setting: ${game.settings.specialGalaxy.playerDistribution}`);
    }

    _getNewPlayerHomeStarCircular(game: Game, starLocations: Location[], galaxyCenter: Location, distanceFromCenter: number, radians: number[]) {
        // Get the player's starting location.
        let startingLocation = this._getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter);

        // Find the star that is closest to this location, that will be the player's home star.
        let homeStar = this.starDistanceService.getClosestUnownedStarFromLocation(startingLocation, game.galaxy.stars);

        return homeStar;
    }

    _getNewPlayerHomeStarRandom(game: Game) {
        // Pick a random unowned star.
        let unownedStars = game.galaxy.stars.filter(s => s.ownedByPlayerId == null);

        let rnd = this.randomService.getRandomNumber(unownedStars.length);

        return unownedStars[rnd];
    }

    _getPlayerStartingLocationRadians(playerCount: number) {
        const increment = 360 / playerCount * Math.PI / 180;
        let current = 0;

        let radians: number[] = [];

        for (let i = 0; i < playerCount; i++) {
            radians.push(current);
            current += increment;
        }

        return radians;
    }

    _getPlayerStartingLocation(radians: number[], galaxyCenter: Location, distanceFromCenter: number) {
        // Pick a random radian for the player's starting position.
        let radianIndex = this.randomService.getRandomNumber(radians.length);
        let currentRadians = radians.splice(radianIndex, 1)[0];

        // Get the desired player starting location.
        let startingLocation = {
            x: distanceFromCenter * Math.cos(currentRadians),
            y: distanceFromCenter * Math.sin(currentRadians)
        };

        // Add the galaxy center x and y so that the desired location is relative to the center.
        startingLocation.x += galaxyCenter.x;
        startingLocation.y += galaxyCenter.y;

        return startingLocation;
    }

    _setDefaultResearchTechnology(game: Game, player: Player) {
        let enabledTechs = this.technologyService.getEnabledTechnologies(game);

        player.researchingNow = enabledTechs[0] || 'weapons';
        player.researchingNext = player.researchingNow;
    }

    createHomeStarCarriers(game: Game) {
        let carriers: any[] = [];

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let homeCarrier = this.createHomeStarCarrier(game, player);

            carriers.push(homeCarrier);
        }

        return carriers;
    }

    createHomeStarCarrier(game: Game, player: Player) {
        let homeStar = this.starService.getPlayerHomeStar(game.galaxy.stars, player);

        if (!homeStar) {
            throw new Error('The player must have a home star in order to set up a carrier');
        }

        // Create a carrier for the home star.
        let homeCarrier = this.carrierService.createAtStar(homeStar, game.galaxy.carriers);

        return homeCarrier;
    }

    updateLastSeen(game: Game, player: Player, date?: Date) {
        player.lastSeen = date || moment().utc();
    }

    async updateLastSeenLean(gameId: DBObjectId, userId: DBObjectId, ipAddress: string) {
        await this.gameRepo.updateOne({
            _id: gameId,
            'galaxy.players.userId': userId
        }, {
            $set: {
                'galaxy.players.$.lastSeen': moment().utc(),
                'galaxy.players.$.lastSeenIP': ipAddress
            }
        });
    }

    deductCarrierUpkeepCost(game: Game, player: Player) {
        const upkeepCosts = {
            'none': 0,
            'cheap': 1,
            'standard': 3,
            'expensive': 6
        };

        let costPerCarrier = upkeepCosts[game.settings.specialGalaxy.carrierUpkeepCost];

        if (!costPerCarrier) {
            return null;
        }

        let carrierCount = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id).length;
        let totalCost = carrierCount * costPerCarrier;

        player.credits -= totalCost; // Note: Don't care if this goes into negative figures.

        return {
            carrierCount,
            totalCost
        };
    }

    async getGameNotes(game: Game, player: Player) {
        return player.notes;
    }

    async updateGameNotes(game: Game, player: Player, notes: string) {
        player.notes = notes;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.notes': notes
            }
        });
    }

    performDefeatedOrAfkCheck(game: Game, player: Player, isTurnBasedGame: boolean) {
        // Check if the player has been AFK.
        let isAfk = this.isAfk(game, player, isTurnBasedGame);

        if (isAfk) {
            this.setPlayerAsAfk(game, player);
        }

        // Check if the player has been defeated by conquest.
        if (!player.defeated) {
            let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

            // If there are no stars and there are no carriers then the player is defeated.
            if (stars.length === 0) {
                let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id); // Note: This logic looks a bit weird, but its more performant.

                if (carriers.length === 0) {
                    this.setPlayerAsDefeated(game, player);
                }
            }
        }
    }

    incrementMissedTurns(game: Game) {
        for (let player of game.galaxy.players) {
            // If the player isn't ready, increase their number of missed turns.
            if (!player.ready && !player.defeated) {
                player.missedTurns++;
            }
            else {
                // Reset the missed turns if the player was ready, we'll kick the player if they have missed consecutive turns only.
                player.missedTurns = 0;
            }
        }
    }

    isAfk(game: Game, player: Player, isTurnBasedGame: boolean) {
        // The player is afk if:
        // 1. They haven't been seen for X days.
        // 2. They missed the turn limit in a turn based game.
        // 3. They missed X cycles in a real time game (minimum of 12 hours)

        // Note: In tutorial games, only legit players can be considered afk.
        if (this.gameTypeService.isTutorialGame(game) && !player.userId) {
            return false;
        }

        let lastSeenMoreThanXDaysAgo = moment(player.lastSeen).utc() < moment().utc().subtract(game.settings.gameTime.afk.lastSeenTimeout, 'days');

        if (lastSeenMoreThanXDaysAgo) {
            return true;
        }

        if (isTurnBasedGame) {
            return player.missedTurns >= game.settings.gameTime.afk.turnTimeout;
        }

        let secondsXCycles = game.settings.galaxy.productionTicks * game.settings.gameTime.speed * game.settings.gameTime.afk.cycleTimeout;
        let secondsToAfk = Math.max(secondsXCycles, 43200); // Minimum of 12 hours.
        let lastSeenMoreThanXSecondsAgo = moment(player.lastSeen).utc() < moment().utc().subtract(secondsToAfk, 'seconds');

        return lastSeenMoreThanXSecondsAgo;
    }

    setPlayerAsDefeated(game: Game, player: Player) {
        player.defeated = true;
        player.defeatedDate = moment().utc();

        player.researchingNext = 'random'; // Set up the AI for random research.

        // Auto-ready the player so they don't hold up the game.
        if (game.settings.gameTime.gameType === 'turnBased') {
            player.ready = true;
        }

        // Make sure all stars are marked as not ignored - This is so the AI can bulk upgrade them.
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            this.starService.resetIgnoreBulkUpgradeStatuses(star);
        }

        // Clear out any carriers that have looped waypoints.
        this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);
    }

    setPlayerAsAfk(game: Game, player: Player) {
        this.setPlayerAsDefeated(game, player);

        player.afk = true;
    }

    hasDuplicateLastSeenIP(game: Game, player: Player) {
        if (!player.lastSeenIP) {
            return false;
        }

        return game.galaxy.players.find(p => p.lastSeenIP
            && p._id.toString() !== player._id.toString()
            && p.lastSeenIP === player.lastSeenIP) != null;
    }

    getKingOfTheHillPlayer(game: Game) {
        const star = this.starService.getKingOfTheHillStar(game);

        if (!star.ownedByPlayerId) {
            return null;
        }

        return this.getById(game, star.ownedByPlayerId)!;
    }

    async setHasSentTurnReminder(game: Game, player: Player, sent: boolean) {
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.hasSentTurnReminder': sent
            }
        });
    }

}
