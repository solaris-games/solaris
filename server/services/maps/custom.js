const ValidationError = require("../../errors/validation");

module.exports = class CustomMapService {
    constructor() { }

    generateLocations(game, starCount, playerCount) {
        const json = JSON.parse(game.settings) //need correct path
        const locations = [];
        const nameList = new Set()
        const homeList = Array.from({ length: playerCount }, () => [])
        const ownedList = Array.from({ length: playerCount }, () => [])

        for (const star of json.stars) {
            if (nameList.has(star.name)) continue

            if (!this._checkStarProperty(star?.location, 'x', 'number')) continue
            if (!this._checkStarProperty(star?.location, 'y', 'number')) continue
            if (!this._checkStarProperty(star, 'naturalResources', 'number')) continue
            if (!this._checkStarProperty(star, 'warpGate', 'boolean')) continue
            if (!this._checkStarProperty(star?.infrastructure, 'economy', 'number')) continue
            if (!this._checkStarProperty(star?.infrastructure, 'industry', 'number')) continue
            if (!this._checkStarProperty(star?.infrastructure, 'science', 'number')) continue
            if (!this._checkStarProperty(star, 'ships', 'number')) continue
            if (!this._checkStarProperty(star, 'ownedByPlayerId', 'number')) continue
            if (!this._checkStarProperty(star, 'isHomeStar', 'boolean')) continue

            if (star.naturalResources < 10 || star.naturalResources > 100)
                throw new ValidationError('Illigal starting amount of resources, range needs to be between 10 and 100 inclusive')
            if (star.ownedByPlayerId < -1 || star.ownedByPlayerId >= playerCount)
                throw new ValidationError('Invalid playerid')

            if (star?.ownedByPlayerId !== -1) {
                ownedList[star.ownedByPlayerId].push(star)
                if (star.isHome) homeList[star.ownedByPlayerId].push(star)
            }
            nameList.add(star.name)

            locations.push(star)
        }

        if (!ownedList.every(array => array.length === starCount / playerCount))
            throw new ValidationError('Not enough stars per player.')

        if (!homeList.every(array => array.length === 1))
            throw new ValidationError('Duplicate or players without homeStars.')

        if (locations.length !== starCount)
            throw new ValidationError('Not enough stars in json data generated.')

        return locations
    }

    _checkStarProperty(star, property, type) {
        if (star === undefined) throw new ValidationError(`Missing property location or infrastructure of star ${star}`)
        if (star?.[property] === undefined) throw new ValidationError(`Missing property ${property} of star ${star}`)
        if (typeof star[property] !== type) throw new ValidationError(`Invalid type property ${property} of star ${star}`)
        return true
    }
}
