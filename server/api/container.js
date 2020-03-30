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
const MapService = require('../services/map');
const PlayerService = require('../services/player');
const RandomService = require('../services/random');
const ResearchService = require('../services/research');
const StarService = require('../services/star');
const StarDistanceService = require('../services/starDistance');
const StarNameService = require('../services/starName');
const StarUpgradeService = require('../services/starUpgrade');
const TradeService = require('../services/trade');
const UserService = require('../services/user');

const starNames = require('../config/game/starNames');

// Poor man's dependency injection.

const authService = new AuthService(bcrypt, UserModel);
const userService = new UserService(bcrypt, UserModel);

const carrierService = new CarrierService();
const distanceService = new DistanceService();
const randomService = new RandomService();
const gameService = new GameService(GameModel);
const gameListService = new GameListService(GameModel);
const tradeService = new TradeService(gameService, userService);
const starNameService = new StarNameService(starNames, randomService);
const starService = new StarService(randomService, starNameService, gameService);
const starDistanceService = new StarDistanceService(distanceService);
const mapService = new MapService(randomService, starService, distanceService, starDistanceService, starNameService);
const playerService = new PlayerService(randomService, mapService, starService, carrierService, starDistanceService);
const gameCreateService = new GameCreateService(GameModel, mapService, playerService);
const starUpgradeService = new StarUpgradeService(gameService, starService);
const gameGalaxyService = new GameGalaxyService(gameService, mapService, playerService, starService, distanceService, starDistanceService, starUpgradeService);

module.exports = {
    authService,
    carrierService,
    distanceService,
    gameService,
    gameCreateService,
    gameGalaxyService,
    gameListService,
    mapService,
    playerService,
    randomService,
    starService,
    starDistanceService,
    starNameService,
    starUpgradeService,
    tradeService,
    userService,
};
