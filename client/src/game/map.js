import * as PIXI from 'pixi.js'
import gameContainer from './container'
import Star from './star'
import Carrier from './carrier'
import Waypoints from './waypoints'
import EventEmitter from 'events'
import GameHelper from '../services/gameHelper'

class Map extends EventEmitter {

  // Represents the current game mode, these are as follows:
  // galaxy - Normal galaxy view
  // waypoints - Displays waypoints overlay for a given carrier
  mode = 'galaxy'

  constructor (app) {
    super()

    this.app = app
    this.container = new PIXI.Container()

    this.stars = []
    this.carriers = []
  }

  _setupContainers () {
    this.starContainer = new PIXI.Container()
    this.carrierContainer = new PIXI.Container()
    this.waypointContainer = new PIXI.Container()

    this.container.addChild(this.starContainer)
    this.container.addChild(this.carrierContainer)
    this.container.addChild(this.waypointContainer)
  }

  setup (game) {
    // Cleanup events
    this.stars.forEach(s => s.removeAllListeners())
    this.carriers.forEach(s => s.removeAllListeners())

    this.container.removeChildren()
    this._setupContainers()

    // Reset the canvas
    this.stars = []
    this.carriers = []

    // Add stars
    for (let i = 0; i < game.galaxy.stars.length; i++) {
      this.setupStar(game, game.galaxy.stars[i])
    }

    // Add carriers
    for (let i = 0; i < game.galaxy.carriers.length; i++) {
      this.setupCarrier(game, game.galaxy.carriers[i])
    }

    if (this.waypoints) {
      this.waypoints.removeAllListeners()
    }

    this.waypoints = new Waypoints()
    this.waypoints.setup(game)
    this.waypoints.onWaypointCreatedHandler = this.waypoints.on('onWaypointCreated', this.onWaypointCreated.bind(this))

    this.waypointContainer.addChild(this.waypoints.container)
  }

  setupStar (game, starData) {
    let star = this.stars.find(x => x.data._id === starData._id)

    if (!star) {
      star = new Star(this.app)
      this.stars.push(star)

      this.starContainer.addChild(star.container)
      
      star.on('onStarClicked', this.onStarClicked.bind(this))
    }

    star.setup(starData, game.galaxy.players, game.galaxy.carriers, game.constants.distances.lightYear)

    return star
  }

  setupCarrier (game, carrierData) {
    let existing = this.carriers.find(x => x.data._id === carrierData._id)

    if (existing) {
      existing.off('onCarrierClicked', this.onCarrierClicked.bind(this))
      existing.off('onCarrierMouseOver', this.onCarrierMouseOver.bind(this))
      existing.off('onCarrierMouseOut', this.onCarrierMouseOut.bind(this))

      this.carrierContainer.removeChild(existing.container)

      this.carriers.splice(this.carriers.indexOf(existing), 1)
    }

    let carrier = new Carrier()
    let player = GameHelper.getPlayerById(game, carrierData.ownedByPlayerId)

    carrier.setup(carrierData, this.stars, player.colour.value)

    this.carriers.push(carrier)

    this.carrierContainer.addChild(carrier.container)

    carrier.on('onCarrierClicked', this.onCarrierClicked.bind(this))
    carrier.on('onCarrierMouseOver', this.onCarrierMouseOver.bind(this))
    carrier.on('onCarrierMouseOut', this.onCarrierMouseOut.bind(this))

    return carrier
  }

  draw (zoomPercent) {
    this.drawStars(zoomPercent)
    this.drawCarriers()

    if (this.mode === 'waypoints') {
      this.drawWaypoints()
    } else {
      this.clearWaypoints()
    }
  }

  reloadGame (game, zoomPercent) {
    // Update all of the stars.
    for (let i = 0; i < game.galaxy.stars.length; i++) {
      let starData = game.galaxy.stars[i]
      let existing = this.stars.find(x => x.data._id === starData._id)

      existing.setup(starData, game.galaxy.players, game.galaxy.carriers, game.constants.distances.lightYear)
      existing.draw(zoomPercent)
    }

    // Remove any carriers that have been destroyed and add new ones that have been built.
    for (let i = 0; i < game.galaxy.carriers.length; i++) {
      let carrierData = game.galaxy.carriers[i]

      let existing = this.carriers.find(x => x.data._id === carrierData._id)

      if (existing) {
        let player = GameHelper.getPlayerById(game, carrierData.ownedByPlayerId)

        existing.setup(carrierData, this.stars, player.colour.value)
      } else {
        existing = this.setupCarrier(game, carrierData)
      }

      existing.draw()
    }
  }

  setMode (mode, args, zoomPercent) {
    this.mode = mode
    this.modeArgs = args

    this.draw(zoomPercent)
  }

  resetMode (zoomPercent) {
    this.mode = 'galaxy'

    this.draw(zoomPercent)
  }

  drawStars (zoomPercent) {
    for (let i = 0; i < this.stars.length; i++) {
      let star = this.stars[i]

      this.drawStar(star, zoomPercent)
    }
  }

  drawStar (star, zoomPercent) {
    star.draw(zoomPercent)
  }

  drawCarriers () {
    for (let i = 0; i < this.carriers.length; i++) {
      let carrier = this.carriers[i]

      this.drawCarrier(carrier)
    }
  }

  drawCarrier (carrier) {
    carrier.draw()
  }

  undrawCarrier (carrierData) {
    let existing = this.carriers.find(x => x.data._id === carrierData._id)

    if (existing) {
      existing.off('onCarrierClicked', this.onCarrierClicked.bind(this))
      existing.off('onCarrierMouseOver', this.onCarrierMouseOver.bind(this))
      existing.off('onCarrierMouseOut', this.onCarrierMouseOut.bind(this))

      this.carrierContainer.removeChild(existing.container)

      this.carriers.splice(this.carriers.indexOf(existing), 1)
    }
  }

  drawWaypoints () {
    this.waypoints.draw(this.modeArgs)
  }

  clearWaypoints () {
    this.waypoints.clear()
  }

  zoomToPlayer (game, player) {
    // Find the home star the player owns.
    let homeStar = game.galaxy.stars.find(x => {
      return x._id === player.homeStarId
    })

    if (!homeStar) {
      return
    }

    gameContainer.viewport.fitWorld()
    gameContainer.viewport.zoom(-gameContainer.viewport.worldWidth, true)
    gameContainer.viewport.moveCenter(homeStar.location.x, homeStar.location.y)

    let starObject = this.stars.find(s => s.data._id === homeStar._id)
    
    let zoomPercent = gameContainer.getViewportZoomPercentage()
    starObject.refreshZoom(zoomPercent)
  }

  zoomToUser (game) {
    let player = GameHelper.getUserPlayer(game)

    if (!player) {
      return
    }

    this.zoomToPlayer(game, player)
  }

  zoomToStar (star) {
    this.zoomToLocation(star.location)
    
    let starObject = this.stars.find(s => s.data._id === star._id)

    let zoomPercent = gameContainer.getViewportZoomPercentage()
    starObject.refreshZoom(zoomPercent)
  }

  zoomToLocation (location) {
    gameContainer.viewport.fitWorld()
    gameContainer.viewport.zoom(-gameContainer.viewport.worldWidth, true)
    gameContainer.viewport.moveCenter(location.x, location.y)
  }

  clickStar (starId) {
    let star = this.stars.find(s => s.data._id === starId)

    star.onClicked()
  }

  clickCarrier (carrierId) {
    let carrier = this.carriers.find(s => s.data._id === carrierId)

    carrier.onClicked()
  }

  unselectAllStars () {
    this.stars
    .forEach(s => {
      s.isSelected = false
      s.drawActive(false) // Should be fine to pass in false for force
    })
  }

  unselectAllStarsExcept (star) {
    this.stars
      .filter(s => s.isSelected || s.data._id === star.data._id) // Get only stars that are selected or the e star.
      .forEach(s => {
        // Set all other stars to unselected.
        if (s.data._id !== star.data._id) {
          s.isSelected = false
        }

        s.drawActive(false) // Should be fine to pass in false for the force param
      })
  }

  onStarClicked (e) {
    // Clicking stars should only raise events to the UI if in galaxy mode.
    if (this.mode === 'galaxy') {
      let selectedStar = this.stars.find(x => x.data._id === e._id)
      selectedStar.isSelected = true
      
      this.unselectAllStarsExcept(selectedStar)
  
      if (!this.tryMultiSelect(e.location)) {
        this.emit('onStarClicked', e)
      }
    } else if (this.mode === 'waypoints') {
      this.waypoints.onStarClicked(e)
    }
  }

  onCarrierClicked (e) {
    // Clicking carriers should only raise events to the UI if in galaxy mode.
    if (this.mode === 'galaxy') {
      this.unselectAllStars()

      if (!this.tryMultiSelect(e.location)) {
        this.emit('onCarrierClicked', e)
      }
    } else if (this.mode === 'waypoints') {
      this.waypoints.onCarrierClicked(e)
    }
  }

  onCarrierMouseOver (e) {
    // If the carrier is orbiting something then send the mouse over event
    // to the star.
    if (e.orbiting) {
      let star = this.stars.find(s => s.data._id === e.orbiting)
      star.onMouseOver()
    }
  }

  onCarrierMouseOut (e) {
    // If the carrier is orbiting something then send the mouse over event
    // to the star.
    if (e.orbiting) {
      let star = this.stars.find(s => s.data._id === e.orbiting)
      star.onMouseOut()
    }
  }

  onWaypointCreated (e) {
    this.emit('onWaypointCreated', e)
  }

  tryMultiSelect (location) {
    // See if there are any other objects close by, if so then
    // we want to allow the user to select which one they want as there might be 
    // objects on the map that are on top of eachother or very close together.
    const distance = 10
    
    let closeStars = this.stars
      .map(s => {
        return {
          type: 'star',
          distance: GameHelper.getDistanceBetweenLocations(location, s.data.location),
          data: s.data
        }
      })
      .filter(s => s.distance <= distance);

    let closeCarriers = this.carriers
      .map(s => {
        return {
          type: 'carrier',
          distance: GameHelper.getDistanceBetweenLocations(location, s.data.location),
          data: s.data
        }
      })
      .filter(s => s.distance <= distance);

    // Combine the arrays and order by closest first.
    let closeObjects = closeStars.concat(closeCarriers)
      .sort((a, b) => a.distance - b.distance)

    if (closeObjects.length > 1) {
      this.emit('onObjectsClicked', closeObjects)

      return true
    }

    return false
  }

  refreshZoom (zoomPercent) {
    this.stars.forEach(s => s.refreshZoom(zoomPercent))
  }

}

export default Map
