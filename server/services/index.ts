import GameAuthService from "./gameAuth";

const bcrypt = require('bcrypt');

import GameModel from '../db/models/Game';
import UserModel from '../db/models/User';
import HistoryModel from '../db/models/History';
import EventModel from '../db/models/Event';
import GuildModel from '../db/models/Guild';
import PaymentModel from '../db/models/Payment';
import ReportModel from '../db/models/Report';
import AnnouncementModel from '../db/models/Announcement';
import InitialGameStateModel from '../db/models/InitialGameState';

import AdminService from './admin';
import PasswordService from './password';
import AuthService from './auth';
import BroadcastService from './broadcast';
import CarrierService from './carrier';
import CombatService from './combat';
import DistanceService from './distance';
import EmailService from './email';
import EventService from './event';
import LeaderboardService from './leaderboard';
import GameService from './game';
import GameJoinService from './gameJoin';
import GameCreateService from './gameCreate';
import GameGalaxyService from './gameGalaxy';
import GameListService from './gameList';
import GameTickService from './gameTick';
import GameTypeService from './gameType';
import GameStateService from './gameState';
import BattleRoyaleService from './battleRoyale';
import MapService from './map';
import PlayerService from './player';
import PlayerAfkService from './playerAfk';
import UserLevelService from './userLevel';
import PlayerReadyService from './playerReady';
import RandomService from './random';
import ResearchService from './research';
import StarService from './star';
import StarDistanceService from './starDistance';
import NameService from './name';
import StarUpgradeService from './starUpgrade';
import TechnologyService from './technology';
import TradeService from './trade';
import WaypointService from './waypoint';
import ShipTransferService from './shipTransfer';
import UserService from './user';
import HistoryService from './history';
import LedgerService from './ledger';
import SpecialistService from './specialist';
import SpecialistBanService from './specialistBan';
import SpecialistHireService from './specialistHire';
import SpecialStarBanService from './specialStarBan';
import UserAchievementService from './userAchievement';
import ConversationService from './conversation';
import ReputationService from './reputation';
import BasicAIService from "./basicAi";
import AIService from './ai';
import GuildService from './guild';
import GuildUserService from './guildUser';
import StarMovementService from './starMovement';
import CacheService from './cache';
import RatingService from './rating';
import DiplomacyService from './diplomacy';
import AvatarService from './avatar';
import PaypalService from './paypal';
import BadgeService from './badge';
import ReportService from './report';
import ResourceService from './resource';
import CircularMapService from './maps/circular';
import CircularBalancedMapService from './maps/circularBalanced';
import SpiralMapService from './maps/spiral';
import DoughnutMapService from './maps/doughnut';
import IrregularMapService from './maps/irregular';
import DiplomacyUpkeepService from './diplomacyUpkeep';
import PlayerCreditsService from './playerCredits';
import PlayerStatisticsService from './playerStatistics';
import CarrierMovementService from './carrierMovement';
import CarrierGiftService from './carrierGift';
import PlayerCycleRewardsService from './playerCycleRewards';
import StarContestedService from './starContested';
import GameFluxService from './gameFlux';
import NotificationService from './notification';
import DiscordService from './discord';
import ShipService from './ship';
import SpectatorService from './spectator';
import ScheduleBuyService from './scheduleBuy';
import PathfindingService from "./pathfinding";

import { DependencyContainer } from './types/DependencyContainer';

import Repository from './repository';
import { Game } from './types/Game';
import { User } from './types/User';
import { GameHistory } from './types/GameHistory';
import { GameEvent } from './types/GameEvent';
import { Guild } from './types/Guild';
import { Payment } from './types/Payment';
import { Report } from './types/Report';
import TeamService from "./team";
import UserLeaderboardService from './userLeaderboard';
import GameLockService from "./gameLock";
import TutorialService from './tutorial';
import GamePlayerMutexService from './gamePlayerMutex';
import GameMutexService from "./gameMutex";
import AnnouncementService from "./announcement";
import {Announcement} from "./types/Announcement";
import PlayerColourService from "./playerColour";
import GameMaskingService from "./gameMaskingService";
import SessionService from "./session";
import {logger} from "../utils/logging";
import { Config } from "../config/types/Config";
import { Server } from "socket.io";
import { GameServerSocketEmitter } from "../sockets/socketEmitters/game";
import { PlayerServerSocketEmitter } from "../sockets/socketEmitters/player";
import { DiplomacyServerSocketEmitter } from "../sockets/socketEmitters/diplomacy";
import { ServerHandler } from "../sockets/socketHandlers/serverHandler";
import { PlayerServerSocketHandler } from "../sockets/socketHandlers/player";
import { UserServerSocketHandler } from "../sockets/socketHandlers/user";
import { Logger } from "pino";
import SocketService from "./socket";
import StarCaptureService from "./starCapture";
import {UserServerSocketEmitter} from "../sockets/socketEmitters/user";
import StatsSliceModel from "../db/models/StatsSlice";
import type {StatsSlice} from "solaris-common";
import {DBObjectId} from "./types/DBObjectId";
import StatisticsService from "./statistics";
import CustomGalaxyService from "./customGalaxy";
import {InitialGameState} from "./types/InitialGameState";
import InitialGameStateService from "./initialGameState";

const gameNames = require('../config/game/gameNames');
const starNames = require('../config/game/starNames');

const log = logger("Dependency Container");

const gameRepository = new Repository<Game>(GameModel);
const userRepository = new Repository<User>(UserModel);
const historyRepository = new Repository<GameHistory>(HistoryModel);
const eventRepository = new Repository<GameEvent>(EventModel);
const guildRepository = new Repository<Guild>(GuildModel);
const paymentRepository = new Repository<Payment>(PaymentModel);
const reportRepository = new Repository<Report>(ReportModel);
const announcementRepository = new Repository<Announcement>(AnnouncementModel);
const statsSliceRepository = new Repository<StatsSlice<DBObjectId>>(StatsSliceModel);
const initialGameStateRepository = new Repository<InitialGameState>(InitialGameStateModel);

export default (config: Config,
                socketServer: Server,
                logger: Logger): DependencyContainer => {

    // Poor man's dependency injection.

    const passwordService = new PasswordService(bcrypt);

    const userLevelService = new UserLevelService();
    const authService = new AuthService(userRepository, passwordService);
    const discordService = new DiscordService(config, userRepository);
    const sessionService = new SessionService(userRepository);
    const userService = new UserService(UserModel, userRepository, passwordService, sessionService);
    const adminService = new AdminService(userRepository, gameRepository, sessionService);
    const specialStarBanService = new SpecialStarBanService();

    const guildService = new GuildService(GuildModel, guildRepository, userRepository, userService, sessionService);
    const guildUserService = new GuildUserService(userRepository, guildService);

    const announcementService = new AnnouncementService(AnnouncementModel, announcementRepository, userService);

    const statisticsService = new StatisticsService(statsSliceRepository, userService);

    const initialGameStateService = new InitialGameStateService(initialGameStateRepository);

    const gameMaskingService = new GameMaskingService();
    const gameLockService = new GameLockService(gameRepository);
    const distanceService = new DistanceService();
    const randomService = new RandomService();
    const cacheService = new CacheService(config);
    const paypalService = new PaypalService(PaymentModel, config, paymentRepository, userService, cacheService);
    const gameTypeService = new GameTypeService();
    const playerColourService = new PlayerColourService(randomService);
    const specialistService = new SpecialistService(gameTypeService);
    const gameStateService = new GameStateService();
    const gameFluxService = new GameFluxService();
    const playerCreditsService = new PlayerCreditsService(gameRepository);
    const avatarService = new AvatarService(userRepository, userService, sessionService);
    const socketService = new SocketService(config, socketServer);
    const gameServerSocketEmitter = new GameServerSocketEmitter(socketServer);
    const playerServerSocketEmitter = new PlayerServerSocketEmitter(socketServer);
    const diplomacyServerSocketEmitter = new DiplomacyServerSocketEmitter(socketServer);
    const userServerSocketEmitter = new UserServerSocketEmitter(socketServer);
    const broadcastService = new BroadcastService(gameServerSocketEmitter, playerServerSocketEmitter, diplomacyServerSocketEmitter, userServerSocketEmitter, avatarService);
    const userAchievementService = new UserAchievementService(userRepository, guildService, userLevelService);
    const ratingService = new RatingService(userRepository, gameRepository, userService);
    const nameService = new NameService(gameNames, starNames, randomService);
    const starDistanceService = new StarDistanceService(distanceService);
    const technologyService = new TechnologyService(specialistService, gameTypeService);
    const starService = new StarService(gameRepository, randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService, gameTypeService, gameStateService, statisticsService);
    const carrierService = new CarrierService(gameRepository, distanceService, starService, technologyService, specialistService);
    const shipService = new ShipService(starService, technologyService, carrierService);
    const playerStatisticsService = new PlayerStatisticsService(starService, carrierService, technologyService, specialistService, shipService);
    const playerCycleRewardsService = new PlayerCycleRewardsService(starService, technologyService, playerStatisticsService, specialistService);
    const diplomacyUpkeepService = new DiplomacyUpkeepService(playerCreditsService, playerCycleRewardsService);
    const diplomacyService = new DiplomacyService(gameRepository, eventRepository, diplomacyUpkeepService)
    const researchService = new ResearchService(gameRepository, technologyService, randomService, playerStatisticsService, starService, userService, gameTypeService, statisticsService);
    const starUpgradeService = new StarUpgradeService(gameRepository, starService, carrierService, userAchievementService, researchService, technologyService, playerCreditsService, gameTypeService, shipService, statisticsService);
    const starCaptureService = new StarCaptureService(specialistService, starService, gameTypeService, gameStateService, diplomacyService, technologyService, starUpgradeService, statisticsService);
    const starContestedService = new StarContestedService(diplomacyService);
    const carrierGiftService = new CarrierGiftService(gameRepository, diplomacyService, statisticsService);
    const carrierMovementService = new CarrierMovementService(gameRepository, distanceService, starService, specialistService, diplomacyService, carrierGiftService, technologyService, starDistanceService);
    const resourceService = new ResourceService(randomService, distanceService, starDistanceService, gameTypeService);
    const circularMapService = new CircularMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const circularBalancedMapService = new CircularBalancedMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const spiralMapService = new SpiralMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const doughnutMapService = new DoughnutMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const irregularMapService = new IrregularMapService(starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const mapService = new MapService(randomService, starService, starDistanceService, nameService, circularMapService, spiralMapService, doughnutMapService, circularBalancedMapService, irregularMapService, gameTypeService);
    const playerReadyService = new PlayerReadyService(gameRepository, gameTypeService);
    const teamService = new TeamService(diplomacyService);
    const playerService = new PlayerService(gameRepository, randomService, mapService, starService, carrierService, starDistanceService, technologyService, specialistService, gameTypeService, playerReadyService, teamService, playerColourService);
    const spectatorService = new SpectatorService(gameRepository, playerService, userService);
    const playerAfkService = new PlayerAfkService(gameRepository, playerService, starService, carrierService, gameTypeService, gameStateService);
    const badgeService = new BadgeService(userRepository, userService, playerService, gameTypeService, gameStateService);
    const ledgerService = new LedgerService(gameRepository, playerService, playerCreditsService);
    const reputationService = new ReputationService(gameRepository, playerStatisticsService, diplomacyService, playerAfkService);
    const tradeService = new TradeService(gameRepository, eventRepository, userService, playerService, diplomacyService, ledgerService, userAchievementService, reputationService, gameTypeService, randomService, playerCreditsService, playerAfkService, statisticsService);
    const conversationService = new ConversationService(gameRepository, tradeService, diplomacyService, broadcastService);
    const gameAuthService = new GameAuthService(userService);
    const gameJoinService = new GameJoinService(userService, starService, playerService, passwordService, userAchievementService, avatarService, gameTypeService, gameStateService, conversationService, randomService, spectatorService);
    const gameService = new GameService(gameRepository, userService, starService, carrierService, playerService, passwordService, userAchievementService, avatarService, gameTypeService, gameStateService, conversationService, playerReadyService, gameJoinService, gameAuthService, playerAfkService);
    const serverHandler = new ServerHandler(socketServer, logger);
    const playerServerSocketHandler = new PlayerServerSocketHandler(socketService, gameService, serverHandler);
    const userServerSocketHandler = new UserServerSocketHandler(socketService, serverHandler);
    const leaderboardService = new LeaderboardService(playerService, playerAfkService, userLevelService, ratingService, gameService, gameTypeService, gameStateService, badgeService, playerStatisticsService, teamService);
    const userLeaderboardService = new UserLeaderboardService(userRepository, guildUserService);
    const combatService = new CombatService(technologyService, specialistService, playerService, starService, reputationService, diplomacyService, gameTypeService, starCaptureService, statisticsService);
    const historyService = new HistoryService(historyRepository, playerService, gameService, playerStatisticsService, gameStateService);
    const waypointService = new WaypointService(gameRepository, carrierService, starService, distanceService, starDistanceService, technologyService, gameService, playerService, carrierMovementService, gameMaskingService, historyService);
    const specialistBanService = new SpecialistBanService(specialistService);
    const specialistHireService = new SpecialistHireService(gameRepository, specialistService, userAchievementService, waypointService, playerCreditsService, starService, gameTypeService, specialistBanService, technologyService, statisticsService);
    const shipTransferService = new ShipTransferService(gameRepository, carrierService, starService);
    const pathfindingService = new PathfindingService(distanceService, starService, waypointService);
    const basicAIService = new BasicAIService(starUpgradeService);
    const aiService = new AIService(starUpgradeService, carrierService, starService, distanceService, waypointService, combatService, shipTransferService, technologyService, playerService, playerAfkService, reputationService, diplomacyService, shipService, playerStatisticsService, basicAIService, pathfindingService);
    const battleRoyaleService = new BattleRoyaleService(starService, carrierService, mapService, starDistanceService, waypointService, carrierMovementService);
    const starMovementService = new StarMovementService(mapService, starDistanceService, specialistService, waypointService);
    const gameGalaxyService = new GameGalaxyService(cacheService, socketService, gameService, mapService, playerService, playerAfkService, starService, shipService, distanceService, starDistanceService, starUpgradeService, carrierService, waypointService, researchService, specialistService, technologyService, reputationService, guildUserService, historyService, battleRoyaleService, starMovementService, gameTypeService, gameStateService, diplomacyService, avatarService, playerStatisticsService, gameFluxService, spectatorService, gameMaskingService);
    const scheduleBuyService = new ScheduleBuyService(gameRepository, starUpgradeService);
    const gameTickService = new GameTickService(distanceService, starService, carrierService, researchService, playerService, playerAfkService, historyService, waypointService, combatService, leaderboardService, userService, gameService, technologyService, specialistService, starUpgradeService, reputationService, aiService, battleRoyaleService, starMovementService, diplomacyService, gameTypeService, gameStateService, playerCycleRewardsService, diplomacyUpkeepService, carrierMovementService, carrierGiftService, starContestedService, playerReadyService, shipService, scheduleBuyService, gameLockService, statisticsService);
    const emailService = new EmailService(config, gameService, gameJoinService, userService, leaderboardService, playerService, playerReadyService, gameTypeService, gameStateService, gameTickService);
    const eventService = new EventService(EventModel, eventRepository, broadcastService, gameService, gameJoinService, gameTickService, researchService, starService, starUpgradeService, tradeService,
        ledgerService, conversationService, combatService, specialistService, badgeService, carrierGiftService, diplomacyService);

    const gameListService = new GameListService(gameRepository, gameService, conversationService, eventService, gameTypeService, leaderboardService);
    const customGalaxyService = new CustomGalaxyService(nameService, specialistService, playerService, playerColourService, teamService, carrierService);
    const gameCreateService = new GameCreateService(GameModel, gameJoinService, gameListService, nameService, mapService, playerService, passwordService, conversationService, historyService, userAchievementService, userService, gameFluxService, specialistBanService, specialStarBanService, gameTypeService, starService, diplomacyService, teamService, carrierService, starDistanceService, customGalaxyService, initialGameStateService);

    const reportService = new ReportService(ReportModel, reportRepository, playerService, conversationService, userService, gameListService, gameService);

    const notificationService = new NotificationService(config, userRepository, gameRepository, discordService, conversationService, gameService, gameJoinService, gameTickService, researchService, tradeService, playerReadyService, gameTypeService, gameStateService);
    const tutorialService = new TutorialService(userService);

    const gamePlayerMutexService = new GamePlayerMutexService();

    const gameMutexService = new GameMutexService();

    log.info('Dependency container initialized.');

    return {
        config,
        announcementService,
        adminService,
        passwordService,
        authService,
        discordService,
        socketService,
        gameServerSocketEmitter,
        playerServerSocketEmitter,
        diplomacyServerSocketEmitter,
        userServerSocketEmitter,
        broadcastService,
        carrierService,
        combatService,
        distanceService,
        emailService,
        eventService,
        leaderboardService,
        userLeaderboardService,
        gameService,
        serverHandler,
        playerServerSocketHandler,
        userServerSocketHandler,
        gameAuthService,
        gameLockService,
        gameJoinService,
        gameCreateService,
        gameGalaxyService,
        gameListService,
        gameTickService,
        gameTypeService,
        gameStateService,
        guildService,
        guildUserService,
        mapService,
        playerService,
        playerAfkService,
        userLevelService,
        playerReadyService,
        randomService,
        researchService,
        starService,
        starDistanceService,
        nameService,
        starUpgradeService,
        technologyService,
        tradeService,
        userService,
        waypointService,
        shipTransferService,
        historyService,
        ledgerService,
        specialistService,
        specialistBanService,
        specialistHireService,
        specialStarBanService,
        userAchievementService,
        conversationService,
        reputationService,
        basicAIService,
        aiService,
        battleRoyaleService,
        starMovementService,
        cacheService,
        ratingService,
        diplomacyService,
        avatarService,
        paypalService,
        badgeService,
        reportService,
        playerStatisticsService,
        playerCreditsService,
        diplomacyUpkeepService,
        carrierGiftService,
        carrierMovementService,
        playerCycleRewardsService,
        gameMaskingService,
        starContestedService,
        gameFluxService,
        notificationService,
        shipService,
        spectatorService,
        scheduleBuyService,
        teamService,
        tutorialService,
        pathfindingService,
        gamePlayerMutexService,
        gameMutexService,
        playerColourService,
        sessionService,
        starCaptureService,
        statisticsService,
        initialGameStateService,
    };
};
