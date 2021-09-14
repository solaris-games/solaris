import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'
import TextureService from './texture'

class Carrier extends EventEmitter {

  static culling_margin = 16

  static zoomLevel = 140

  constructor ( pathManager ) {
    super()

    this.container = new PIXI.Container()
    this.fixedContainer = new PIXI.Container() // this container isnt affected by culling or user setting scalling
    this.container.interactive = true
    this.container.interactiveChildren = false
    this.container.buttonMode = true

    this.graphics_colour = new PIXI.Graphics()
    this.graphics_selected = new PIXI.Graphics()
    this.graphics_ship = new PIXI.Graphics()

    this.container.addChild(this.graphics_colour)
    this.container.addChild(this.graphics_selected)
    this.container.addChild(this.graphics_ship)

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.pathManager = pathManager
    this.sharedPathsIDs = Array()
    this.uniquePaths = Array()

    this.isMouseOver = false
    this.zoomPercent = 100
  }

  setup (data, userSettings, stars, player, lightYearDistance) {
    this.data = data
    this.stars = stars
    this.player = player
    this.colour = player.colour.value
    this.lightYearDistance = lightYearDistance

    this.container.position.x = data.location.x
    this.container.position.y = data.location.y
    // Add a larger hit radius so that the star is easily clickable
    this.container.hitArea = new PIXI.Circle(0, 0, 10)

    this.userSettings = userSettings

    this.clampedScaling = this.userSettings.map.objectsScaling == 'clamped'
    this.baseScale = 1
    this.minScale = this.userSettings.map.objectsMinimumScale/4.0
    this.maxScale = this.userSettings.map.objectsMaximumScale/4.0

    Carrier.zoomLevel = userSettings.map.zoomLevels.carrierShips

    this.clearPaths() // clear on setup since this is used to reset waypoints
    this.enableInteractivity()
  }

  draw () {
    this.drawColour()
    this.drawSelectedCircle()
    this.drawCarrier()
    this.drawShips()
    this.drawSpecialist()
    this.drawCarrierWaypoints()
  }

  drawActive () {
    this.drawShips()
  }

  drawShape() {
    switch(this.player.shape) {
      case 'circle':
        this._drawShapeCircle()
        return
      case 'square':
        this._drawShapeSquare()
        return
      case 'hexagon':
        this._drawShapeHexagon()
        return
      case 'diamond':
        this._drawShapeDiamond()
        return
    }

    this._rotateCarrierTowardsWaypoint(this.graphics_colour)
  }

  drawColour () {
    this.graphics_colour.clear()

    if (!this.data.orbiting) {
      this.graphics_colour.lineStyle(1, this.colour)
      this.drawShape();
    }
  }

  drawCarrier () {
    this.graphics_ship.clear()

    // this.graphics_ship.lineStyle(0.3, 0x000000)
    this.graphics_ship.beginFill(0xFFFFFF)

    // Draw normal carrier
    this.graphics_ship.moveTo(0, 0 - 4)
    this.graphics_ship.lineTo(0 + 1.5, 0 + 1)
    this.graphics_ship.lineTo(0 + 3, 0 + 2)
    this.graphics_ship.lineTo(0 + 1, 0 + 2)
    this.graphics_ship.lineTo(0 + 0, 0 + 3)
    this.graphics_ship.lineTo(0 + -1, 0 + 2)
    this.graphics_ship.lineTo(0 - 3, 0 + 2)
    this.graphics_ship.lineTo(0 - 1.5, 0 + 1)
    this.graphics_ship.lineTo(0, 0 - 4)
    this.graphics_ship.endFill()

    this.graphics_ship.pivot.set(0, 0)
    this.graphics_ship.scale.set(1)

    this._rotateCarrierTowardsWaypoint(this.graphics_ship)
  }

  drawShips () {
    if (this.text_ships) {
      this.container.removeChild(this.text_ships)
      this.text_ships = null
    }

    if (!this.text_ships) {
      let totalShips = this.data.ships == null ? '???' : this.data.ships

      let shipsText = totalShips.toString()

      let bitmapFont = {fontName: "space-mono-bold", fontSize: 4}
      this.text_ships = new PIXI.BitmapText(shipsText, bitmapFont)

      this.text_ships.x = -(this.text_ships.width / 2.0)
      this.text_ships.y = 5

      this.container.addChild(this.text_ships)
      if( this.data.isGift ) {
        let style = new PIXI.TextStyle({
          fontFamily: `'Space Mono', monospace`,
          fill: 0xFFFFFF,
          padding: 3,
          fontSize: 4,
          fontWeight: 'bold'
        })
        let giftText = new PIXI.Text('🎁', style)
        giftText.resolution = 12
        giftText.position.x = this.text_ships.width
        giftText.position.y = -1
        this.text_ships.addChild(giftText)
      }
    }
  }

  drawSpecialist () {
    if (!this.hasSpecialist() || this.data.orbiting) {
      return
    }

    let specialistTexture = TextureService.getSpecialistTexture(this.data.specialistId, true)
    let specialistSprite = new PIXI.Sprite(specialistTexture)
    specialistSprite.width = 6
    specialistSprite.height = 6
    specialistSprite.x = -3
    specialistSprite.y = -3

    this.container.addChild(specialistSprite)
  }

  hasSpecialist () {
    return this.data.specialistId && this.data.specialistId > 0
  }

  _drawShapeDiamond() {
    this.graphics_colour.moveTo(0, -5)
    this.graphics_colour.lineTo(5, 0)
    this.graphics_colour.lineTo(0, 5)
    this.graphics_colour.lineTo(-5, 0)
    this.graphics_colour.closePath()
  }

  _drawShapeCircle () {
    this.graphics_colour.drawCircle(0, 0, 4)
  }

  _drawShapeSquare () {
    this.graphics_colour.drawRect(-3.5, -3.5, 7, 7)
  }

  _drawShapeHexagon () {
    this.graphics_colour.moveTo(2, -3.5)
    this.graphics_colour.lineTo(-2, -3.5)
    this.graphics_colour.lineTo(-4, 0)
    this.graphics_colour.lineTo(-2, 3.5)
    this.graphics_colour.lineTo(2, 3.5)
    this.graphics_colour.lineTo(4, 0)
    this.graphics_colour.closePath()
  }

  _rotateCarrierTowardsWaypoint (graphics) {
    // If the carrier has waypoints, get the first one and calculate the angle
    // between the carrier's current position and the destination.
    if (this.data.waypoints.length) {
      let waypoint = this.data.waypoints[0]
      let starDestination = this.stars.find(s => s.data._id === waypoint.destination)

      if (!starDestination) {
        const sourceStar = this.stars.find(s => s.data._id === waypoint.source)
        if (!sourceStar) {
          return
        }

        const angle = this.getAngleTowardsLocation(this.data.location, sourceStar.data.location)
        graphics.angle = (angle * (180 / Math.PI)) - 90
        return
      }

      let destination = starDestination.data.location

      let angle = this.getAngleTowardsLocation(this.data.location, destination)

      graphics.angle = (angle * (180 / Math.PI)) + 90
    }
  }

  clearPaths() {
    for(let path of this.uniquePaths) {
      this.pathManager.removeUniquePath(path)
    }
    for(let pathID of this.sharedPathsIDs) {
      this.pathManager.removeSharedPath(pathID, this)
    }
    this.uniquePaths = Array()
    this.sharedPathsIDs = Array()
  }

  _isSourceLastDestination() {
    let numof_waypoints = this.data.waypoints.length
    let lastWaypoint = this.data.waypoints[numof_waypoints-1]
    if (numof_waypoints<2) return false;
    return (this.data.waypoints[0].source === lastWaypoint.destination)
  }

  drawCarrierWaypoints () {
    this.clearPaths()

    const PATH_WIDTH = 0.5*this.userSettings.map.carrierPathWidth

    let lineWidth = this.data.waypointsLooped ? PATH_WIDTH : PATH_WIDTH
    let lineAlpha = this.data.waypointsLooped ? 0.3 : 0.5
    let lastPoint = this
    let sourceIsLastDestination = false
    sourceIsLastDestination = this._isSourceLastDestination()
    // if looping and source is last destination, begin drawing path from the star instead of carrier
    if ( this.data.waypointsLooped ) {
      if (sourceIsLastDestination)  {
        lastPoint = this.stars.find(s => s.data._id === this.data.waypoints[0].source)
      }
    }
    let star
    for (let i = 0; i < this.data.waypoints.length; i++) {
      let waypoint = this.data.waypoints[i]
      // Draw a line to each destination along the waypoints.
      star = this.stars.find(s => s.data._id === waypoint.destination)
      if (!star) { break; }

      if ( this.data.waypointsLooped ) {
        if (lastPoint === this) {
          this.uniquePaths.push( this.pathManager.addUniquePath( lastPoint, star, true, this.colour ) )
        }
        else {
          this.sharedPathsIDs.push( this.pathManager.addSharedPath( lastPoint, star, this ) )
        }
      }
      else {
        this.uniquePaths.push( this.pathManager.addUniquePath( lastPoint, star, false, this.colour ) )
      }

      lastPoint = star
    }
    //draw path back to the first destination
    if ( this.data.waypointsLooped ) {
      if (!sourceIsLastDestination && this.data.waypoints && this.data.waypoints.length) {
        let firstPoint = this.stars.find(s => s.data._id === this.data.waypoints[0].destination)
        if( firstPoint && lastPoint && firstPoint !== lastPoint ) {
          this.sharedPathsIDs.push( this.pathManager.addSharedPath( star, firstPoint, this ) )
        }
      }
    }
  }

  drawSelectedCircle () {
    this.graphics_selected.clear()

    if (this.isSelected) {
      this.graphics_selected.lineStyle(0.5, 0xFFFFFF)
      this.graphics_selected.alpha = 0.3
      this.graphics_selected.drawCircle(0, 0, 15)
    }
  }

  enableInteractivity() {
    // Can only be interactive if its in transit
    if (!this.data.orbiting) {
      this.container.interactive = true
      this.container.buttonMode = true
    } else {
      this.container.interactive = false
      this.container.buttonMode = false
    }
  }

  disableInteractivity() {
    this.container.interactive = false
    this.container.buttonMode = false
  }

  onZoomChanging(zoomPercent) {
   this.zoomPercent = zoomPercent
   this.setScale(zoomPercent)
   this.updateVisibility()//TODO see how this behaves on mobile - does it updated when pinching or only when pinching stops?
  }

  setScale( zoomPercent ) {
    if(this.clampedScaling) {
      let currentScale = zoomPercent/100
      if (currentScale < this.minScale) {
        this.container.scale.x = (1/currentScale)*this.minScale
        this.container.scale.y = (1/currentScale)*this.minScale
      } else if (currentScale > this.maxScale) {
        this.container.scale.x = (1/currentScale)*this.maxScale
        this.container.scale.y = (1/currentScale)*this.maxScale
      }
      else {
        this.container.scale.x = this.baseScale
        this.container.scale.y = this.baseScale
      }
    }
    else {
      this.container.scale.x = this.baseScale
      this.container.scale.y = this.baseScale
    }
  }

  onClicked (e) {
    if (e && e.data && e.data.originalEvent && e.data.originalEvent.button === 2) {
      this.emit('onCarrierRightClicked', this.data)
    } else {
      let eventData = e ? e.data : null

      this.emit('onCarrierClicked', {carrierData: this.data, eventData})

      // Need to do this otherwise sometimes text gets highlighted.
      this.deselectAllText()
    }
  }

  updateVisibility() {

    if (this.graphics_ship) this.graphics_ship.visible = !this.data.orbiting && !this.hasSpecialist()
    if (this.text_ships) this.text_ships.visible = !this.data.orbiting && (this.zoomPercent >= Carrier.zoomLevel || (this.isSelected && this.zoomPercent > Carrier.zoomLevel ) || (this.isMouseOver && this.zoomPercent > Carrier.zoomLevel))
  }

  deselectAllText () {
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
  }

  onMouseOver (e) {
    this.isMouseOver = true

    this.emit('onCarrierMouseOver', this.data)
  }

  onMouseOut (e) {
    this.isMouseOver = false

    this.emit('onCarrierMouseOut', this.data)
  }

  getAngleTowardsLocation (source, destination) {
    let deltaX = destination.x - source.x
    let deltaY = destination.y - source.y

    return Math.atan2(deltaY, deltaX)
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent
  }

  cleanupEventHandlers () {
    this.container.off('pointerup', this.onClicked.bind(this))
    this.container.off('mouseover', this.onMouseOver.bind(this))
    this.container.off('mouseout', this.onMouseOut.bind(this))
  }

  destroy () {
    this.container.destroy()
    this.fixedContainer.destroy()
  }

  select () {
    this.isSelected = true
    this.drawSelectedCircle()
  }

  unselect () {
    this.isSelected = false
    this.drawSelectedCircle()
  }

  toggleSelected () {
    this.isSelected = !this.isSelected
    this.drawSelectedCircle()
  }
}

export default Carrier
