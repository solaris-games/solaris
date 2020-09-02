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

  getHyperspaceDistance (game, hyperspace) {
    return ((hyperspace || 1) + 1.5) * game.constants.distances.lightYear
  }

  getDistanceBetweenLocations (loc1, loc2) {
    let xs = loc2.x - loc1.x
    let ys = loc2.y - loc1.y

    xs *= xs
    ys *= ys

    return Math.sqrt(xs + ys)
  }

  getTicksBetweenLocations (game, locs, tickDistanceModifier = 1) {
    let totalTicks = 0
    let tickDistance = game.constants.distances.shipSpeed * tickDistanceModifier

    for (let i = 1; i < locs.length; i++) {
      let prevLoc = locs[i - 1]
      let currLoc = locs[i]

      let distance = this.getDistanceBetweenLocations(prevLoc, currLoc)

      let ticks = Math.ceil(distance / tickDistance)

      totalTicks += ticks
    }

    return totalTicks
  }

  getCountdownTimeString (game, date) {
    if (date == null) {
      return 'Unknown'
    }

    let relativeTo = moment().utc()
    let t = moment(date).utc() - relativeTo // Deduct the future date from now.

    return this.getDateToString(t)
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
      ticks = this.getTicksBetweenLocations(game, [source, destination], 3) // TODO: Need a constant here
    } else {
      ticks = this.getTicksBetweenLocations(game, [source, destination])
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
    let hyperspaceDistance = this.getHyperspaceDistance(game, player.research.hyperspace.level)

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
}

export default new GameHelper()
