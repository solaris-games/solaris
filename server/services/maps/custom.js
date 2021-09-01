const ValidationError = require("../../errors/validation");

module.exports = class CustomMapService {
    constructor() { }

    generateLocations(game, settings, starCount, playerCount) {
        let s = settings.galaxy.customJSON
        //s = s.replace(/[\u0000-\u0019]+/g,""); 
        let json;
        try {
          json = JSON.parse(s)
        }
        catch (e) {
          console.log(e)
          throw new ValidationError('malformed json.')
        }

        const locations = [];
        const playerIndexes = [];
        //const nameList = new Set()
        const homeStars = []

        for (const star of json.stars) {
            //if (nameList.has(star.name)) continue

            if (!this._checkStarProperty(star?.location, 'x', 'number')) continue
            if (!this._checkStarProperty(star?.location, 'y', 'number')) continue
            if (!this._checkStarProperty(star, 'naturalResources', 'number')) continue
            if (!this._checkStarProperty(star, 'warpGate', 'boolean')) continue
            if (!this._checkStarProperty(star?.infrastructure, 'economy', 'number')) continue
            if (!this._checkStarProperty(star?.infrastructure, 'industry', 'number')) continue
            if (!this._checkStarProperty(star?.infrastructure, 'science', 'number')) continue
            //if (!this._checkStarProperty(star, 'ships', 'number')) continue
            if (!this._checkStarProperty(star, 'playerIndex', 'number')) continue
            if (!this._checkStarProperty(star, 'homeStar', 'boolean')) continue
            if (!this._checkStarProperty(star, 'specialistId', 'number')) continue

            if (star.naturalResources < 0 || star.naturalResources > 100)
                throw new ValidationError('Illigal starting amount of resources, range needs to be between 10 and 100 inclusive')
            if (star.playerIndex >= (8*4)) //colours*shapes
                throw new ValidationError('Invalid playerid')

            if (star?.homeStar) {
              homeStars.push(star)
              star.linkedLocations = []
              if (star.playerIndex >=0) { playerIndexes.push(star.playerIndex) }
            }
            //nameList.add(star.name)

            locations.push(star)
        }
        /*
        if (!ownedList.every(array => array.length === starCount / playerCount))
            throw new ValidationError('Not enough stars per player.')

        if (!homeList.every(array => array.length === 1))
            throw new ValidationError('Duplicate or players without homeStars.')
        */

        if (locations.length !== starCount)
            throw new ValidationError('Not enough stars in json data generated.')

        if (homeStars.length === playerIndexes.length) {
          this._linkStars(homeStars, locations)
        }
        else {
          if(playerIndexes.length !== 0) {
            throw new ValidationError('Unequal amount of home stars and players')
          } // its fine to have all stars without players, in this case the other parts of game generation will asign players and initial stars
        }

        let commonStarAmount = homeStars[0].linkedLocations.length
        for (let homeStar of homeStars) {
          if(homeStar.linkedLocations.length !== commonStarAmount)
            throw new ValidationError('unfair start - players dont have the same amount of stars')
        }

        for(let location of locations) {
          if(location.specialistId === -1) { location.specialistId = null; }
        }

        return locations
    }

    _checkStarProperty(star, property, type) {
        if (star === undefined) throw new ValidationError(`Missing property location or infrastructure of star ${star}`)
        if (star?.[property] === undefined) throw new ValidationError(`Missing property ${property} of star ${star}`)
        if (typeof star[property] !== type) throw new ValidationError(`Invalid type property ${property} of star ${star}`)
        return true
    }

    _linkStars(homeStars, stars) {
      let commonStars = stars.filter( (star) => { return !star.homeStar })
      for(let homeStar of homeStars) {
        homeStar.linkedLocations = []
        for(let commonStar of commonStars) {
          if(commonStar.playerIndex === homeStar.playerIndex) {
            homeStar.linkedLocations.push(commonStar)
            commonStar.linked = true
          }
        }
      }
    }
}
