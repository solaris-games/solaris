const bcrypt = require('bcrypt');

import GameModel from '../models/Game';
import UserModel from '../models/User';
import HistoryModel from '../models/History';
import EventModel from '../models/Event';
import GuildModel from '../models/Guild';
import PaymentModel from '../models/Payment';
import ReportModel from '../models/Report';

import AdminService from '../services/admin';
import PasswordService from '../services/password';
import AuthService from '../services/auth';
import BroadcastService from '../services/broadcast';
import CarrierService from '../services/carrier';
import CombatService from '../services/combat';
import DistanceService from '../services/distance';
import EmailService from '../services/email';
import EventService from '../services/event';
import LeaderboardService from '../services/leaderboard';
import GameService from '../services/game';
import GameCreateValidationService from '../services/gameCreateValidation';
import GameCreateService from '../services/gameCreate';
import GameGalaxyService from '../services/gameGalaxy';
import GameListService from '../services/gameList';
import GameTickService from '../services/gameTick';
import GameTypeService from '../services/gameType';
import GameStateService from '../services/gameState';
import BattleRoyaleService from '../services/battleRoyale';
import MapService from '../services/map';
import PlayerService from '../services/player';
import PlayerReadyService from '../services/playerReady';
import RandomService from '../services/random';
import ResearchService from '../services/research';
import StarService from '../services/star';
import StarDistanceService from '../services/starDistance';
import NameService from '../services/name';
import StarUpgradeService from '../services/starUpgrade';
import TechnologyService from '../services/technology';
import TradeService from '../services/trade';
import WaypointService from '../services/waypoint';
import ShipTransferService from '../services/shipTransfer';
import UserService from '../services/user';
import HistoryService from '../services/history';
import LedgerService from '../services/ledger';
import SpecialistService from '../services/specialist';
import SpecialistBanService from '../services/specialistBan';
import SpecialistHireService from '../services/specialistHire';
import AchievementService from '../services/achievement';
import ConversationService from '../services/conversation';
import ReputationService from '../services/reputation';
import AIService from '../services/ai';
import GuildService from '../services/guild';
import GuildUserService from '../services/guildUser';
import OrbitalMechanicsService from '../services/orbitalMechanics';
import CacheService from '../services/cache';
import RecaptchaService from '../services/recaptcha';
import RatingService from '../services/rating';
import DonateService from '../services/donate';
import DiplomacyService from '../services/diplomacy';
import AvatarService from '../services/avatar';
import PaypalService from '../services/paypal';
import BadgeService from '../services/badge';
import ReportService from '../services/report';
import ResourceService from '../services/resource';
import CircularMapService from '../services/maps/circular';
import CircularBalancedMapService from '../services/maps/circularBalanced';
import SpiralMapService from '../services/maps/spiral';
import DoughnutMapService from '../services/maps/doughnut';
import IrregularMapService from '../services/maps/irregular';
import CustomMapService from '../services/maps/custom';
import DiplomacyUpkeepService from '../services/diplomacyUpkeep';
import PlayerCreditsService from '../services/playerCredits';
import PlayerStatisticsService from '../services/playerStatistics';
import CarrierMovementService from '../services/carrierMovement';
import CarrierGiftService from '../services/carrierGift';
import PlayerCycleRewardsService from '../services/playerCycleRewards';
import StarContestedService from '../services/starContested';
import GameFluxService from '../services/gameFlux';

import { DependencyContainer } from '../types/DependencyContainer';

import DatabaseRepository from '../models/DatabaseRepository';
import { Game } from '../types/Game';
import { User } from '../types/User';
import { GameHistory } from '../types/GameHistory';
import { GameEvent } from '../types/GameEvent';
import { Guild } from '../types/Guild';
import { Payment } from '../types/Payment';
import { Report } from '../types/Report';

const gameNames = require('../config/game/gameNames');
const starNames = require('../config/game/starNames');

const gameRepository = new DatabaseRepository<Game>(GameModel);
const userRepository = new DatabaseRepository<User>(UserModel);
const historyRepository = new DatabaseRepository<GameHistory>(HistoryModel);
const eventRepository = new DatabaseRepository<GameEvent>(EventModel);
const guildRepository = new DatabaseRepository<Guild>(GuildModel);
const paymentRepository = new DatabaseRepository<Payment>(PaymentModel);
const reportRepository = new DatabaseRepository<Report>(ReportModel);

export default (config, io): DependencyContainer => {

    // Poor man's dependency injection.

    const passwordService = new PasswordService(bcrypt);

    const authService = new AuthService(userRepository, passwordService);
    const userService = new UserService(UserModel, userRepository, passwordService);
    const adminService = new AdminService(userRepository, gameRepository);
    const recaptchaService = new RecaptchaService();

    const guildService = new GuildService(GuildModel, guildRepository, userRepository, userService);
    const guildUserService = new GuildUserService(userRepository, guildService);

    const broadcastService = new BroadcastService(io);
    const distanceService = new DistanceService();
    const randomService = new RandomService();
    const cacheService = new CacheService();
    const paypalService = new PaypalService(PaymentModel, paymentRepository, userService, cacheService);
    const specialistService = new SpecialistService();
    const gameTypeService = new GameTypeService();
    const gameStateService = new GameStateService();
    const gameFluxService = new GameFluxService();
    const playerCreditsService = new PlayerCreditsService(gameRepository);
    const avatarService = new AvatarService(userRepository, userService);
    const achievementService = new AchievementService(userRepository, guildService);
    const ratingService = new RatingService(userRepository, gameRepository, userService);
    const nameService = new NameService(gameNames, starNames, randomService);
    const starDistanceService = new StarDistanceService(distanceService);
    const technologyService = new TechnologyService(specialistService);
    const starService = new StarService(gameRepository, randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService, gameTypeService, gameStateService);
    const carrierService = new CarrierService(gameRepository, distanceService, starService, technologyService, specialistService);
    const playerStatisticsService = new PlayerStatisticsService(starService, carrierService, technologyService, specialistService);
    const playerCycleRewardsService = new PlayerCycleRewardsService(starService, technologyService, playerStatisticsService);
    const diplomacyUpkeepService = new DiplomacyUpkeepService(playerCreditsService, playerCycleRewardsService);
    const diplomacyService = new DiplomacyService(gameRepository, diplomacyUpkeepService);
    const starContestedService = new StarContestedService(diplomacyService);
    const carrierGiftService = new CarrierGiftService(gameRepository, diplomacyService);
    const carrierMovementService = new CarrierMovementService(gameRepository, distanceService, starService, specialistService, diplomacyService, carrierGiftService);
    const resourceService = new ResourceService(randomService, distanceService, starDistanceService, gameTypeService);
    const circularMapService = new CircularMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const circularBalancedMapService = new CircularBalancedMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const spiralMapService = new SpiralMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const doughnutMapService = new DoughnutMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const irregularMapService = new IrregularMapService(randomService, starService, starDistanceService, distanceService, resourceService, gameTypeService);
    const customMapService = new CustomMapService();
    const mapService = new MapService(randomService, starService, starDistanceService, nameService, circularMapService, spiralMapService, doughnutMapService, circularBalancedMapService, irregularMapService, gameTypeService, customMapService);
    const playerReadyService = new PlayerReadyService(gameRepository, gameTypeService);
    const playerService = new PlayerService(gameRepository, randomService, mapService, starService, carrierService, starDistanceService, technologyService, specialistService, gameTypeService, playerReadyService);
    const badgeService = new BadgeService(userRepository, userService, playerService);
    const reportService = new ReportService(ReportModel, reportRepository, playerService);
    const ledgerService = new LedgerService(gameRepository, playerService, playerCreditsService);
    const reputationService = new ReputationService(gameRepository, playerStatisticsService, diplomacyService);
    const tradeService = new TradeService(gameRepository, eventRepository, userService, playerService, diplomacyService, ledgerService, achievementService, reputationService, gameTypeService, randomService, playerCreditsService);
    const conversationService = new ConversationService(gameRepository, tradeService);
    const gameService = new GameService(gameRepository, userService, starService, carrierService, playerService, passwordService, achievementService, avatarService, gameTypeService, gameStateService, conversationService, playerReadyService);
    const leaderboardService = new LeaderboardService(userRepository, userService, playerService, guildUserService, ratingService, gameService, gameTypeService, gameStateService, badgeService, playerStatisticsService);
    const researchService = new ResearchService(gameRepository, technologyService, randomService, playerStatisticsService, starService, userService, gameTypeService);
    const combatService = new CombatService(technologyService, specialistService, playerService, starService, reputationService, diplomacyService, gameTypeService);
    const waypointService = new WaypointService(gameRepository, carrierService, starService, distanceService, starDistanceService, technologyService, gameService, playerService, carrierMovementService);
    const specialistBanService = new SpecialistBanService(specialistService);
    const specialistHireService = new SpecialistHireService(gameRepository, specialistService, achievementService, waypointService, playerCreditsService, starService, gameTypeService, specialistBanService);
    const starUpgradeService = new StarUpgradeService(gameRepository, starService, carrierService, achievementService, researchService, technologyService, playerCreditsService, gameTypeService);
    const shipTransferService = new ShipTransferService(gameRepository, carrierService, starService);
    const aiService = new AIService(starUpgradeService, carrierService, starService, distanceService, waypointService, combatService, shipTransferService, technologyService, playerService, reputationService, diplomacyService, playerStatisticsService);
    const historyService = new HistoryService(historyRepository, playerService, gameService, playerStatisticsService);
    const battleRoyaleService = new BattleRoyaleService(starService, carrierService, mapService, starDistanceService, waypointService, carrierMovementService);
    const orbitalMechanicsService = new OrbitalMechanicsService(mapService);
    const gameGalaxyService = new GameGalaxyService(cacheService, broadcastService, gameService, mapService, playerService, starService, distanceService, starDistanceService, starUpgradeService, carrierService, waypointService, researchService, specialistService, technologyService, reputationService, guildUserService, historyService, battleRoyaleService, orbitalMechanicsService, gameTypeService, gameStateService, diplomacyService, avatarService, playerStatisticsService, gameFluxService);
    const gameTickService = new GameTickService(distanceService, starService, carrierService, researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService, gameService, technologyService, specialistService, starUpgradeService, reputationService, aiService, battleRoyaleService, orbitalMechanicsService, diplomacyService, gameTypeService, gameStateService, playerCycleRewardsService, diplomacyUpkeepService, carrierMovementService, carrierGiftService, starContestedService, playerReadyService);
    const emailService = new EmailService(config, gameService, userService, leaderboardService, playerService, gameTypeService, gameStateService, gameTickService);
    const donateService = new DonateService(cacheService);

    const eventService = new EventService(EventModel, eventRepository, broadcastService, gameService, gameTickService, researchService, starService, starUpgradeService, tradeService,
        ledgerService, conversationService, combatService, specialistService, badgeService, carrierGiftService, diplomacyService);

    const gameListService = new GameListService(gameRepository, gameService, conversationService, eventService, gameTypeService);
    const gameCreateValidationService = new GameCreateValidationService(playerService, starService, carrierService, specialistService, gameTypeService);
    const gameCreateService = new GameCreateService(GameModel, gameService, gameListService, nameService, mapService, playerService, passwordService, conversationService, historyService, achievementService, userService, gameCreateValidationService, gameFluxService, specialistBanService, gameTypeService);

    console.log('Dependency Container Initialized');
    
    return {
        adminService,
        passwordService,
        authService,
        broadcastService,
        carrierService,
        combatService,
        distanceService,
        emailService,
        eventService,
        leaderboardService,
        gameService,
        gameCreateValidationService,
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
        achievementService,
        conversationService,
        reputationService,
        aiService,
        battleRoyaleService,
        orbitalMechanicsService,
        cacheService,
        recaptchaService,
        ratingService,
        donateService,
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
        starContestedService,
        gameFluxService,
    };
};
