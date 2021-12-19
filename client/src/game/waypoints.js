import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'
import GameHelper from '../services/gameHelper'

class Waypoints extends EventEmitter {
  constructor() {
    super()

    this.container = new PIXI.Container()
  }

  setup(game) {
    this.game = game
    this.lightYearDistance = game.constants.distances.lightYear
  }

  clear() {
    this.container.removeChildren()
  }

  draw(carrier) {
    this.clear()

    this.carrier = carrier

    this.drawHyperspaceRange()
    this.drawLastWaypoint()
    this.drawNextWaypoints()
    this.drawPaths()
  }

  drawLastWaypoint() {
    // If there are no waypoints at all
    // then deem the current location as the waypoint.
    let lastLocation = this._getLastLocation()

    // Draw a big selected highlight around the last waypoint.
    this._highlightStarLocation(lastLocation, 0.8)
  }

  drawNextWaypoints() {
    // Draw all of the available waypoints that the last waypoint can reach.
    let lastLocation = this._getLastLocation()
    let userPlayer = this.game.galaxy.players.find(p => p.userId)

    // Calculate which stars are in reach and draw highlights around them
    const hyperspaceDistance = GameHelper.getHyperspaceDistance(this.game, userPlayer, this.carrier)

    for (let i = 0; i < this.game.galaxy.stars.length; i++) {
      let s = this.game.galaxy.stars[i]

      let distance = GameHelper.getDistanceBetweenLocations(lastLocation, s.location)

      if (distance <= hyperspaceDistance) {
        this._highlightStarLocation(s.location, 0.3)
      }
    }

    // Pirate extra targets
    if (this._canTargetCarrier()) {
      for (let i = 0; i < this.game.galaxy.carriers.length; i++) {
        let c = this.game.galaxy.carriers[i]

        if (c.orbiting) {
          continue
        }

        if (this._ignoresCombat(c) || c.isGift) {
          continue
        }

        let distance = GameHelper.getDistanceBetweenLocations(lastLocation, c.location)

        if (distance <= hyperspaceDistance) {
          this._highlightCarrierLocation(c.location, 0.6)
        }
      }
    }
  }

  drawPaths() {
    if (!this.carrier.waypoints.length) {
      return
    }

    // Draw all paths to each waypoint the carrier currently has.
    // Start with the first waypoint's source location and then
    // go through each waypoint draw a line to their destinations.

    let graphics = new PIXI.Graphics()

    // Start the line from where the carrier currently is.
    let star

    graphics.moveTo(this.carrier.location.x, this.carrier.location.y)
    graphics.lineStyle(1, 0xFFFFFF, 0.8)

    // Draw a line to each destination along the waypoints.
    for (let i = 0; i < this.carrier.waypoints.length; i++) {
      let waypoint = this.carrier.waypoints[i]
      star = waypoint.isCarrier ? this.game.galaxy.carriers.find(c => c._id === waypoint.targetId) : this.game.galaxy.stars.find(s => s._id === waypoint.targetId)

      graphics.lineTo(star.location.x, star.location.y)
    }

    this.container.addChild(graphics)
  }

  drawHyperspaceRange() {
    let graphics = new PIXI.Graphics()
    // TODO: This is causing errors when a star is revealed in dark mode.
    let lastLocationStar = this._getLastLocationStar()
    let player = this.game.galaxy.players.find(p => p.userId)

    // TODO: Use the game helper instead?
    let techLevel = player.research.hyperspace.level

    if (this.carrier.specialist && this.carrier.specialist.modifiers.local) {
      techLevel += this.carrier.specialist.modifiers.local.hyperspace || 0
    }

    techLevel = Math.max(1, techLevel)

    let radius = ((techLevel || 1) + 1.5) * this.lightYearDistance

    graphics.lineStyle(1, player.colour.value, 0.2)
    graphics.beginFill(player.colour.value, 0.15)
    graphics.drawStar(lastLocationStar.location.x, lastLocationStar.location.y, radius, radius, radius - 3)
    graphics.endFill()

    this.container.addChild(graphics)
  }

  _highlightStarLocation(location, opacity) {
    let graphics = new PIXI.Graphics()
    let radius = 12

    graphics.lineStyle(1, 0xFFFFFF, opacity)
    graphics.drawStar(location.x, location.y, radius, radius, radius - 3)

    this.container.addChild(graphics)
  }

  _highlightCarrierLocation(location, opacity) {
    let graphics = new PIXI.Graphics()
    let radius = 10

    graphics.lineStyle(1, 0xFFFFFF, opacity)
    graphics.drawStar(location.x, location.y, radius, radius, radius - 3)

    this.container.addChild(graphics)
  }

  onStarClicked(e) {
    if (!this.carrier) {
      return
    }

    this._createStarWaypoint(e.location, e._id)
  }

  onCarrierClicked(e) {
    if (!this._canTargetCarrier()) {
      return
    }
    if (!this.carrier) {
      return
    }

    this._createCarrierWaypoint(e.location, e._id)
  }

  _canTargetCarrier() {
    return this.carrier.specialist && this.carrier.specialist.modifiers.special && this.carrier.specialist.modifiers.special.targetCarriers
  }

  _ignoresCombat(carrier) {
    if (!this.game.settings.specialGalaxy.carrierToCarrierCombat) {
      return true
    }
    return carrier.specialist && carrier.specialist.modifiers.special && carrier.specialist.modifiers.special.avoidCombatCarrierToCarrier
  }

  _createStarWaypoint(desiredLocation, starId) {
    // If the star that was clicked is within hyperspace range then append
    // a new waypoint to this star.
    let userPlayer = this.game.galaxy.players.find(p => p.userId)

    const hyperspaceDistance = GameHelper.getHyperspaceDistance(this.game, userPlayer, this.carrier)

    const lastLocationStar = this._getLastLocationStar()
    const lastLocation = lastLocationStar == null ? null : lastLocationStar.location

    const distance = GameHelper.getDistanceBetweenLocations(lastLocation, desiredLocation)

    let canCreateWaypoint = distance <= hyperspaceDistance

    if (!canCreateWaypoint && lastLocationStar && lastLocationStar.wormHoleToStarId) {
      const wormHolePairStar = GameHelper.getStarById(this.game, lastLocationStar.wormHoleToStarId)

      canCreateWaypoint = wormHolePairStar && wormHolePairStar._id === starId
    }

    if (canCreateWaypoint) {
      let newWaypoint = {
        destination: starId,
        isCarrier: false,
        action: 'collectAll',
        actionShips: 0,
        delayTicks: 0
      }

      // If the carrier has waypoints, create a new waypoint from the last destination.
      if (this.carrier.waypoints.length) {
        const lastWaypoint = this._getLastWaypoint()

        // // The waypoint cannot be the same as the previous waypoint.
        // if (newWaypoint.destination === lastWaypoint.destination) {
        //   return
        // }

        newWaypoint.source = lastWaypoint.destination
      } else { // Otherwise use the current orbiting star
        newWaypoint.source = this.carrier.orbiting
      }

      this.carrier.waypoints.push(newWaypoint)

      this.draw(this.carrier)

      this.emit('onWaypointCreated', newWaypoint)
    }
  }

  _createCarrierWaypoint(desiredLocation, carrierId) {
    // If the carrier that was clicked is within hyperspace range then append
    // a new waypoint to this carrier.
    let userPlayer = this.game.galaxy.players.find(p => p.userId)

    const hyperspaceDistance = GameHelper.getHyperspaceDistance(this.game, userPlayer, this.carrier)

    const lastLocationStar = this._getLastLocationStar()
    const lastLocation = lastLocationStar == null ? null : lastLocationStar.location

    const distance = GameHelper.getDistanceBetweenLocations(lastLocation, desiredLocation)

    let canCreateWaypoint = distance <= hyperspaceDistance

    if (canCreateWaypoint) {
      let newWaypoint = {
        destination: carrierId,
        isCarrier: true,
        action: 'collectAll',
        actionShips: 0,
        delayTicks: 0
      }

      if (this.carrier.waypoints.length) {
        const lastWaypoint = this._getLastWaypoint()

        // // The waypoint cannot be the same as the previous waypoint.
        // if (newWaypoint.destination === lastWaypoint.destination) {
        //   return
        // }

        newWaypoint.source = lastWaypoint.destination
      } else { // Otherwise use the current orbiting star
        newWaypoint.source = this.carrier.orbiting
      }

      this.carrier.waypoints.push(newWaypoint)

      this.draw(this.carrier)

      this.emit('onWaypointCreated', newWaypoint)
    }
  }

  _getLastWaypoint() {
    return this.carrier.waypoints[this.carrier.waypoints.length - 1]
  }

  _getLastLocation() {
    let lastLocationStar = this._getLastLocationStar()

    if (lastLocationStar) {
      return lastLocationStar.location
    }

    return null
  }

  _getLastLocationStar() {
    if (this.carrier.waypoints.length) {
      let lastWaypointStarId = this.carrier.waypoints[this.carrier.waypoints.length - 1].destination

      let target = this.game.galaxy.stars.find(s => s._id === lastWaypointStarId)
      if (target) return target
      return this.game.galaxy.carriers.find(c => c._id === lastWaypointStarId)
    } else {
      return this.game.galaxy.stars.find(s => s._id === this.carrier.orbiting)
    }
  }
}

export default Waypoints
