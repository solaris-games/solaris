import { ValidationError } from "solaris-common";
import CarrierService from "./carrier";
import NameService from "./name";
import PlayerService from "./player";
import PlayerColourService from "./playerColour";
import SpecialistService from "./specialist";
import TeamService from "./team";
import { Carrier } from "./types/Carrier";
import { CarrierWaypoint } from "solaris-common";
import {
    CustomGalaxy,
    CustomGalaxyCarrier,
    CustomGalaxyPlayer,
    CustomGalaxyStar,
    PlayerColourShapeCombination
} from "solaris-common";
import { DBObjectId } from "./types/DBObjectId";
import { Game, Team } from "./types/Game";
import { Location } from "./types/Location";
import { Player } from "./types/Player";
import { Star } from "./types/Star";
import {GameSettingsReq} from "./gameCreate";
import mongoose from 'mongoose';

export default class CustomGalaxyService {
    nameService: NameService;
    specialistService: SpecialistService;
    playerService: PlayerService;
    playerColourService: PlayerColourService;
    teamService: TeamService;
    carrierService: CarrierService;

    constructor(
        nameService: NameService,
        specialistService: SpecialistService,
        playerService: PlayerService,
        playerColourService: PlayerColourService,
        teamService: TeamService,
        carrierService: CarrierService
    ) {
        this.nameService = nameService;
        this.specialistService = specialistService;
        this.playerService = playerService;
        this.playerColourService = playerColourService;
        this.teamService = teamService;
        this.carrierService = carrierService;
    }

    validateAndCompleteCustomGalaxy(settings: GameSettingsReq, isAdvancedCustomGalaxy: boolean) {
        const customGalaxy = settings.galaxy.customGalaxy!;

        const starIdSet = new Set<string>(customGalaxy.stars.map(s => s.id));
        if (starIdSet.size !== customGalaxy.stars.length) {
            throw new ValidationError(`Multiple stars cannot have the same ID.`);
        }

        const validStarSpecialistIdSet = new Set<number>(this.specialistService.listStar(null).filter(s => s.active.custom).map(s => s.id));

        for (const star of customGalaxy.stars) {
            if (star.wormHoleToStarId != null) {
                if (star.wormHoleToStarId === star.id) {
                    throw new ValidationError(`A star cannot have a worm hole to itself.`);
                }
            
                if (!starIdSet.has(star.wormHoleToStarId)) {
                    throw new ValidationError(`A star with ID '${star.wormHoleToStarId}' does not exist.`);
                }
            }

            if (star.specialistId != null && !validStarSpecialistIdSet.has(star.specialistId)) {
                throw new ValidationError(`A star specialist with ID '${star.specialistId}' does not exist.`);
            }

            if (star.playerId == null) {
                if (star.homeStar) {
                    throw new ValidationError(`Home stars must have a player ID.`);
                }

                if (star.shipsActual && star.shipsActual !== 0) {
                    throw new ValidationError(`Unowned stars must have 0 ships.`);
                }
            }

            if (star.naturalResources.economy + star.naturalResources.industry + star.naturalResources.science === 0) {
                if (star.specialistId != null || star.warpGate || star.infrastructure.economy !== 0 ||
                    star.infrastructure.industry !== 0 || star.infrastructure.science !== 0
                ) {
                    throw new ValidationError(`Dead stars must have 0 infrastructure, no specialists and no warp gates.`);
                }
            }
        }

        if (isAdvancedCustomGalaxy) {
            this._validateAdvancedCustomGalaxy(customGalaxy, starIdSet, settings);
        }

        settings.general.playerLimit = settings.galaxy.customGalaxy!.stars.filter(s => s.homeStar).length;

        if (settings.galaxy.customGalaxy!.stars.find((s) =>
            s.naturalResources.economy != s.naturalResources.industry || s.naturalResources.economy != s.naturalResources.science) != null
        ) {
            settings.specialGalaxy.splitResources = 'enabled';
        } else {
            settings.specialGalaxy.splitResources = 'disabled';
        }

        settings.specialGalaxy.randomWarpGates = 0;
        settings.specialGalaxy.randomWormHoles = 0;
        settings.specialGalaxy.randomNebulas = 0;
        settings.specialGalaxy.randomAsteroidFields = 0;
        settings.specialGalaxy.randomBinaryStars = 0;
        settings.specialGalaxy.randomBlackHoles = 0;
        settings.specialGalaxy.randomPulsars = 0;

        if (isAdvancedCustomGalaxy) {
            if (settings.general.mode === 'teamConquest') {
                settings.conquest.teamsCount = settings.galaxy.customGalaxy!.teams!.length;
                settings.diplomacy.maxAlliances = settings.galaxy.customGalaxy!.players!.length - 1;
            }
        }
    }

    private _validateAdvancedCustomGalaxy(customGalaxy: CustomGalaxy, starIdSet: Set<string>, settings: GameSettingsReq) {
        if (!customGalaxy.players) {
            throw new ValidationError(`Missing required field 'players' in custom galaxy JSON.`);
        }

        const playerIdSet = new Set<string>(customGalaxy.players.map(p => p.id));
        if (playerIdSet.size !== customGalaxy.players.length) {
            throw new ValidationError(`Multiple players cannot have the same ID.`);
        }

        const homeStarPlayerIdMap = new Map<string, string>();

        for (const player of customGalaxy.players) {
            if (!starIdSet.has(player.homeStarId)) {
                throw new ValidationError(`A star with ID '${player.homeStarId}' does not exist.`);
            }

            homeStarPlayerIdMap.set(player.homeStarId, player.id);
        }

        const playerHomeStarIds = customGalaxy.players.map(p => p.homeStarId);
        if (playerHomeStarIds.length !== homeStarPlayerIdMap.size) {
            throw new ValidationError(`Multiple players cannot have the same capital star.`);
        }

        if (settings.general.mode === 'teamConquest') {
            if (!customGalaxy.teams) {
                throw new ValidationError(`Missing required field 'teams' in custom galaxy JSON.`);
            }

            const allTeamsPlayerIds = customGalaxy.teams.flatMap(t => t.players);

            if (allTeamsPlayerIds.length < customGalaxy.players.length) {
                throw new ValidationError(`In a team game, all players must be in a team.`);
            }

            if (new Set<string>(allTeamsPlayerIds).size !== allTeamsPlayerIds.length) {
                throw new ValidationError(`A player must be in only one team.`);
            }

            for (const teamPlayerId of allTeamsPlayerIds) {
                if (!playerIdSet.has(teamPlayerId)) {
                    throw new ValidationError(`A player with ID '${teamPlayerId}' does not exist.`);
                }
            }
        }

        for (const star of customGalaxy.stars) {
            if (star.playerId != null && !playerIdSet.has(star.playerId)) {
                throw new ValidationError(`A player with ID '${star.playerId}' does not exist.`);
            }

            if (star.homeStar && homeStarPlayerIdMap.get(star.id) !== star.playerId) {
                throw new ValidationError(`All capital stars must belong to a player and be controlled by that player.`);
            }

            if (!star.homeStar && homeStarPlayerIdMap.get(star.id)) {
                throw new ValidationError(`A player's capital star must have the 'homeStar' field set to true.`);
            }
        }

        if (customGalaxy.carriers) {
            if (customGalaxy.carriers.length > 500) {
                throw new ValidationError(`A maximum of 500 carriers are allowed in an advanced custom galaxy.`);
            }

            const carrierIdSet = new Set<string>(customGalaxy.carriers.map(c => c.id));
            if (carrierIdSet.size !== customGalaxy.carriers.length) {
                throw new ValidationError(`Multiple carriers cannot have the same ID.`);
            }

            const validCarrierSpecialistIdSet = new Set<number>(this.specialistService.listCarrier(null).filter(s => s.active.custom).map(s => s.id));

            for (const carrier of customGalaxy.carriers) {
                if (!playerIdSet.has(carrier.playerId)) {
                    throw new ValidationError(`A player with ID '${carrier.playerId}' does not exist.`);
                }

                if (carrier.orbiting != null && !starIdSet.has(carrier.orbiting)) {
                    throw new ValidationError(`A star with ID '${carrier.orbiting}' does not exist.`);
                }

                if (carrier.orbiting == null) {
                    if (carrier.waypoints.length === 0) {
                        throw new ValidationError(`In-flight carriers must have at least 1 waypoint.`);
                    }

                    if (carrier.waypoints[0].delayTicks !== 0) {
                        throw new ValidationError(`The delay of the first waypoint of an in-flight carrier must be 0.`);
                    }

                    if (carrier.progress === undefined) {
                        throw new ValidationError(`In-flight carriers must have a progress value.`);
                    }
                }

                // If this is not a tutorial game, remove all waypoints except the first.
                // If the carrier is not in flight, remove the first waypoint as well.
                // Otherwise, we would have to validate the waypoints.
                if (settings.general.type !== 'tutorial') {
                    if (carrier.orbiting == null) {
                        carrier.waypoints.length = 1;
                    } else {
                        carrier.waypoints.length = 0;
                    }

                    carrier.waypointsLooped = false;
                }

                for (let wi = 0; wi < carrier.waypoints.length; wi++) {
                    if (!starIdSet.has(carrier.waypoints[wi].source)) {
                        throw new ValidationError(`A star with ID '${carrier.waypoints[wi].source}' does not exist.`);
                    }

                    if (!starIdSet.has(carrier.waypoints[wi].destination)) {
                        throw new ValidationError(`A star with ID '${carrier.waypoints[wi].destination}' does not exist.`);
                    }

                    if (wi !== 0) {
                        if (carrier.waypoints[wi - 1].destination !== carrier.waypoints[wi].source) {
                            throw new ValidationError(`The destination of a waypoint must be the source of the subsequent waypoint.`);
                        }
                    }
                }

                if (carrier.specialistId != null && !validCarrierSpecialistIdSet.has(carrier.specialistId)) {
                    throw new ValidationError(`A carrier specialist with ID '${carrier.specialistId}' does not exist.`);
                }
            }
        } else {
            // Ensure that all players have a home star and vice versa.
            const starPlayerIds = customGalaxy.stars.map(s => s.playerId).filter(pid => pid != null);
            const homeStarPlayerIds = customGalaxy.stars.filter(s => s.homeStar).map(s => s.playerId!);
            const homeStarPlayerIdSet = new Set<string>(homeStarPlayerIds);

            if (homeStarPlayerIds.length !== homeStarPlayerIdSet.size) {
                throw new ValidationError(`A player can have only one home star.`);
            }

            // Ensure that all star playerIds also have a home star.
            for (const starPlayerId of starPlayerIds) {
                if (!homeStarPlayerIdSet.has(starPlayerId)) {
                    throw new ValidationError(`All players must have a home star.`);
                }
            }
        }
    }

    generatePlayers(game: Game, customGalaxy: CustomGalaxy) {
        const generatedPlayers = new Map<string, Player>();

        if (game.settings.general.mode === 'teamConquest') {
            const teams: Team[] = [];

            const numTeams = customGalaxy.teams!.length;
            const teamPlayerCounts: number[] = [];
            for (const customTeam of customGalaxy.teams!) {
                teamPlayerCounts.push(customTeam.players.length);
            }

            const teamColourShapeList = this.playerColourService.generateTeamColourShapeList(numTeams, teamPlayerCounts);

            for (let ti = 0; ti < numTeams; ti++) {
                const customTeam = customGalaxy.teams![ti];

                const team: Team = {
                    _id: new mongoose.Types.ObjectId(),
                    name: customTeam.name ? customTeam.name : `Team ${ti + 1}`,
                    players: []
                };

                const customTeamPlayerIds = customTeam.players;
                for (let pi = 0; pi < customTeamPlayerIds.length; pi++) {
                    const customPlayer = customGalaxy.players!.find(p => p.id === customTeamPlayerIds[pi])!;
                    const shapeColour = teamColourShapeList[ti][pi];

                    const player = this._createPlayer(game, shapeColour, customPlayer, generatedPlayers);

                    team.players.push(player._id);
                }

                teams.push(team);
            }

            game.galaxy.teams = teams;
        } else {
            const numPlayers = customGalaxy.players!.length;
            const shapeColours = this.playerColourService.generatePlayerColourShapeList(numPlayers);

            for (let i = 0; i < numPlayers; i++) {
                const customPlayer = customGalaxy.players![i];
                const shapeColour = shapeColours[i];
                this._createPlayer(game, shapeColour, customPlayer, generatedPlayers);
            }
        }

        return generatedPlayers;
    }

    private _createPlayer(game: Game, shapeColour: PlayerColourShapeCombination, customPlayer: CustomGalaxyPlayer, generatedPlayers: Map<string, Player>) {
        const player = this.playerService.createEmptyPlayer(game, shapeColour.colour, shapeColour.shape);

        player.credits = customPlayer.credits;
        player.creditsSpecialists = customPlayer.creditsSpecialists;
        player.research = {
            terraforming: {level: customPlayer.technologies.terraforming},
            experimentation: {level: customPlayer.technologies.experimentation},
            scanning: {level: customPlayer.technologies.scanning},
            hyperspace: {level: customPlayer.technologies.hyperspace},
            manufacturing: {level: customPlayer.technologies.manufacturing},
            banking: {level: customPlayer.technologies.banking},
            weapons: {level: customPlayer.technologies.weapons},
            specialists: {level: customPlayer.technologies.specialists}
        };

        if (customPlayer.alias) {
            player.alias = customPlayer.alias;
        }

        generatedPlayers.set(customPlayer.id, player);
        return player;
    }

    generateStarsAdvanced(game: Game, generatedPlayers: Map<string, Player>, customGalaxy: CustomGalaxy) {
        const generatedStars = new Map<string, Star>();

        const starNames = this.nameService.getRandomStarNames(customGalaxy.stars.length);

        for (let i = 0; i < customGalaxy.stars.length; i++) {
            const customStar = customGalaxy.stars[i];
            const starName = customStar.name ? customStar.name : starNames[i];
            const star = this._createUnownedCustomGalaxyStar(starName, customStar);

            if (customStar.playerId != null) {
                star.ownedByPlayerId = generatedPlayers.get(customStar.playerId)!._id;

                if (customStar.homeStar) {
                    generatedPlayers.get(customStar.playerId)!.homeStarId = star._id;
                }
            }

            generatedStars.set(customStar.id, star);
        }

        for (const customStar of customGalaxy.stars) {
            if (customStar.wormHoleToStarId != null) {
                const star = generatedStars.get(customStar.id)!;
                const targetStar = generatedStars.get(customStar.wormHoleToStarId)!;

                star.wormHoleToStarId = targetStar._id;
            }
        }

        return generatedStars;
    }

    generateCarriers(game: Game, generatedPlayers: Map<string, Player>, generatedStars: Map<string, Star>, customGalaxy: CustomGalaxy) {
        const carriers: Carrier[] = [];

        if (!customGalaxy.carriers) return carriers;

        for (const customCarrier of customGalaxy.carriers) {
            const ownerId = generatedPlayers.get(customCarrier.playerId)!._id;

            // Convert waypoints
            const waypoints: CarrierWaypoint<DBObjectId>[] = [];
            for (const customWaypoint of customCarrier.waypoints) {
                const source = generatedStars.get(customWaypoint.source)!._id;
                const destination = generatedStars.get(customWaypoint.destination)!._id;

                waypoints.push({
                    _id: new mongoose.Types.ObjectId(),
                    source: source,
                    destination: destination,
                    action: customWaypoint.action,
                    actionShips: customWaypoint.actionShips,
                    delayTicks: customWaypoint.delayTicks
                });
            }

            if (customCarrier.orbiting != null) {
                const carrierStar = generatedStars.get(customCarrier.orbiting)!;
                const name = customCarrier.name ? customCarrier.name : this.carrierService.generateCarrierName(carrierStar, carriers);

                carriers.push(this._createCustomGalaxyCarrier(name, ownerId, carrierStar.location, carrierStar._id, waypoints, customCarrier));
            } else {
                const carrierOriginStar = generatedStars.get(customCarrier.waypoints[0].source)!;
                const carrierDestinationStar = generatedStars.get(customCarrier.waypoints[0].destination)!;
                const name = customCarrier.name ? customCarrier.name : this.carrierService.generateCarrierName(carrierOriginStar, carriers);
                const location = this._progressAlongPathToLocation(customCarrier.progress!, carrierOriginStar.location, carrierDestinationStar.location);

                carriers.push(this._createCustomGalaxyCarrier(name, ownerId, location, null, waypoints, customCarrier));
            }
        }

        return carriers;
    }

    generateStars(game: Game, customGalaxy: CustomGalaxy) {
        const generatedStars = new Map<string, Star>();
        const homeStarIds: any[] = [];
        const linkedStarIds: any[] = [];

        const starNames = this.nameService.getRandomStarNames(customGalaxy.stars.length);

        for (let i = 0; i < customGalaxy.stars.length; i++) {
            const customStar = customGalaxy.stars[i];
            const starName = customStar.name ? customStar.name : starNames[i];
            const star = this._createUnownedCustomGalaxyStar(starName, customStar);

            generatedStars.set(customStar.id, star);
        }

        for (const customStar of customGalaxy.stars) {
            if (customStar.homeStar) {
                homeStarIds.push(generatedStars.get(customStar.id)!._id);
                linkedStarIds.push(this._getLinkedStarIds(customStar.playerId!, generatedStars, customGalaxy.stars));
            }

            if (customStar.wormHoleToStarId != null) {
                const star = generatedStars.get(customStar.id)!;
                const targetStar = generatedStars.get(customStar.wormHoleToStarId)!;

                star.wormHoleToStarId = targetStar._id;
            }
        }

        return {
            stars: Array.from(generatedStars.values()),
            homeStarIds,
            linkedStarIds
        }
    }

    _createUnownedCustomGalaxyStar(name: string, customStar: CustomGalaxyStar) {
        return {
            _id: new mongoose.Types.ObjectId(),
            location: customStar.location,
            ownedByPlayerId: null,
            name: name,
            naturalResources: customStar.naturalResources,
            shipsActual: customStar.shipsActual,
            ships: customStar.shipsActual ? Math.floor(customStar.shipsActual) : undefined,
            specialistId: customStar.specialistId,
            specialistExpireTick: customStar.specialistExpireTick,
            homeStar: customStar.homeStar,
            warpGate: customStar.warpGate,
            isNebula: customStar.isNebula,
            isAsteroidField: customStar.isAsteroidField,
            isBinaryStar: customStar.isBinaryStar,
            isBlackHole: customStar.isBlackHole,
            isPulsar: customStar.isPulsar,
            wormHoleToStarId: null,
            infrastructure: customStar.infrastructure
        } as Star;
    }

    _getLinkedStarIds(customPlayerId: string, generatedStars: Map<string, Star>, customStars: CustomGalaxyStar[]) {
        const linkedStarIds: DBObjectId[] = [];
        const linkedCustomStarIds = customStars.filter(cs => cs.playerId === customPlayerId).map(cs => cs.id);

        for (const linkedCustomStarId of linkedCustomStarIds) {
            linkedStarIds.push(generatedStars.get(linkedCustomStarId)!._id);
        }

        return linkedStarIds;
    }

    _createCustomGalaxyCarrier(name: string, ownerId: DBObjectId, location: Location, orbiting: DBObjectId | null, waypoints: CarrierWaypoint<DBObjectId>[], customCarrier: CustomGalaxyCarrier) {
        return {
            _id: new mongoose.Types.ObjectId(),
            ownedByPlayerId: ownerId,
            location: location,
            name: name,
            orbiting: orbiting,
            waypointsLooped: customCarrier.waypointsLooped,
            ships: customCarrier.ships,
            specialistId: customCarrier.specialistId,
            specialistExpireTick: customCarrier.specialistExpireTick,
            isGift: customCarrier.isGift,
            waypoints: waypoints
        } as Carrier;
    }

    _progressAlongPathToLocation(progress: number, sourceLoc: Location, destinationLoc: Location): Location {
        return { x: sourceLoc.x + (destinationLoc.x - sourceLoc.x) * progress, y: sourceLoc.y + (destinationLoc.y - sourceLoc.y) * progress };
    }
}