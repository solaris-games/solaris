const bcrypt = require('bcrypt');

const GameModel = require('../models/Game');
const UserModel = require('../models/User');
const HistoryModel = require('../models/History');
const EventModel = require('../models/Event');
const GuildModel = require('../models/Guild');
const DatabaseRepository = require('../models/DatabaseRepository');

const gameRepository = new DatabaseRepository(GameModel);
const userRepository = new DatabaseRepository(UserModel);
const historyRepository = new DatabaseRepository(HistoryModel);
const eventRepository = new DatabaseRepository(EventModel);
const guildRepository = new DatabaseRepository(GuildModel);

const AdminService = require('../services/admin');
const PasswordService = require('../services/password');
const AuthService = require('../services/auth');
const BroadcastService = require('../services/broadcast');
const CarrierService = require('../services/carrier');
const CombatService = require('../services/combat');
const DistanceService = require('../services/distance');
const EmailService = require('../services/email');
const EventService = require('../services/event');
const LeaderboardService = require('../services/leaderboard');
const GameService = require('../services/game');
const GameCreateService = require('../services/gameCreate');
const GameGalaxyService = require('../services/gameGalaxy');
const GameListService = require('../services/gameList');
const GameTickService = require('../services/gameTick');
const BattleRoyaleService = require('../services/battleRoyale');
const MapService = require('../services/map');
const PlayerService = require('../services/player');
const RandomService = require('../services/random');
const ResearchService = require('../services/research');
const StarService = require('../services/star');
const StarDistanceService = require('../services/starDistance');
const NameService = require('../services/name');
const StarUpgradeService = require('../services/starUpgrade');
const TechnologyService = require('../services/technology');
const TradeService = require('../services/trade');
const WaypointService = require('../services/waypoint');
const ShipTransferService = require('../services/shipTransfer');
const UserService = require('../services/user');
const HistoryService = require('../services/history');
const LedgerService = require('../services/ledger');
const SpecialistService = require('../services/specialist');
const SpecialistHireService = require('../services/specialistHire');
const AchievementService = require('../services/achievement');
const ConversationService = require('../services/conversation');
const ReputationService = require('../services/reputation');
const AIService = require('../services/ai');
const AITradeService = require('../services/aiTrade');
const GuildService = require('../services/guild');
const GuildUserService = require('../services/guildUser');
const OrbitalMechanicsService = require('../services/orbitalMechanics');
const CacheService = require('../services/cache');
const RecaptchaService = require('../services/recaptcha');
const RatingService = require('../services/rating');
const DonateService = require('../services/donate');
const DiplomacyService = require('../services/diplomacy');
const AvatarService = require('../services/avatar');

const CircularMapService = require('../services/maps/circular');
const CircularBalancedMapService = require('../services/maps/circularBalanced');
const SpiralMapService = require('../services/maps/spiral');
const DoughnutMapService = require('../services/maps/doughnut');
const IrregularMapService = require('../services/maps/irregular');

const gameNames = require('../config/game/gameNames');
const starNames = require('../config/game/starNames');

module.exports = (config, io) => {
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
    const specialistService = new SpecialistService();
    const diplomacyService = new DiplomacyService(gameRepository);
    const avatarService = new AvatarService(userRepository, userService);
    const conversationService = new ConversationService(gameRepository, eventRepository);
    const achievementService = new AchievementService(userRepository, guildService);
    const ratingService = new RatingService(userRepository, gameRepository, userService);
    const nameService = new NameService(gameNames, starNames, randomService);
    const starDistanceService = new StarDistanceService(distanceService);
    const technologyService = new TechnologyService(specialistService);
    const starService = new StarService(gameRepository, randomService, nameService, distanceService, starDistanceService, technologyService, specialistService, userService, diplomacyService);
    const carrierService = new CarrierService(gameRepository, achievementService, distanceService, starService, technologyService, specialistService, diplomacyService);
    const circularMapService = new CircularMapService(randomService, starService, starDistanceService, distanceService);
    const circularBalancedMapService = new CircularBalancedMapService(randomService, starService, starDistanceService, distanceService);
    const spiralMapService = new SpiralMapService(randomService, starService, starDistanceService, distanceService);
    const doughnutMapService = new DoughnutMapService(randomService, starService, starDistanceService, distanceService);
    const irregularMapService = new IrregularMapService(randomService, starService, starDistanceService, distanceService);
    const mapService = new MapService(randomService, starService, starDistanceService, nameService, circularMapService, spiralMapService, doughnutMapService, circularBalancedMapService, irregularMapService);
    const playerService = new PlayerService(gameRepository, randomService, mapService, starService, carrierService, starDistanceService, technologyService, specialistService);
    const ledgerService = new LedgerService(gameRepository, playerService);
    const gameService = new GameService(gameRepository, userService, starService, carrierService, playerService, passwordService, achievementService, avatarService);
    const leaderboardService = new LeaderboardService(userRepository, userService, playerService, guildUserService, ratingService, gameService);
    const researchService = new ResearchService(gameRepository, technologyService, randomService, playerService, starService, userService);
    const reputationService = new ReputationService(gameRepository, playerService);
    const combatService = new CombatService(technologyService, specialistService, playerService, starService, reputationService, diplomacyService);
    const tradeService = new TradeService(gameRepository, userService, playerService, ledgerService, achievementService, reputationService);
    const waypointService = new WaypointService(gameRepository, carrierService, starService, distanceService, starDistanceService, technologyService, gameService, playerService);
    const specialistHireService = new SpecialistHireService(gameRepository, specialistService, achievementService, waypointService, playerService, starService);
    const starUpgradeService = new StarUpgradeService(gameRepository, starService, carrierService, achievementService, researchService, technologyService, playerService);
    const aiService = new AIService(starUpgradeService);
    const historyService = new HistoryService(HistoryModel, historyRepository, playerService, gameService);
    const battleRoyaleService = new BattleRoyaleService(starService, carrierService, mapService, starDistanceService, waypointService);
    const orbitalMechanicsService = new OrbitalMechanicsService(mapService);
    const gameGalaxyService = new GameGalaxyService(cacheService, broadcastService, gameService, mapService, playerService, starService, distanceService, starDistanceService, starUpgradeService, carrierService, waypointService, researchService, specialistService, technologyService, reputationService, guildUserService, historyService, battleRoyaleService, orbitalMechanicsService);
    const emailService = new EmailService(config, gameService, userService, leaderboardService, playerService);
    const gameTickService = new GameTickService(distanceService, starService, carrierService, researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService, gameService, technologyService, specialistService, starUpgradeService, reputationService, aiService, emailService, battleRoyaleService, orbitalMechanicsService, diplomacyService);
    const shipTransferService = new ShipTransferService(gameRepository, carrierService, starService);
    const aiTradeService = new AITradeService(reputationService, randomService, tradeService, gameService);
    const donateService = new DonateService(cacheService);

    const eventService = new EventService(EventModel, eventRepository, broadcastService, gameService, gameTickService, researchService, starService, starUpgradeService, tradeService,
        ledgerService, conversationService, combatService, specialistService);

    const gameListService = new GameListService(gameRepository, gameService, conversationService, eventService);
    const gameCreateService = new GameCreateService(GameModel, gameListService, nameService, mapService, playerService, passwordService, conversationService, historyService, achievementService, userService);

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
        gameCreateService,
        gameGalaxyService,
        gameListService,
        gameTickService,
        guildService,
        guildUserService,
        mapService,
        playerService,
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
        specialistHireService,
        achievementService,
        conversationService,
        reputationService,
        aiService,
        aiTradeService,
        battleRoyaleService,
        orbitalMechanicsService,
        cacheService,
        recaptchaService,
        ratingService,
        donateService,
        diplomacyService,
        avatarService,
    };
};
