
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

  getStarOwningPlayer (game, star) {
    return game.galaxy.players.find(x => x._id === star.ownedByPlayerId)
  }

  getCarrierOwningPlayer (game, carrier) {
    return game.galaxy.players.find(x => x._id === carrier.ownedByPlayerId)
  }

  getCarrierOrbitingStar (game, carrier) {
    return game.galaxy.stars.find(x => x._id === carrier.orbiting)
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

  getHyperspaceDistance (hyperspace) {
    return ((hyperspace || 1) + 3) * 30 // TODO: Need a global constant for light year
  }

  getDistanceBetweenLocations (loc1, loc2) {
    let xs = loc2.x - loc1.x,
        ys = loc2.y - loc1.y

    xs *= xs;
    ys *= ys;

    return Math.sqrt(xs + ys)
  }

  getCountdownTimeString (date, relativeTo) {
    relativeTo = relativeTo || new Date()

    let t = new Date(date) - relativeTo

    let days = Math.floor(t / (1000 * 60 * 60 * 24))
    let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
    let secs = Math.floor((t % (1000 * 60)) / 1000)

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
}

export default new GameHelper()
