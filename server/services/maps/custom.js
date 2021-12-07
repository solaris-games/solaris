const ValidationError = require("../../errors/validation");

module.exports = class CustomMapService {
    constructor() { }

    generateLocations(game) {
        let json;

        try {
          json = JSON.parse(game.settings.general.customJSON)
        }
        catch (e) {
          throw new ValidationError('The custom map JSON is malformed.')
        }

        const locations = [];
        let playerIndexes = [];
        //const nameList = new Set()
        const homeStars = [];

        // TODO make a file containing the shapes
        let shapes = ['circle', 'square', 'diamond', 'hexagon'];
        let colours = require('../../config/game/colours').slice();

        for (const star of json.stars) {
            this._checkStarProperty(star?.location, 'x', 'number')
            this._checkStarProperty(star?.location, 'y', 'number')
            this._checkStarProperty(star?.naturalResources, 'economy', 'number')
            this._checkStarProperty(star?.naturalResources, 'industry', 'number')
            this._checkStarProperty(star?.naturalResources, 'science', 'number')
            this._checkStarProperty(star, 'warpGate', 'boolean')
            this._checkStarProperty(star?.infrastructure, 'economy', 'number')
            this._checkStarProperty(star?.infrastructure, 'industry', 'number')
            this._checkStarProperty(star?.infrastructure, 'science', 'number')
            //this._checkStarProperty(star, 'ships', 'number')
            this._checkStarProperty(star, 'playerIndex', 'number')
            this._checkStarProperty(star, 'homeStar', 'boolean')
            this._checkStarProperty(star, 'specialistId', 'number')

            if (star.naturalResources < 0 || star.naturalResources > game.constants.star.resources.maxNaturalResources)
                throw new ValidationError(`Illegal starting amount of resources, range needs to be between 0 and ${game.constants.star.resources.maxNaturalResources} inclusive`);
            
            if (star.playerIndex >= (colours.length * shapes.length))
                throw new ValidationError('Invalid playerIndex')

            if (star?.homeStar) {
              homeStars.push(star);
              star.linkedLocations = [];

              if (star.playerIndex >= 0) { 
                playerIndexes.push(star.playerIndex);
              }
            }

            locations.push(star);
        }

        playerIndexes = [...new Set(playerIndexes)]; // ignore repeated player indexes

        if (homeStars.length === playerIndexes.length) {
          this._linkStars(homeStars, locations);
        } else if (playerIndexes.length !== 0) {
          throw new ValidationError('Unequal amount of home stars and players, or repeated player IDs');
        } // its fine to have all stars without players, in this case the other parts of game generation will asign players and initial stars

        for (let location of locations) {
          location.specialistId = location.specialistId || null;
        }

        return locations;
    }

    _checkStarProperty(star, property, type) {
        if (star === undefined) throw new ValidationError(`Missing property location or infrastructure of star ${star}`);
        if (star?.[property] === undefined) throw new ValidationError(`Missing property ${property} of star ${star}`);
        if (typeof star[property] !== type) throw new ValidationError(`Invalid type property ${property} of star ${star}`);

        return true;
    }

     /*link owned stars to their home stars so at a latter stage players will claim the correct stars*/
    _linkStars(homeStars, stars) {
      let commonStars = stars.filter(star => !star.homeStar);

      for (let homeStar of homeStars) {
        homeStar.linkedLocations = [];

        for (let commonStar of commonStars) {
          if (commonStar.playerIndex === homeStar.playerIndex) {
            homeStar.linkedLocations.push(commonStar);
            commonStar.linked = true;
          }
        }
      }
    }
}