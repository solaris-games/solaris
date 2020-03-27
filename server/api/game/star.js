const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const bcrypt = require('bcrypt');

const GameService = require('../../services/game');
const DistanceService = require('../../services/distance');
const StarDistanceService = require('../../services/starDistance');
const MapService = require('../../services/map');
const PlayerService = require('../../services/player');
const RandomService = require('../../services/random');
const StarService = require('../../services/star');
const CarrierService = require('../../services/carrier');
const TradeService = require('../../services/trade');
const StarNameService = require('../../services/starName');
const UserService = require('../../services/user');

const starNames = require('../../config/game/starNames');

const gameModel = require('../../models/Game');
const User = require('../../models/User');

// TODO: Need DI here.
const randomService = new RandomService();
const starNameService = new StarNameService(starNames, randomService);
const distanceService = new DistanceService();
const starDistanceService = new StarDistanceService(distanceService);
const carrierService = new CarrierService();
const starService = new StarService(randomService, starNameService);
const mapService = new MapService(randomService, starService, distanceService, starDistanceService, starNameService);
const playerService = new PlayerService(randomService, mapService, starService, carrierService, starDistanceService);
const gameService = new GameService(gameModel);

const userService = new UserService(bcrypt, User);
const tradeService = new TradeService(gameService, userService);

// TODO: API Endpoints

module.exports = router;
