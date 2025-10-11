import { Config } from "../../config/types/Config";
import { DiplomacyServerSocketEmitter } from "../../sockets/socketEmitters/diplomacy";
import { GameServerSocketEmitter } from "../../sockets/socketEmitters/game";
import { PlayerServerSocketEmitter } from "../../sockets/socketEmitters/player";
import { PlayerServerSocketHandler } from "../../sockets/socketHandlers/player";
import { ServerHandler } from "../../sockets/socketHandlers/serverHandler";
import UserAchievementService from "../userAchievement";
import AdminService from "../admin";
import AIService from "../ai";
import AnnouncementService from "../announcement";
import AuthService from "../auth";
import AvatarService from "../avatar";
import BadgeService from "../badge";
import BasicAIService from "../basicAi";
import BattleRoyaleService from "../battleRoyale";
import BroadcastService from "../broadcast";
import CacheService from "../cache";
import CarrierService from "../carrier";
import CarrierGiftService from "../carrierGift";
import CarrierMovementService from "../carrierMovement";
import CombatService from "../combat";
import ConversationService from "../conversation";
import DiplomacyService from "../diplomacy";
import DiplomacyUpkeepService from "../diplomacyUpkeep";
import DiscordService from "../discord";
import DistanceService from "../distance";
import EmailService from "../email";
import EventService from "../event";
import GameService from "../game";
import GameAuthService from "../gameAuth";
import GameCreateService from "../gameCreate";
import GameFluxService from "../gameFlux";
import GameGalaxyService from "../gameGalaxy";
import GameJoinService from "../gameJoin";
import GameListService from "../gameList";
import GameLockService from "../gameLock";
import GameMaskingService from "../gameMaskingService";
import GameMutexService from "../gameMutex";
import GamePlayerMutexService from "../gamePlayerMutex";
import GameStateService from "../gameState";
import GameTickService from "../gameTick";
import { GameTypeService } from 'solaris-common'
import GuildService from "../guild";
import UserGuildService from "../guildUser";
import HistoryService from "../history";
import LeaderboardService from "../leaderboard";
import LedgerService from "../ledger";
import MapService from "../map";
import NameService from "../name";
import NotificationService from "../notification";
import PasswordService from "../password";
import PathfindingService from "../pathfinding";
import PaypalService from "../paypal";
import PlayerService from "../player";
import PlayerAfkService from '../playerAfk';
import PlayerColourService from "../playerColour";
import PlayerCreditsService from "../playerCredits";
import PlayerCycleRewardsService from "../playerCycleRewards";
import PlayerReadyService from "../playerReady";
import PlayerStatisticsService from "../playerStatistics";
import RandomService from "../random";
import RatingService from "../rating";
import ReportService from "../report";
import ReputationService from "../reputation";
import ResearchService from "../research";
import ScheduleBuyService from "../scheduleBuy";
import SessionService from "../session";
import ShipService from "../ship";
import ShipTransferService from "../shipTransfer";
import SocketService from "../socket";
import SpecialStarBanService from "../specialStarBan";
import SpecialistService from "../specialist";
import SpecialistBanService from "../specialistBan";
import SpecialistHireService from "../specialistHire";
import SpectatorService from "../spectator";
import StarService from "../star";
import StarContestedService from "../starContested";
import StarDistanceService from "../starDistance";
import StarMovementService from "../starMovement";
import StarUpgradeService from "../starUpgrade";
import TeamService from "../team";
import TechnologyService from "../technology";
import TradeService from "../trade";
import TutorialService from "../tutorial";
import UserService from "../user";
import UserLeaderboardService from "../userLeaderboard";
import UserLevelService from "../userLevel";
import WaypointService from "../waypoint";
import StarCaptureService from "../starCapture";
import {UserServerSocketEmitter} from "../../sockets/socketEmitters/user";
import {UserServerSocketHandler} from "../../sockets/socketHandlers/user";
import StatisticsService from "../statistics";
import InitialGameStateService from "../initialGameState";
import WaypointActionService from "../waypointAction";

export interface DependencyContainer {
    config: Config,
    adminService: AdminService,
    passwordService: PasswordService,
    authService: AuthService,
    discordService: DiscordService,
    broadcastService: BroadcastService,
    socketService: SocketService,
    gameServerSocketEmitter: GameServerSocketEmitter,
    playerServerSocketEmitter: PlayerServerSocketEmitter,
    diplomacyServerSocketEmitter: DiplomacyServerSocketEmitter,
    userServerSocketEmitter: UserServerSocketEmitter,
    carrierService: CarrierService,
    combatService: CombatService,
    distanceService: DistanceService,
    emailService: EmailService,
    eventService: EventService,
    leaderboardService: LeaderboardService,
    userLeaderboardService: UserLeaderboardService,
    gameService: GameService,
    serverHandler: ServerHandler,
    playerServerSocketHandler: PlayerServerSocketHandler,
    userServerSocketHandler: UserServerSocketHandler,
    gameAuthService: GameAuthService,
    gameLockService: GameLockService,
    gameJoinService: GameJoinService,
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
    playerAfkService: PlayerAfkService,
    userLevelService: UserLevelService,
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
    specialStarBanService: SpecialStarBanService;
    userAchievementService: UserAchievementService,
    conversationService: ConversationService,
    reputationService: ReputationService,
    aiService: AIService,
    basicAIService: BasicAIService,
    battleRoyaleService: BattleRoyaleService,
    starMovementService: StarMovementService,
    cacheService: CacheService,
    ratingService: RatingService,
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
    gameFluxService: GameFluxService,
    notificationService: NotificationService,
    shipService: ShipService,
    spectatorService: SpectatorService,
    teamService: TeamService,
    pathfindingService: PathfindingService,
    scheduleBuyService: ScheduleBuyService,
    gamePlayerMutexService: GamePlayerMutexService,
    gameMutexService: GameMutexService,
    announcementService: AnnouncementService,
    tutorialService: TutorialService,
    playerColourService: PlayerColourService,
    gameMaskingService: GameMaskingService,
    sessionService: SessionService,
    starCaptureService: StarCaptureService,
    statisticsService: StatisticsService,
    initialGameStateService: InitialGameStateService,
    waypointActionService: WaypointActionService,
};
