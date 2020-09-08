const bcrypt = require('bcrypt');

const GameModel = require('../models/Game');
const UserModel = require('../models/User');
const HistoryModel = require('../models/History');
const EventModel = require('../models/Event');

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
const MessageService = require('../services/message');
const ShipTransferService = require('../services/shipTransfer');
const UserService = require('../services/user');
const HistoryService = require('../services/history');
const LedgerService = require('../services/ledger');
const SpecialistService = require('../services/specialist');

const StandardMapService = require('../services/maps/standard');
const CircularMapService = require('../services/maps/circular');

const config = require('../config');
const gameNames = require('../config/game/gameNames');
const starNames = require('../config/game/starNames');

module.exports = (io) => {
    // Poor man's dependency injection.

    const passwordService = new PasswordService(bcrypt);
    
    const authService = new AuthService(UserModel, passwordService);
    const userService = new UserService(UserModel, passwordService);

    const broadcastService = new BroadcastService(io);
    const distanceService = new DistanceService();
    const randomService = new RandomService();
    const gameListService = new GameListService(GameModel);
    const nameService = new NameService(gameNames, starNames, randomService);
    const starDistanceService = new StarDistanceService(distanceService);
    const starService = new StarService(randomService, nameService, distanceService, starDistanceService);
    const carrierService = new CarrierService(distanceService, starService);
    const specialistService = new SpecialistService(carrierService);
    const technologyService = new TechnologyService(starService, carrierService, specialistService);
    const combatService = new CombatService(technologyService);
    const standardMapService = new StandardMapService(randomService, starService, starDistanceService);
    const circularMapService = new CircularMapService(randomService, starService, starDistanceService, distanceService);
    // const mapService = new MapService(randomService, starService, starDistanceService, nameService, standardMapService); // TODO: Needs to be refactored to get the required service from a game setting.
    const mapService = new MapService(randomService, starService, starDistanceService, nameService, circularMapService);
    const playerService = new PlayerService(randomService, mapService, starService, carrierService, starDistanceService, technologyService);
    const ledgerService = new LedgerService(playerService);
    const leaderboardService = new LeaderboardService(UserModel, userService, playerService);
    const gameService = new GameService(GameModel, userService, carrierService, playerService, passwordService);
    const researchService = new ResearchService(technologyService, randomService, playerService, userService);
    const tradeService = new TradeService(userService, playerService, ledgerService);
    const waypointService = new WaypointService(carrierService, starService, distanceService, starDistanceService);
    const gameCreateService = new GameCreateService(GameModel, gameListService, nameService, mapService, playerService, passwordService);
    const starUpgradeService = new StarUpgradeService(starService, carrierService, userService, researchService);
    const gameGalaxyService = new GameGalaxyService(mapService, playerService, starService, distanceService, starDistanceService, starUpgradeService, carrierService, waypointService, researchService, specialistService);
    const historyService = new HistoryService(HistoryModel, playerService);
    const gameTickService = new GameTickService(broadcastService, distanceService, starService, carrierService, researchService, playerService, historyService, waypointService, combatService, leaderboardService, userService, gameService);
    const messageService = new MessageService();
    const emailService = new EmailService(config, gameService, gameTickService, userService, leaderboardService);
    const shipTransferService = new ShipTransferService(carrierService, starService);
    
    const eventService = new EventService(EventModel, broadcastService, gameService, gameTickService, researchService, starService, starUpgradeService, tradeService,
        ledgerService);

    return {
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
        messageService,
        historyService,
        ledgerService,
        specialistService,
    };
};
