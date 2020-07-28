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
    return carrier.waypoints.indexOf(waypoint) === 0
        && this.isCarrierInTransit(carrier) 
        && carrier.inTransitFrom === waypoint.source
        && carrier.inTransitTo === waypoint.destination
  }

  getHyperspaceDistance (game, hyperspace) {
    return ((hyperspace || 1) + 3) * game.constants.distances.lightYear
  }

  getDistanceBetweenLocations (loc1, loc2) {
    let xs = loc2.x - loc1.x,
        ys = loc2.y - loc1.y

    xs *= xs
    ys *= ys

    return Math.sqrt(xs + ys)
  }

  getCountdownTimeString (game, date) {
    if (date == null) {
      return 'Unknown'
    }
    
    let relativeTo = moment().utc()
    let t = moment(date).utc() - relativeTo // Deduct the future date from now.

    let days = Math.floor(t / (1000 * 60 * 60 * 24))
    let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
    let secs = Math.floor((t % (1000 * 60)) / 1000)

    if (secs < 0) {
      return 'Pending...'
    }

    let str = ''
    let showDays = false,
      showHours = false

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
  calculateWaypointTicks(game, carrier, waypoint) {
    let source = game.galaxy.stars.find(x => x._id === waypoint.source).location
    let destination = game.galaxy.stars.find(x => x._id === waypoint.destination).location

    // If the carrier is already en-route, then the number of ticks will be relative
    // to where the carrier is currently positioned.
    if (!carrier.orbiting && carrier.waypoints[0]._id === waypoint._id) {
        source = carrier.location
    }

    let distance = this.getDistanceBetweenLocations(source, destination)

    let tickDistance = game.constants.distances.shipSpeed

    // If the carrier is moving between warp gates then
    // the tick distance is x3
    if (source.warpGate && destination.warpGate
        && source.ownedByPlayerId && destination.ownedByPlayerId) {
            tickDistance *= 3
        }

    let ticks = Math.ceil(distance / tickDistance)

    return ticks
  }

  calculateWaypointTicksEta(game, carrier, waypoint) {
    let totalTicks = 0

    for (let i = 0; i < carrier.waypoints.length; i++) {
        let cwaypoint = carrier.waypoints[i]
        
        totalTicks += this.calculateWaypointTicks(game, carrier, waypoint);

        if (cwaypoint === waypoint) {
            break
        }
    }

    return totalTicks
  }

  calculateTimeByTicks(ticks, speedInMins, relativeTo = null) {
    if (relativeTo == null) {
        relativeTo = moment().utc();
    } else {
        relativeTo = moment(relativeTo).utc();
    }

    return relativeTo.add(ticks * speedInMins, 'm');
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
  
}

export default new GameHelper()
