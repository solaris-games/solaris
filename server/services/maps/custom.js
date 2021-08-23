const ValidationError = require("../../errors/validation");

module.exports = class CustomMapService {
    constructor(randomService, starService, starDistanceService, distanceService) {
        this.randomService = randomService;
        this.starService = starService;
        this.starDistanceService = starDistanceService;
        this.distanceService = distanceService;
    }

    generateLocations(game, starCount, playerCount, jsonData) {
        const json = JSON.parse(jsonData)
        const locations = [];
        const uidList = new Set()
        const nameList = new Set()
        const homeList = new Map()
        const ownedList = new Map()

        for (const star of json.stars) {
            if (!this._checkStarProperty(star, 'uid', 'number')) continue
            if (uidList.has(star.uid)) continue
            if (!this._checkStarProperty(star, 'name', 'string')) continue
            if (nameList.has(star.name)) continue
            if (!this._checkStarProperty(star, 'x', 'number')) continue
            if (!this._checkStarProperty(star, 'y', 'number')) continue
            if (!this._checkStarProperty(star, 'r', 'number')) continue
            if (star.r < 5 || star.r > 60) continue
            if (!this._checkStarProperty(star, 'ga', 'number')) continue
            if (star.ga < 0 || star.ga > 1) continue
            if (!this._checkStarProperty(star, 'e', 'number')) continue
            if (!this._checkStarProperty(star, 'i', 'number')) continue
            if (!this._checkStarProperty(star, 's', 'number')) continue
            if (!this._checkStarProperty(star, 'st', 'number')) continue
            if (!this._checkStarProperty(star, 'isHome', 'boolean')) continue
            if (homeList.get(star.puid) !== null) continue
            if (star?.puid !== undefined) this._addStarToPlayer(ownedList, star.puid, star.uid)
            if (star.isHome) homeList.set(star.puid, star.uid)
            uidList.add(star.uid)
            nameList.add(star.name)
            locations.push({star})
        }

        let enoughStarsPerPlayer = true
        for (const playerList of ownedList) {
            if (playerList.size() != starCount / playerCount) enoughStarsPerPlayer = false
        }
        if (!enoughStarsPerPlayer)
            throw new ValidationError('Not enough stars per player')

        if (locations.length <= starCount)
            throw new ValidationError('Not enough stars in json data generated')
        return locations
    }
    
    _checkStarProperty(star, property, type) {
        if (star?.[property] === undefined) return false
        if (typeof star[property] !== type) return false
        return true
    }

    _addStarToPlayer(list, puid, uid) {
        let l = list.get(puid)
        if (!l) {
            l = new Set()
            l.add(uid)
            return l
        }
        list.get(puid).add(uid)
    }
}