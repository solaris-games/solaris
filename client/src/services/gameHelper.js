import moment from 'moment'

class GameHelper {
  getUserPlayer (game) {
    // The user's player will be the only player that has a user ID on the player object.
    return game.galaxy.players.find(p => p.userId)
  }

  getPlayerById (game, playerId) {
    return game.galaxy.players.find(x => x._id === playerId)
  }

  getPlayerColour (game, playerId) {
    let player = this.getPlayerById(game, playerId)

    return this.getFriendlyColour(player.colour.value)
  }

  getFriendlyColour (colour) {
    return colour.replace('0x', '#')
  }

  getStarById (game, starId) {
    return game.galaxy.stars.find(x => x._id === starId)
  }

  getCarrierById (game, carrierId) {
    return game.galaxy.carriers.find(x => x._id === carrierId)
  }

  getStarOwningPlayer (game, star) {
    return game.galaxy.players.find(x => x._id === star.ownedByPlayerId)
  }

  getStarsOwnedByPlayer (player, stars) {
    return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId === player._id)
  }

  getCarrierOwningPlayer (game, carrier) {
    return game.galaxy.players.find(x => x._id === carrier.ownedByPlayerId)
  }

  getCarrierOrbitingStar (game, carrier) {
    return game.galaxy.stars.find(x => x._id === carrier.orbiting)
  }

  getCarriersOrbitingStar (game, star) {
    return game.galaxy.carriers.filter(x => x.orbiting === star._id)
  }

  isCarrierInTransit (carrier) {
    return carrier.orbiting == null
  }

  isCarrierInTransitToWaypoint (carrier, waypoint) {
    return carrier.waypoints.indexOf(waypoint) === 0 &&
        this.isCarrierInTransit(carrier) &&
        carrier.inTransitFrom === waypoint.source &&
        carrier.inTransitTo === waypoint.destination
  }

  getHyperspaceDistance (game, player, carrier) {
    let techLevel = player.research.hyperspace.effective
    
    if (carrier.specialist && carrier.specialist.modifiers.local) {
      techLevel += carrier.specialist.modifiers.local.hyperspace || 0
    }

    techLevel = Math.max(1, techLevel)

    return ((techLevel || 1) + 1.5) * game.constants.distances.lightYear
  }

  getHyperspaceLevelByDistance (game, distance) {
    let distancePerLevel = Math.ceil(distance / game.constants.distances.lightYear - 1.5)

    return distancePerLevel || 1
  }

  getDistanceBetweenLocations (loc1, loc2) {
    let xs = loc2.x - loc1.x
    let ys = loc2.y - loc1.y

    xs *= xs
    ys *= ys

    return Math.sqrt(xs + ys)
  }

  getAngleBetweenLocations (loc1, loc2) {
    return Math.atan2(loc2.y - loc1.y, loc2.x - loc1.x);
  }

  getPointFromLocation (loc, angle, distance) {
    return {
        x: loc.x + (Math.cos(angle) * distance),
        y: loc.y + (Math.sin(angle) * distance)
    };
  }

  getTicksBetweenLocations (game, carrier, locs, tickDistanceModifier = 1) {
    let totalTicks = 0
    let tickDistance = game.constants.distances.shipSpeed * tickDistanceModifier

    // Factor in any local speed modifers
    // TODO: Global speed modifiers.
    if (carrier && carrier.specialist && carrier.specialist.modifiers.local) {
      tickDistance *= carrier.specialist.modifiers.local.speed || 1
    }

    for (let i = 1; i < locs.length; i++) {
      let prevLoc = locs[i - 1]
      let currLoc = locs[i]

      let distance = this.getDistanceBetweenLocations(prevLoc, currLoc)

      let ticks = Math.ceil(distance / tickDistance)

      totalTicks += ticks
    }

    return totalTicks
  }

  getTicksToProduction (game) {
    let productionTicks = game.settings.galaxy.productionTicks
    let currentTick = game.state.tick
    let currentProductionTick = game.state.productionTick

    let ticksToProduction = ((currentProductionTick + 1) * productionTicks) - currentTick

    return ticksToProduction;
  }

  getCountdownTimeString (game, date) {
    if (date == null) {
      return 'Unknown'
    }

    let relativeTo = moment().utc()
    let t = moment(date).utc() - relativeTo // Deduct the future date from now.

    return this.getDateToString(t)
  }

  getCountdownTimeStringByTicks (game, ticks, useNowDate = false) {
    if (game.settings.gameTime.gameType === 'realTime') {
      let date = useNowDate ? moment().utc() : game.state.lastTickDate

      let timeRemainingEtaDate = this.calculateTimeByTicks(ticks, game.settings.gameTime.speed, date)
  
      let timeRemainingEta = this.getCountdownTimeString(game, timeRemainingEtaDate)
  
      return timeRemainingEta
    }

    return `${ticks} ticks`
  }

  getDateToString (date) {
    let days = Math.floor(date / (1000 * 60 * 60 * 24))
    let hours = Math.floor((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let mins = Math.floor((date % (1000 * 60 * 60)) / (1000 * 60))
    let secs = Math.floor((date % (1000 * 60)) / 1000)

    if (secs < 0) {
      return 'Pending...'
    }

    let str = ''
    let showDays = false
    let showHours = false

    if (days > 0) {
      str += `${days}d `
      showDays = true
    }

    if (showDays || hours > 0) {
      str += `${hours}h `
      showHours = true
    }

    if (showHours || mins > 0) {
      str += `${mins}m `
    }

    str += `${secs}s`

    return str
  }

  // TODO: This has all been copy/pasted from the API services
  // is there a way to share these functions in a core library?
  calculateWaypointTicks (game, carrier, waypoint) {
    let sourceStar = game.galaxy.stars.find(x => x._id === waypoint.source)
    let destinationStar = game.galaxy.stars.find(x => x._id === waypoint.destination)

    // if the waypoint is going to the same star then it is at least 1
    // tick, plus any delay ticks.
    if (sourceStar._id === destinationStar._id) {
      return 1 + waypoint.delayTicks
    }

    let source = sourceStar.location
    let destination = destinationStar.location

    // If the carrier is already en-route, then the number of ticks will be relative
    // to where the carrier is currently positioned.
    if (!carrier.orbiting && carrier.waypoints[0]._id === waypoint._id) {
      source = carrier.location
    }

    let ticks

    if (sourceStar.warpGate && destinationStar.warpGate &&
      sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
      ticks = this.getTicksBetweenLocations(game, carrier, [source, destination], game.constants.distances.warpSpeedMultiplier)
    } else {
      ticks = this.getTicksBetweenLocations(game, carrier, [source, destination])
    }

    return ticks
  }

  calculateWaypointTicksEta (game, carrier, waypoint) {
    let totalTicks = 0

    for (let i = 0; i < carrier.waypoints.length; i++) {
      let cwaypoint = carrier.waypoints[i]

      totalTicks += this.calculateWaypointTicks(game, carrier, cwaypoint)

      if (cwaypoint === waypoint) {
        break
      }
    }

    return totalTicks
  }

  calculateTimeByTicks (ticks, speedInMins, relativeTo = null) {
    if (relativeTo == null) {
      relativeTo = moment().utc()
    } else {
      relativeTo = moment(relativeTo).utc()
    }

    return relativeTo.add(ticks * speedInMins, 'm')
  }

  canLoop (game, player, carrier) {
    if (carrier.waypoints.length < 2) {
      return false
    }

    // Check whether the last waypoint is in range of the first waypoint.
    let firstWaypoint = carrier.waypoints[0]
    let lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1]

    let firstWaypointStar = this.getStarById(game, firstWaypoint.source)
    let lastWaypointStar = this.getStarById(game, lastWaypoint.source)

    let distanceBetweenStars = this.getDistanceBetweenLocations(firstWaypointStar.location, lastWaypointStar.location)
    let hyperspaceDistance = this.getHyperspaceDistance(game, player, carrier)

    return distanceBetweenStars <= hyperspaceDistance
  }

  isGamePaused (game) {
    return game.state.paused
  }

  isGameInProgress (game) {
    return !this.isGamePaused(game) && game.state.startDate != null && moment().utc().diff(game.state.startDate) >= 0 && !game.state.endDate
  }

  isGamePendingStart (game) {
    return !this.isGamePaused(game) && game.state.startDate != null && moment().utc().diff(game.state.startDate) < 0
  }

  isGameFinished (game) {
    return game.state.endDate != null
  }

  getGameStatusText (game) {
    if (this.isGamePendingStart(game)) {
      return 'Waiting to start'
    }

    if (this.isGameInProgress(game)) {
      return 'In progress'
    }

    if (this.isGameFinished(game)) {
      return 'Finished'
    }

    if (this.isGamePaused(game)) {
      return 'Paused'
    }

    return 'Unknown'
  }

  userPlayerHasHighestTechLevel (game, techKey) {
    let userPlayer = this.getUserPlayer(game)
    
    let levels = [...new Set(game.galaxy.players.map(p => {
      return p.research[techKey].level
    }))]

    // If all players have the same level then nobody has the highest.
    if (levels.length === 1) {
      return false
    }

    let maxLevel = levels.sort((a, b) => b - a)[0]

    return maxLevel === userPlayer.research[techKey].level
  }

  userPlayerHasLowestTechLevel (game, techKey) {
    let userPlayer = this.getUserPlayer(game)
    
    let levels = [...new Set(game.galaxy.players.map(p => {
      return p.research[techKey].level
    }))]

    // If all players have the same level then nobody has the lowest.
    if (levels.length === 1) {
      return false
    }

    let minLevel = levels.sort((a, b) => a - b)[0]

    return minLevel === userPlayer.research[techKey].level
  }

  getPlayerStatus (player) {
    if (player.defeated && !player.afk) {
      return 'DEFEATED'
    } else if (player.defeated && player.afk) {
      return 'AFK'
    }

    return 'UNKNOWN'
  }

  getSortedLeaderboardPlayerList (game) {
    // Sort by total number of stars, then by total ships, then by total carriers.
    return [...game.galaxy.players]
      .sort((a, b) => {
        // Sort by total stars descending
        if (a.stats.totalStars > b.stats.totalStars) return -1
        if (a.stats.totalStars < b.stats.totalStars) return 1

        // Then by total ships descending
        if (a.stats.totalShips > b.stats.totalShips) return -1
        if (a.stats.totalShips < b.stats.totalShips) return 1

        // Then by total carriers descending
        if (a.stats.totalCarriers > b.stats.totalCarriers) return -1
        if (a.stats.totalCarriers < b.stats.totalCarriers) return 1

        // Then by defeated descending
        return (a.defeated === b.defeated) ? 0 : a.defeated ? 1 : -1
      })
  }

  isNormalAnonymity (game) {
    return game.settings.general.anonymity === 'normal'
  }

  isHiddenPlayerOnlineStatus (game) {
    return game.settings.general.playerOnlineStatus === 'hidden'
  }

  calculateGalaxyCenterX (game) {
    let starFieldLeft = this.calculateMinStarX(game)
    let starFieldRight = this.calculateMaxStarX(game)
    return starFieldLeft + ( (starFieldRight-starFieldLeft)/2.0 )
  }

  calculateGalaxyCenterY (game) {
    let starFieldTop = this.calculateMinStarY(game)
    let starFieldBottom = this.calculateMaxStarY(game)
    return starFieldTop + ( (starFieldBottom-starFieldTop)/2.0 )
  }

  calculateMinStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  calculateMinStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  calculateMaxStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  calculateMaxStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }

  getSpecialistName (type, specialistId) {
    if (type === 'carrier') {
      switch (specialistId) {
        case 1:
          return 'mecha-head'
        case 2:
          return 'mecha-mask'
        case 3:
          return 'android-mask'
        case 4:
          return 'hazmat-suit'
        case 5:
          return 'cyborg-face'
        case 6:
          return 'lunar-module'
        case 7:
          return 'spaceship'
        case 8:
          return 'power-generator'
        case 9:
          return 'energise'
        case 10:
          return 'afterburn'
        case 11:
          return 'strafe'
        case 12:
          return 'alien-stare'
        case 13:
          return 'pirate'
      }
    } else {
      switch (specialistId) {
        case 1:
          return 'sattelite'
        case 2:
          return 'airtight-hatch'
        case 3:
          return 'cannister'
        case 4:
          return 'defense-satellite'
        case 5:
          return 'habitat-dome'
        case 6:
          return 'techno-heart'
        case 7:
          return 'missile-pod'
        case 8:
          return 'power-generator'
        case 9:
          return 'space-suit'
        case 10:
          return 'ringed-planet'
        case 11:
          return 'observatory'
      }
    }
  }

  getDateString (date) {
    date = moment(date).utc().toDate()

    let dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    let monthOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return `${dayOfWeek[date.getDay()]} ${date.getDate()} ${monthOfYear[date.getMonth()]} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
  }

  getPlayerEmpireCenter (game, player) {
    // Get all of the player's stars.
    let playerStars = this.getStarsOwnedByPlayer(player, game.galaxy.stars)

    if (!playerStars.length) {
      return null
    }

    // Work out the center point of all stars
    let centerX = playerStars.reduce((sum, s) => sum + s.location.x, 0) / playerStars.length
    let centerY = playerStars.reduce((sum, s) => sum + s.location.y, 0) / playerStars.length

    return {
      x: centerX,
      y: centerY
    }
  }

  getGamePlayerShapesCount (game) {
    return new Set([...game.galaxy.players.map(p => p.shape)]).size
  }
}

export default new GameHelper()
