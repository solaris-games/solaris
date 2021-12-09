const mongoose = require('mongoose');
const ValidationError = require("../../errors/validation");

module.exports = class CustomMapService {
    constructor() { }

    generateLocations(customJSON, playerLimit) {
        let json;

        try {
          json = JSON.parse(customJSON)
        }
        catch (e) {
          throw new ValidationError('The custom map JSON is malformed.')
        }

        const locations = [];
        let playerIds = [];
        //const nameList = new Set()
        const homeStars = [];

        // TODO make a file containing the shapes
        let shapes = require('../../config/game/shapes').map(s => s.name);
        let colours = require('../../config/game/colours').slice();

        for (const star of json.stars) {
          // Fill in optional setting values.
          star.id = star.id == null ? null : +star.id;
          star.homeStar = star.homeStar == null ? false : star.homeStar;
          star.playerId = star.playerId == null ? null : +star.playerId;
          star.warpGate = star.warpGate == null ? false : star.warpGate;
          star.isNebula = star.isNebula == null ? false : star.isNebula;
          star.isAsteroidField = star.isAsteroidField == null ? false : star.isAsteroidField;
          star.isBlackHole = star.isBlackHole == null ? false : star.isBlackHole;
          star.wormHoleToStarId = star.wormHoleToStarId == null ? null : +star.wormHoleToStarId;
          star.specialistId = star.specialistId == null ? null : +star.specialistId;

          // Dont trust the user as far as you can throw him.
          this._checkStarProperty(star, 'id', 'number', false);
          this._checkStarProperty(star, 'playerId', 'number', true);
          this._checkStarProperty(star?.location, 'x', 'number', false);
          this._checkStarProperty(star?.location, 'y', 'number', false);
          this._checkStarProperty(star?.naturalResources, 'economy', 'number', false);
          this._checkStarProperty(star?.naturalResources, 'industry', 'number', false);
          this._checkStarProperty(star?.naturalResources, 'science', 'number', false);
          this._checkStarProperty(star, 'warpGate', 'boolean', true);
          this._checkStarProperty(star, 'isNebula', 'boolean', true);
          this._checkStarProperty(star, 'isAsteroidField', 'boolean', true);
          this._checkStarProperty(star, 'isBlackHole', 'boolean', true);
          this._checkStarProperty(star, 'wormHoleToStarId', 'number', true);
          this._checkStarProperty(star, 'homeStar', 'boolean', true);
          this._checkStarProperty(star, 'specialistId', 'number', true);
          // this._checkStarProperty(star, 'ships', 'number');

          if (star?.homeStar) {
            homeStars.push(star);
            star.linkedLocations = [];

            if (star.playerId != null) { 
              playerIds.push(star.playerId);
            }
          }

          locations.push(star);
        }

        playerIds = [...new Set(playerIds)]; // ignore repeated player indexes

        if (homeStars.length !== playerLimit) {
          throw new ValidationError(`Must have ${playerLimit} capital stars in the custom map.`);
        }

        if (homeStars.length === playerIds.length) {
          this._linkStars(homeStars, locations);
        } else if (playerIds.length !== 0) {
          throw new ValidationError('Unequal amount of home stars and players, or repeated player IDs');
        } // its fine to have all stars without players, in this case the other parts of game generation will asign players and initial stars

        // Populate actual IDs for all stars
        for (let loc of locations) {
          loc._id = mongoose.Types.ObjectId();
        }

        // Populate worm hole IDs of stars
        for (let loc of locations.filter(l => l.wormHoleToStarId != null)) {
          loc.wormHoleToStarId = locations.find(l => l.id === loc.wormHoleToStarId)?._id;

          if (!loc.wormHoleToStarId || loc.wormHoleToStarId.equals(loc._id)) {
            throw new ValidationError(`Worm hole to star id is invalid for ${JSON.stringify(loc)}`);
          }
        }

        return locations;
    }

    _checkStarProperty(star, property, type, allowNull) {
        if (star === undefined) throw new ValidationError(`Missing property of star ${star}`);
        if (star?.[property] === undefined) throw new ValidationError(`Missing property ${property} of star ${JSON.stringify(star)}`);

        if (allowNull && star[property] === null) {
          return true;
        }

        if (typeof star[property] !== type) throw new ValidationError(`Invalid type property ${property} of star ${JSON.stringify(star)}`);

        return true;
    }

     /*link owned stars to their home stars so at a latter stage players will claim the correct stars*/
    _linkStars(homeStars, stars) {
      let commonStars = stars.filter(star => !star.homeStar);

      for (let homeStar of homeStars) {
        homeStar.linkedLocations = [];

        for (let commonStar of commonStars) {
          if (commonStar.playerId === homeStar.playerId) {
            homeStar.linkedLocations.push(commonStar);
            commonStar.linked = true;
          }
        }
      }
    }
}
