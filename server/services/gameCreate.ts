const mongoose = require('mongoose');
import ValidationError from '../errors/validation';
import {Game, GameSettings, Team} from './types/Game';
import AchievementService from './achievement';
import ConversationService from './conversation';
import GameCreateValidationService from './gameCreateValidation';
import GameFluxService from './gameFlux';
import GameListService from './gameList';
import GameTypeService from './gameType';
import HistoryService from './history';
import MapService from './map';
import NameService from './name';
import PasswordService from './password';
import PlayerService from './player';
import SpecialistBanService from './specialistBan';
import UserService from './user';
import GameJoinService from './gameJoin';
import SpecialStarBanService from './specialStarBan';
import StarService from './star';
import DiplomacyService from "./diplomacy";
import {DBObjectId} from "./types/DBObjectId";
import {shuffle} from "./utils";
import TeamService from "./team";
import CarrierService from './carrier';
import { Carrier } from './types/Carrier';

const RANDOM_NAME_STRING = '[[[RANDOM]]]';

export default class GameCreateService {
    gameModel;
    gameJoinService: GameJoinService;
    gameListService: GameListService;
    nameService: NameService;
    mapService: MapService;
    playerService: PlayerService;
    passwordService: PasswordService;
    conversationService: ConversationService;
    historyService: HistoryService;
    achievementService: AchievementService;
    userService: UserService;
    gameCreateValidationService: GameCreateValidationService;
    gameFluxService: GameFluxService;
    specialistBanService: SpecialistBanService;
    specialStarBanService: SpecialStarBanService;
    gameTypeService: GameTypeService;
    starService: StarService;
    diplomacyService: DiplomacyService;
    teamService: TeamService;
    carrierService: CarrierService;

    constructor(
        gameModel,
        gameJoinService: GameJoinService,
        gameListService: GameListService,
        nameService: NameService, 
        mapService: MapService,
        playerService: PlayerService,
        passwordService: PasswordService,
        conversationService: ConversationService, 
        historyService: HistoryService,
        achievementService: AchievementService,
        userService: UserService,
        gameCreateValidationService: GameCreateValidationService,
        gameFluxService: GameFluxService,
        specialistBanService: SpecialistBanService,
        specialStarBanService: SpecialStarBanService,
        gameTypeService: GameTypeService,
        starService: StarService,
        diplomacyService: DiplomacyService,
        teamService: TeamService,
        carrierService: CarrierService,
    ) {
        this.gameModel = gameModel;
        this.gameJoinService = gameJoinService;
        this.gameListService = gameListService;
        this.nameService = nameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.conversationService = conversationService;
        this.historyService = historyService;
        this.achievementService = achievementService;
        this.userService = userService;
        this.gameCreateValidationService = gameCreateValidationService;
        this.gameFluxService = gameFluxService;
        this.specialistBanService = specialistBanService;
        this.specialStarBanService = specialStarBanService;
        this.gameTypeService = gameTypeService;
        this.starService = starService;
        this.diplomacyService = diplomacyService;
        this.teamService = teamService;
        this.carrierService = carrierService;
    }

    async create(settings: GameSettings) {
        const isTutorial = settings.general.type === 'tutorial';
        const isNewPlayerGame = settings.general.type === 'new_player_rt' || settings.general.type === 'new_player_tb';
        const isOfficialGame = settings.general.createdByUserId == null;

        // If a legit user (not the system) created the game and it isn't a tutorial
        // then that game must be set as a custom game.
        if (settings.general.createdByUserId && !isTutorial) {
            settings.general.type = 'custom'; // All user games MUST be custom type.
            settings.general.timeMachine = 'disabled'; // Time machine is disabled for user created games.
            settings.general.featured = false // Stop any tricksters.

            // Prevent players from being able to create more than 1 game.
            let openGames = await this.gameListService.listOpenGamesCreatedByUser(settings.general.createdByUserId);
            let userIsGameMaster = await this.userService.getUserIsGameMaster(settings.general.createdByUserId);

            if (openGames.length && !userIsGameMaster) {
                throw new ValidationError('Cannot create game, you already have another game waiting for players.');
            }

            if (userIsGameMaster && openGames.length > 5) {
                throw new ValidationError('Game Masters are limited to 5 games waiting for players.');
            }

            // Validate that the player cannot create large games.
            if (settings.general.playerLimit > 16 && !userIsGameMaster) {
                throw new ValidationError(`Games larger than 16 players are reserved for official games or can be created by GMs.`);
            }

            let isEstablishedPlayer = await this.userService.isEstablishedPlayer(settings.general.createdByUserId);

            // Disallow new players from creating games if they haven't completed a game yet.
            if (!isEstablishedPlayer) {
                throw new ValidationError(`You must complete at least one game in order to create a custom game.`);
            }
        }
        
        if (settings.general.name.trim().length < 3 || settings.general.name.trim().length > 24) {
            throw new ValidationError('Game name must be between 3 and 24 characters.');
        }

        if (settings.general.password) {
            settings.general.password = await this.passwordService.hash(settings.general.password);
            settings.general.passwordRequired = true;
        }

        // Validate team conquest settings
        if (settings.general.mode === 'teamConquest') {
            const teamsCount = settings.conquest?.teamsCount;

            if (!teamsCount) {
                throw new ValidationError("Team count not provided");
            }

            const valid = Boolean(teamsCount &&
                settings.general.playerLimit >= 4 &&
                settings.general.playerLimit % teamsCount === 0);

            if (!valid) {
                throw new ValidationError(`The number of players must be larger than 3 and divisible by the number of teams.`);
            }

            if (settings.diplomacy?.enabled !== 'enabled') {
                throw new ValidationError('Diplomacy needs to be enabled for a team game.');
            }

            if (settings.diplomacy?.lockedAlliances !== 'enabled') {
                throw new ValidationError('Locked alliances needs to be enabled for a team game.');
            }

            if (settings.diplomacy?.maxAlliances !== (settings.general.playerLimit / teamsCount) - 1) {
                throw new ValidationError('Alliance limit too low for team size.');
            }
        }

        let game = new this.gameModel({
            settings
        }) as Game;

        // For non-custom galaxies we need to check that the player has actually provided
        // enough stars for each player.
        let desiredStarCount = game.settings.galaxy.starsPerPlayer * game.settings.general.playerLimit;
        let desiredPlayerStarCount = game.settings.player.startingStars * game.settings.general.playerLimit;

        if (desiredPlayerStarCount > desiredStarCount) {
            throw new ValidationError(`Cannot create a galaxy of ${desiredStarCount} stars with ${game.settings.player.startingStars} stars per player.`);
        }

        if (desiredStarCount > 1000) {
            throw new ValidationError(`Galaxy size cannot exceed 1000 stars.`);
        }

        // Ensure that c2c combat is disabled for orbital games.
        if (game.settings.orbitalMechanics.enabled === 'enabled' && game.settings.specialGalaxy.carrierToCarrierCombat === 'enabled') {
            game.settings.specialGalaxy.carrierToCarrierCombat = 'disabled';
        }

        // Ensure that specialist credits setting defaults token specific settings
        if (game.settings.specialGalaxy.specialistsCurrency === 'credits') {
            game.settings.player.startingCreditsSpecialists = 0;
            game.settings.player.tradeCreditsSpecialists = false;
            game.settings.technology.startingTechnologyLevel.specialists = 0;
            game.settings.technology.researchCosts.specialists = 'none';
        }

        // Ensure that specialist bans are cleared if specialists are disabled.
        if (game.settings.specialGalaxy.specialistCost === 'none') {
            game.settings.specialGalaxy.specialistBans = {
                star: [],
                carrier: []
            };
        }

        // Validate research costs
        if (game.settings.technology.researchCostProgression?.progression === 'standard') {
            game.settings.technology.researchCostProgression = {
                progression: 'standard',
            };
        } else if (game.settings.technology.researchCostProgression?.progression === 'exponential') {
            const growthFactor = game.settings.technology.researchCostProgression.growthFactor;

            if (growthFactor && growthFactor === 'soft' || growthFactor === 'medium' || growthFactor === 'hard') {
                game.settings.technology.researchCostProgression = {
                    progression: 'exponential',
                    growthFactor: growthFactor
                };
            } else {
                throw new ValidationError('Invalid growth factor for research cost progression.');
            }
        } else {
            throw new ValidationError('Invalid research cost progression.');
        }

        // Ensure that tick limited games have their ticks to end state preset
        if (game.settings.gameTime.isTickLimited === 'enabled') {
            game.state.ticksToEnd = game.settings.gameTime.tickLimit;
        } else {
            game.settings.gameTime.tickLimit = null;
            game.state.ticksToEnd = null;
        }

        if (game.settings.galaxy.galaxyType === 'custom') {
            game.settings.specialGalaxy.randomWarpGates = 0;
            game.settings.specialGalaxy.randomWormHoles = 0;
            game.settings.specialGalaxy.randomNebulas = 0;
            game.settings.specialGalaxy.randomAsteroidFields = 0;
            game.settings.specialGalaxy.randomBinaryStars = 0;
            game.settings.specialGalaxy.randomBlackHoles = 0;
            game.settings.specialGalaxy.randomPulsars = 0;
        }

        if (game.settings.general.readyToQuit === "enabled") {
            game.settings.general.readyToQuitFraction = game.settings.general.readyToQuitFraction || 1.0;
            game.settings.general.readyToQuitTimerCycles = game.settings.general.readyToQuitTimerCycles || 0;
        }

        // Clamp max alliances if its invalid (minimum of 1)
        let lockedAllianceMod = game.settings.diplomacy.lockedAlliances === 'enabled'
            && game.settings.general.playerLimit >= 3 ? 1 : 0;
        game.settings.diplomacy.maxAlliances = Math.max(1, Math.min(game.settings.diplomacy.maxAlliances, game.settings.general.playerLimit - 1 - lockedAllianceMod));

        if (game.settings.general.mode === 'teamConquest') {
            const teamsNumber = game.settings.conquest.teamsCount;

            if (!teamsNumber) {
                throw new ValidationError("Team count not provided");
            }

            game.settings.general.awardRankTo = 'teams';
            game.settings.general.awardRankToTopN = undefined;
        } else {
            // No reason to check rank awarding for team games.
            const awardRankTo = game.settings.general.awardRankTo;
            const awardRankToTopN = game.settings.general.awardRankToTopN;

            if (awardRankTo === 'top_n' && (!awardRankToTopN || awardRankToTopN < 1 || awardRankToTopN > Math.floor(game.settings.general.playerLimit / 2))) {
                throw new ValidationError('Invalid top N value for awarding rank.');
            } else if (!['all', 'winner', 'top_n'].includes(awardRankTo)) {
                throw new ValidationError('Invalid award rank to setting.');
            }
        }

        // If the game name contains a special string, then replace it with a random name.
        if (game.settings.general.name.indexOf(RANDOM_NAME_STRING) > -1) {
            let randomGameName = this.nameService.getRandomGameName();

            game.settings.general.name = game.settings.general.name.replace(RANDOM_NAME_STRING, randomGameName);
        }

        if (this.gameTypeService.isFluxGame(game)) {
            this.gameFluxService.applyCurrentFlux(game);
        }

        const canApplyBans = isOfficialGame && !isNewPlayerGame && !isTutorial;

        if (canApplyBans) {
            // Apply spec bans if applicable.
            if (game.settings.specialGalaxy.specialistCost !== 'none') {
                const banAmount = game.constants.specialists.monthlyBanAmount; // Random X specs of each type.

                const starBans = this.specialistBanService.getCurrentMonthStarBans(banAmount).map(s => s.id);
                const carrierBans = this.specialistBanService.getCurrentMonthCarrierBans(banAmount).map(s => s.id);

                // Append bans to any existing ones configured.
                game.settings.specialGalaxy.specialistBans = {
                    star: [...new Set(game.settings.specialGalaxy.specialistBans.star.concat(starBans))],
                    carrier: [...new Set(game.settings.specialGalaxy.specialistBans.carrier.concat(carrierBans))]
                };
            }

            // Apply special star bans
            const specialStarBans = this.specialStarBanService.getCurrentMonthBans().specialStar;

            for (let specialStarBan of specialStarBans) {
                if (game.settings.specialGalaxy[specialStarBan.id] != null) {
                    game.settings.specialGalaxy[specialStarBan.id] = 0;
                }
            }
        }

        // Create all of the stars required.
        game.galaxy.homeStars = [];
        game.galaxy.linkedStars = [];

        let starGeneration = this.mapService.generateStars(
            game, 
            desiredStarCount,
            game.settings.general.playerLimit,
            settings.galaxy.customJSON
        );

        game.galaxy.stars = starGeneration.stars;
        game.galaxy.homeStars = starGeneration.homeStars;
        game.galaxy.linkedStars = starGeneration.linkedStars;

        this.starService.setupStarsForGameStart(game);
        
        // Setup players and assign to their starting positions.
        this.playerService.setupEmptyPlayers(game);

        // Create carriers in custom galaxies
        let isCustomGalaxy = game.settings.galaxy.galaxyType === 'custom';
        if (isCustomGalaxy) {
            let carriers: any[] = [];
            let json;
            try {
                json = JSON.parse(settings.galaxy.customJSON!);
            } catch (e) {
                throw new ValidationError('The custom map JSON is malformed.');
            }

            for (const carrier of json.carriers) {
                carrier.orbiting = carrier.orbiting == null ? null : +carrier.orbiting;
                carrier.specialistId = carrier.specialistId == null ? null : +carrier.specialistId;
                carrier.specialistExpireTick = carrier.specialistExpireTick == null ? null : +carrier.specialistExpireTick;
                carrier.isGift = carrier.isGift == null ? false : carrier.isGift;

                this._checkCarrierProperty(carrier, 'orbiting', 'number', false);
                this._checkCarrierProperty(carrier, 'specialistId', 'number', true);
                this._checkCarrierProperty(carrier, 'specialistExpireTick', 'number', true);
                this._checkCarrierProperty(carrier, 'isGift', 'boolean', true);
                this._checkCarrierProperty(carrier, 'ships', 'number', false);
                this._checkCarrierProperty(carrier, 'specialistId', 'number', true);

                let starId = (starGeneration.starLocations.find((loc) => loc.id === carrier.orbiting))._id;
                let star = this.starService.getById(game, starId);
                let name = this.carrierService.generateCarrierName(star, carriers);

                let newCarrier: Carrier = {
                    _id: mongoose.Types.ObjectId(),
                    ownedByPlayerId: star.ownedByPlayerId,
                    orbiting: star._id,
                    name,
                    ships: carrier.ships,
                    specialistId: carrier.specialistId,
                    specialistExpireTick: carrier.specialistExpireTick,
                    isGift: carrier.isGift,
                    waypoints: [],
                    locationNext: null,
                    waypointsLooped: false,
                    specialist: null,
                    location: star.location,
                    toObject(): Carrier {
                        return this;
                    }
                };
                carriers.push(newCarrier);
            }
            game.galaxy.carriers = carriers;
        } else {
            game.galaxy.carriers = this.playerService.createHomeStarCarriers(game);
        }

        this.mapService.generateTerrain(game);

        // Calculate how many stars we have and how many are required for victory.
        game.state.stars = game.galaxy.stars.length;
        game.state.starsForVictory = this._calculateStarsForVictory(game);

        this._setGalaxyCenter(game);

        if (isTutorial) {
            this._setupTutorialPlayers(game);
        } else {
            this.conversationService.createConversationAllPlayers(game);
        }

        await this.teamService.setDiplomacyStates(game);

        this.gameCreateValidationService.validate(game);

        let gameObject = await game.save();

        // TODO: This is a bit more complicated as we need to update the history
        // for the very first tick when players join the game. The galaxy masking
        // should only be applied for stars and carriers if its the very first tick.
        // await this.historyService.log(gameObject);
        // ^ Maybe fire an event for the historyService to capture?
        
        return gameObject;
    }

    _setGalaxyCenter(game: Game) {
        const starLocations = game.galaxy.stars.map(s => s.location);

        game.constants.distances.galaxyCenterLocation = this.mapService.getGalaxyCenter(starLocations);
    }

    _calculateStarsForVictory(game: Game) {
        if (game.settings.general.mode === 'conquest' || game.settings.general.mode === 'teamConquest') {
            // TODO: Find a better place for this as its shared in the star service.
            switch (game.settings.conquest.victoryCondition) {
                case 'starPercentage':
                    return Math.ceil((game.state.stars / 100) * game.settings.conquest.victoryPercentage);
                case 'homeStarPercentage':
                    return Math.max(2, Math.ceil((game.settings.general.playerLimit / 100) * game.settings.conquest.victoryPercentage)); // At least 2 home stars needed to win.
                default:
                    throw new Error(`Unsupported conquest victory condition: ${game.settings.conquest.victoryCondition}`);
            }
        }

        // game.settings.conquest.victoryCondition = 'starPercentage'; // TODO: Default to starPercentage if not in conquest mode?

        return game.galaxy.stars.length;
    }

    _setupTutorialPlayers(game: Game) {
        // Dump the player who created the game straight into the first slot and set the other slots to AI.
        this.gameJoinService.assignPlayerToUser(game, game.galaxy.players[0], game.settings.general.createdByUserId!, `Player`, 0);
        this.gameJoinService.assignNonUserPlayersToAI(game);
    }

    _checkCarrierProperty(carrier, property: string, type: string, allowNull: boolean): boolean {
        if (carrier === undefined) throw new ValidationError(`Missing property of carrier ${carrier}`);
        if (carrier?.[property] === undefined) throw new ValidationError(`Missing property ${property} of carrier ${JSON.stringify(carrier)}`);

        if (allowNull && carrier[property] === null) {
          return true;
        }

        if (typeof carrier[property] !== type) throw new ValidationError(`Invalid type property ${property} of carrier ${JSON.stringify(carrier)}`);

        return true;
    }
}
