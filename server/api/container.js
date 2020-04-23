const bcrypt = require('bcrypt');

const GameModel = require('../models/Game');
const UserModel = require('../models/User');

const AuthService = require('../services/auth');
const CarrierService = require('../services/carrier');
const DistanceService = require('../services/distance');
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
const StarNameService = require('../services/starName');
const StarUpgradeService = require('../services/starUpgrade');
const TradeService = require('../services/trade');
const WaypointService = require('../services/waypoint');
const MessageService = require('../services/message');
const UserService = require('../services/user');

const starNames = require('../config/game/starNames');

// Poor man's dependency injection.

const authService = new AuthService(bcrypt, UserModel);
const userService = new UserService(bcrypt, UserModel);

const carrierService = new CarrierService();
const distanceService = new DistanceService();
const randomService = new RandomService();
const gameService = new GameService(GameModel, userService);
const gameListService = new GameListService(GameModel);
const researchService = new ResearchService(randomService);
const tradeService = new TradeService(userService);
const waypointService = new WaypointService();
const starNameService = new StarNameService(starNames, randomService);
const starService = new StarService(randomService, starNameService, distanceService);
const starDistanceService = new StarDistanceService(distanceService);
const mapService = new MapService(randomService, starService, distanceService, starDistanceService, starNameService);
const playerService = new PlayerService(randomService, mapService, starService, carrierService, starDistanceService);
const gameCreateService = new GameCreateService(GameModel, mapService, playerService);
const starUpgradeService = new StarUpgradeService(starService, carrierService);
const gameGalaxyService = new GameGalaxyService(mapService, playerService, starService, distanceService, starDistanceService, starUpgradeService, carrierService);
const gameTickService = new GameTickService(distanceService, starService, researchService, playerService);
const messageService = new MessageService();

module.exports = {
    authService,
    carrierService,
    distanceService,
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
    starNameService,
    starUpgradeService,
    tradeService,
    userService,
    waypointService,
    messageService,
};
