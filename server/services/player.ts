import DiplomacyService from "./diplomacy";

const mongoose = require('mongoose');
const moment = require('moment');
const EventEmitter = require('events');
import Repository from './repository';
import { DBObjectId } from './types/DBObjectId';
import {Game, Team} from './types/Game';
import { Location } from './types/Location';
import { Player, PlayerColour, PlayerColourShapeCombination, PlayerShape, ResearchTypeNotRandom } from './types/Player';
import CarrierService from './carrier';
import GameTypeService from './gameType';
import MapService from './map';
import PlayerReadyService from './playerReady';
import RandomService from './random';
import SpecialistService from './specialist';
import StarService from './star';
import StarDistanceService from './starDistance';
import TechnologyService from './technology';
import TeamService from "./team";
import { ValidationError } from "solaris-common";
import {shuffle} from "./utils";
import { Carrier } from "./types/Carrier";
import { Star } from "./types/Star";
import PlayerColourService from "./playerColour";
import {MathRandomGen} from "../utils/randomGen";
import InitialGameStateService from "./initialGameState";
import { logger } from "../utils/logging";

const log = logger("Player Service");

export default class PlayerService extends EventEmitter {
    gameRepo: Repository<Game>;
    randomService: RandomService;
    mapService: MapService;
    starService: StarService;
    carrierService: CarrierService;
    starDistanceService: StarDistanceService;
    technologyService: TechnologyService;
    specialistService: SpecialistService;
    gameTypeService: GameTypeService;
    playerReadyService: PlayerReadyService;
    teamService: TeamService;
    playerColourService: PlayerColourService;
    initialGameStateService: InitialGameStateService;

    constructor(
        gameRepo: Repository<Game>,
        randomService: RandomService,
        mapService: MapService,
        starService: StarService,
        carrierService: CarrierService,
        starDistanceService: StarDistanceService,
        technologyService: TechnologyService,
        specialistService: SpecialistService,
        gameTypeService: GameTypeService,
        playerReadyService: PlayerReadyService,
        teamService: TeamService,
        playerColourService: PlayerColourService,
        initialGameStateService: InitialGameStateService,
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
        this.teamService = teamService;
        this.playerColourService = playerColourService;
        this.initialGameStateService = initialGameStateService;
    }

    getById(game: Game, playerId: DBObjectId) {
        return game.galaxy.players.find(p => p._id.toString() === playerId.toString());
    }

    getByUserId(game: Game, userId: DBObjectId) {
        return game.galaxy.players.find(p => p.userId && p.userId.toString() === userId.toString());
    }

    getPlayerIdByUserId(game: Game, userId: DBObjectId): DBObjectId | undefined {
        return game.galaxy.players.find(p => p.userId && p.userId.toString() === userId.toString())?._id;
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

    createEmptyPlayer(game: Game, colour: PlayerColour, shape: PlayerShape): Player {
        const defaultTech = this.technologyService.getDefaultTechnology(game);
        const researchingNow: ResearchTypeNotRandom = defaultTech;
        const researchingNext: ResearchTypeNotRandom = defaultTech;

        let player: Player = {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            homeStarId: null,
            alias: 'Empty Slot',
            avatar: null,
            notes: null,
            colour: colour,
            shape: shape,
            lastSeen: null,
            lastSeenIP: null,
            researchingNow,
            researchingNext,
            credits: game.settings.player.startingCredits,
            creditsSpecialists: game.settings.player.startingCreditsSpecialists,
            isOpenSlot: true,
            defeated: false,
            defeatedDate: null,
            afk: false,
            renownToGive: game.settings.general.playerLimit,
            ready: false,
            readyToCycle: false,
            readyToQuit: false,
            missedTurns: 0,
            hasSentTurnReminder: false,
            hasFilledAfkSlot: false,
            research: {
                terraforming: { level: game.settings.technology.startingTechnologyLevel.terraforming },
                experimentation: { level: game.settings.technology.startingTechnologyLevel.experimentation },
                scanning: { level: game.settings.technology.startingTechnologyLevel.scanning },
                hyperspace: { level: game.settings.technology.startingTechnologyLevel.hyperspace },
                manufacturing: { level: game.settings.technology.startingTechnologyLevel.manufacturing },
                banking: { level: game.settings.technology.startingTechnologyLevel.banking },
                weapons: { level: game.settings.technology.startingTechnologyLevel.weapons },
                specialists: { level: game.settings.technology.startingTechnologyLevel.specialists }
            },
            ledger: {
                credits: [],
                creditsSpecialists: [],
            },
            reputations: [],
            diplomacy: [],
            spectators: [],
            scheduledActions: [],
            colourMapping: new Map(),
        };

        return player;
    }

    setupEmptyPlayers(game: Game) {
        const players: Player[] = [];

        if (game.settings.general.mode === 'teamConquest') {
            const teams: Team[] = [];

            const teamsNumber = game.settings.conquest.teamsCount;

            if (!teamsNumber) {
                throw new ValidationError("Team count not provided");
            }

            const playersPerTeam = game.settings.general.playerLimit / teamsNumber;
            const teamColourShapeList = this.playerColourService.generateTeamColourShapeList(teamsNumber, new Array<number>(teamsNumber).fill(playersPerTeam));

            for (let ti = 0; ti < teamsNumber; ti++) {
                const team: Team = {
                    _id: new mongoose.Types.ObjectId() as any,
                    name: `Team ${ti + 1}`,
                    players: []
                };

                teams.push(team);
            }

            const teamAssignments = this.teamService.generateTeamAssignments(game.settings.general.playerLimit, teamsNumber);

            for (let i = 0; i < game.settings.general.playerLimit; i++) {
                const teamNumber = teamAssignments[i];
                const team = teams[teamNumber];

                const shapeColour = teamColourShapeList[teamNumber][team.players.length];

                const player = this.createEmptyPlayer(game, shapeColour.colour, shapeColour.shape);

                players.push(player);

                team.players.push(player._id);
            }

            game.galaxy.teams = teams;
        } else {
            const shapeColours = this.playerColourService.generatePlayerColourShapeList(game.settings.general.playerLimit);

            for (let i = 0; i < game.settings.general.playerLimit; i++) {
                const shapeColour = shapeColours[i];
                const player = this.createEmptyPlayer(game, shapeColour.colour, shapeColour.shape);

                players.push(player);
            }
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

        game.galaxy.players = players;
    }

    _distributePlayerLinkedHomeStars(game: Game, players: Player[]) {
        let playersDistributed: Player[] = [];

        if (game.settings.specialGalaxy.playerDistribution === 'circularSequential') {
            playersDistributed = players;
        } else { // circular and random are both kinds of random distributions, but the latter will not work for irregular maps, so we do the same thing and use a random circular distribution
            playersDistributed = shuffle(new MathRandomGen(), players);
        }

        for (let player of playersDistributed) {
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
        const galaxyCenter = this.starDistanceService.getGalaxyCenterOfMass(starLocations);

        const distanceFromCenter = this._getDesiredPlayerDistanceFromCenter(game);

        const radians = this._getPlayerStartingLocationRadians(game.settings.general.playerLimit);

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

                this.starService.setupPlayerStarForGameStart(game, star, player);
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
                let homeStar = this.starService.getById(game, player.homeStarId!);

                // Get X closest stars to the home star and also give those to the player.
                let s = this.starDistanceService.getClosestUnownedStar(homeStar, game.galaxy.stars);

                // Set up the closest star.
                this.starService.setupPlayerStarForGameStart(game, s, player);
            }
        }
    }

    async resetPlayerForGameStart(game: Game, player: Player) {
        const playerId = player._id.toString();

        player.userId = null;
        player.alias = "Empty Slot";
        player.avatar = null;
        player.credits = game.settings.player.startingCredits;
        player.creditsSpecialists = game.settings.player.startingCreditsSpecialists;
        player.ready = false;
        player.readyToCycle = false;
        player.readyToQuit = false;
        player.isOpenSlot = true;
        player.spectators = [];
        player.scheduledActions = [];
        player.lastSeen = null;
        player.lastSeenIP = null;

        const initialGameState = (await this.initialGameStateService.getByGameId(game._id));

        if (!initialGameState) {
            log.error(`Fatal: Player ${player._id} cannot quit game ${game.settings.general.name} (${game._id}) because no initial game state exists`);

            throw new ValidationError("Failed to quit game", 500);
        }

        const initialPlayer = initialGameState.galaxy.players.find(p => p.playerId.toString() === playerId)!;

        player.credits = initialPlayer.credits;
        player.creditsSpecialists = initialPlayer.creditsSpecialists;
        player.researchingNow = initialPlayer.researchingNow;
        player.researchingNext = initialPlayer.researchingNext;
        player.research = initialPlayer.research;
        player.diplomacy = initialPlayer.diplomacy;

        // Reset the player's stars.
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            const initialStar = initialGameState?.galaxy.stars.find(s => s.starId.toString() === star._id.toString())!;

            star.ignoreBulkUpgrade = {
                economy: false,
                industry: false,
                science: false,
            };
            star.name = initialStar.name;
            star.infrastructure = initialStar.infrastructure;
            star.naturalResources = initialStar.naturalResources;
            star.isAsteroidField = initialStar.isAsteroidField;
            star.isNebula = initialStar.isNebula;
            star.isBinaryStar = initialStar.isBinaryStar;
            star.isBlackHole = initialStar.isBlackHole;
            star.isPulsar = initialStar.isPulsar;
            star.name = initialStar.name;
            star.ownedByPlayerId = initialStar.ownedByPlayerId;
            star.ships = initialStar.ships;
            star.specialistId = initialStar.specialistId;
            star.specialistExpireTick = initialStar.specialistExpireTick;
            star.warpGate = initialStar.warpGate;
            star.wormHoleToStarId = initialStar.wormHoleToStarId;
        }

        // Reset the player's carriers
        this.carrierService.clearPlayerCarriers(game, player);

        const initialCarriers = initialGameState.galaxy.carriers.filter(c => c.ownedByPlayerId?.toString() === playerId);

        for (let savedCarrier of initialCarriers) {
            const newCarrier: Carrier = {
                orbiting: savedCarrier.orbiting,
                name: savedCarrier.name,
                ownedByPlayerId: player._id,
                ships: savedCarrier.ships,
                specialistId: savedCarrier.specialistId,
                specialistExpireTick: savedCarrier.specialistExpireTick,
                isGift: savedCarrier.isGift,
                location: savedCarrier.location,
                waypoints: savedCarrier.waypoints,
                waypointsLooped: false,
                _id: mongoose.Types.ObjectId(),
                specialist: null,
                locationNext: null,
                toObject(): Carrier {
                    return this;
                }
            }

            game.galaxy.carriers.push(newCarrier);
        }
    }

    _getNewPlayerHomeStar(game: Game, starLocations: Location[], galaxyCenter: Location, distanceFromCenter: number, radians: number[]) {
        switch (game.settings.specialGalaxy.playerDistribution) {
            case 'circular':
                return this._getNewPlayerHomeStarCircular(game, starLocations, galaxyCenter, distanceFromCenter, radians, true);
            case 'circularSequential':
                return this._getNewPlayerHomeStarCircular(game, starLocations, galaxyCenter, distanceFromCenter, radians, false);
            case 'random':
                return this._getNewPlayerHomeStarRandom(game);
        }

        throw new Error(`Unsupported player distribution setting: ${game.settings.specialGalaxy.playerDistribution}`);
    }

    _getNewPlayerHomeStarCircular(game: Game, starLocations: Location[], galaxyCenter: Location, distanceFromCenter: number, radians: number[], random: boolean) {
        // Get the player's starting location.
        let startingLocation = this._getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter, random);

        // Find the star that is closest to this location, that will be the player's home star.
        let homeStar = this.starDistanceService.getClosestUnownedStarFromLocation(startingLocation, game.galaxy.stars);

        return homeStar;
    }

    _getNewPlayerHomeStarRandom(game: Game) {
        // Pick a random unowned star.
        let unownedStars = game.galaxy.stars.filter(s => s.ownedByPlayerId == null);

        let rnd = this.randomService.getRandomNumber(unownedStars.length - 1);

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

    _getPlayerStartingLocation(radians: number[], galaxyCenter: Location, distanceFromCenter: number, random: boolean) {
        let currentRadian: number;

        if (random) {
            // Pick a random radian for the player's starting position.
            let radianIndex = this.randomService.getRandomNumber(radians.length - 1);
            currentRadian = radians.splice(radianIndex, 1)[0];
        } else {
            currentRadian = radians.pop()!;
        }

        // Get the desired player starting location.
        let startingLocation = {
            x: distanceFromCenter * Math.cos(currentRadian),
            y: distanceFromCenter * Math.sin(currentRadian)
        };

        // Add the galaxy center x and y so that the desired location is relative to the center.
        startingLocation.x += galaxyCenter.x;
        startingLocation.y += galaxyCenter.y;

        return startingLocation;
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
        player.lastSeen = date || moment().utc().toDate();
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
        if (notes.length > 2000) {
            throw new ValidationError('Notes cannot exceed 2000 characters.');
        }

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

    ownsOriginalHomeStar(game: Game, player: Player) {
        const stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        return this.starService.getByIdBSForStars(stars, player.homeStarId!) != null;
    }

    canSlotBeOpen(game: Game, player: Player) {

        if (this.gameTypeService.isCapitalStarEliminationMode(game)) {
            return this.ownsOriginalHomeStar(game, player);
        }

        const stars: Star[] = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        if (stars.length > 0) {
            return true;
        }

        const carriers: Carrier[] = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        return carriers.length > 0;
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

    setPlayerAsDefeated(game: Game, player: Player, openSlot: boolean) {
        player.isOpenSlot = openSlot;
        player.defeated = true;
        player.defeatedDate = moment().utc().toDate();

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

    setSlotOpen(player: Player, openSlot: boolean) {
        player.isOpenSlot = openSlot;
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
