import AchievementService from "../services/achievement";
import AdminService from "../services/admin";
import AIService from "../services/ai";
import AuthService from "../services/auth";
import AvatarService from "../services/avatar";
import BadgeService from "../services/badge";
import BattleRoyaleService from "../services/battleRoyale";
import BroadcastService from "../services/broadcast";
import CacheService from "../services/cache";
import CarrierService from "../services/carrier";
import CarrierGiftService from "../services/carrierGift";
import CarrierMovementService from "../services/carrierMovement";
import CombatService from "../services/combat";
import ConversationService from "../services/conversation";
import DiplomacyService from "../services/diplomacy";
import DiplomacyUpkeepService from "../services/diplomacyUpkeep";
import DistanceService from "../services/distance";
import DonateService from "../services/donate";
import EmailService from "../services/email";
import EventService from "../services/event";
import GameService from "../services/game";
import GameCreateService from "../services/gameCreate";
import GameCreateValidationService from "../services/gameCreateValidation";
import GameGalaxyService from "../services/gameGalaxy";
import GameListService from "../services/gameList";
import GameStateService from "../services/gameState";
import GameTickService from "../services/gameTick";
import GameTypeService from "../services/gameType";
import GuildService from "../services/guild";
import UserGuildService from "../services/guildUser";
import HistoryService from "../services/history";
import LeaderboardService from "../services/leaderboard";
import LedgerService from "../services/ledger";
import MapService from "../services/map";
import NameService from "../services/name";
import OrbitalMechanicsService from "../services/orbitalMechanics";
import PasswordService from "../services/password";
import PaypalService from "../services/paypal";
import PlayerService from "../services/player";
import PlayerCreditsService from "../services/playerCredits";
import PlayerCycleRewardsService from "../services/playerCycleRewards";
import PlayerReadyService from "../services/playerReady";
import PlayerStatisticsService from "../services/playerStatistics";
import RandomService from "../services/random";
import RatingService from "../services/rating";
import RecaptchaService from "../services/recaptcha";
import ReportService from "../services/report";
import ReputationService from "../services/reputation";
import ResearchService from "../services/research";
import ShipTransferService from "../services/shipTransfer";
import SpecialistService from "../services/specialist";
import SpecialistBanService from "../services/specialistBan";
import SpecialistHireService from "../services/specialistHire";
import StarService from "../services/star";
import StarContestedService from "../services/starContested";
import StarDistanceService from "../services/starDistance";
import StarUpgradeService from "../services/starUpgrade";
import TechnologyService from "../services/technology";
import TradeService from "../services/trade";
import UserService from "../services/user";
import WaypointService from "../services/waypoint";

export interface DependencyContainer {
    adminService: AdminService,
    passwordService: PasswordService,
    authService: AuthService,
    broadcastService: BroadcastService,
    carrierService: CarrierService,
    combatService: CombatService,
    distanceService: DistanceService,
    emailService: EmailService,
    eventService: EventService,
    leaderboardService: LeaderboardService,
    gameService: GameService,
    gameCreateValidationService: GameCreateValidationService,
    gameCreateService: GameCreateService,
    gameGalaxyService: GameGalaxyService,
    gameListService: GameListService,
    gameTickService: GameTickService,
    gameTypeService: GameTypeService,
    gameStateService: GameStateService,
    guildService: GuildService,
    guildUserService: UserGuildService,
    mapService: MapService,
    playerService: PlayerService,
    playerReadyService: PlayerReadyService,
    randomService: RandomService,
    researchService: ResearchService,
    starService: StarService,
    starDistanceService: StarDistanceService,
    nameService: NameService,
    starUpgradeService: StarUpgradeService,
    technologyService: TechnologyService,
    tradeService: TradeService,
    userService: UserService,
    waypointService: WaypointService,
    shipTransferService: ShipTransferService,
    historyService: HistoryService,
    ledgerService: LedgerService,
    specialistService: SpecialistService,
    specialistBanService: SpecialistBanService,
    specialistHireService: SpecialistHireService,
    achievementService: AchievementService,
    conversationService: ConversationService,
    reputationService: ReputationService,
    aiService: AIService,
    battleRoyaleService: BattleRoyaleService,
    orbitalMechanicsService: OrbitalMechanicsService,
    cacheService: CacheService,
    recaptchaService: RecaptchaService,
    ratingService: RatingService,
    donateService: DonateService,
    diplomacyService: DiplomacyService,
    avatarService: AvatarService,
    paypalService: PaypalService,
    badgeService: BadgeService,
    reportService: ReportService,
    playerStatisticsService: PlayerStatisticsService,
    playerCreditsService: PlayerCreditsService,
    diplomacyUpkeepService: DiplomacyUpkeepService,
    carrierGiftService: CarrierGiftService,
    carrierMovementService: CarrierMovementService,
    playerCycleRewardsService: PlayerCycleRewardsService,
    starContestedService: StarContestedService,
};
