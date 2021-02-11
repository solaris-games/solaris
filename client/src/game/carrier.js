import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'
import TextureService from './texture'

class Carrier extends EventEmitter {

  static culling_margin = 16

  constructor () {
    super()

    this.container = new PIXI.Container()
    this.fixedContainer = new PIXI.Container() // this container isnt affected by culling or user setting scalling
    this.container.interactive = true
    this.container.buttonMode = true

    this.graphics_colour = new PIXI.Graphics()
    this.graphics_ship = new PIXI.Graphics()
    this.graphics_waypoints = new PIXI.Graphics()

    this.container.addChild(this.graphics_colour)
    this.container.addChild(this.graphics_ship)
    this.fixedContainer.addChild(this.graphics_waypoints)

    // TODO: Make sure these events are unsubscribed (use .off and see CarrierWaypoints.vue as an example)
    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.isMouseOver = false
    this.zoomPercent = 0
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
  }

  draw () {
    this.drawColour()
    this.drawShip()
    this.drawGarrison()
    this.drawSpecialist()
    this.drawCarrierWaypoints()
  }

  drawActive () {
    this.drawGarrison()
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

  drawShip () {
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

  drawGarrison () {
    if (this.text_garrison) {
      this.text_garrison.texture.destroy(true)
      this.container.removeChild(this.text_garrison)
      this.text_garrison = null
    }

    if (!this.text_garrison) {
      let style = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3,
        fontSize: 4,
        fontWeight: 'bold'
      })

      let totalGarrison = this.data.ships == null ? '???' : this.data.ships
      
      let garrisonText = totalGarrison.toString() + (this.data.isGift ? '🎁' : '')

      this.text_garrison = new PIXI.Text(garrisonText, style)
      this.text_garrison.resolution = 10

      this.text_garrison.x = -(this.text_garrison.width / 2)
      this.text_garrison.y = 5

      this.container.addChild(this.text_garrison)
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
        return
      }

      let destination = starDestination.data.location

      let angle = this.getAngleTowardsLocation(this.data.location, destination)

      graphics.angle = (angle * (180 / Math.PI)) + 90
    }
  }

  drawCarrierWaypoints () {
    this.graphics_waypoints.clear()

    let lineWidth = this.data.waypointsLooped ? 1 : 2
    let lineAlpha = this.data.waypointsLooped ? 0.2 : 0.4

    this.graphics_waypoints.moveTo(this.data.location.x, this.data.location.y)
    this.graphics_waypoints.lineStyle(lineWidth, this.colour, lineAlpha)
    this.graphics_waypoints._lineStyle.cap = PIXI.LINE_CAP.ROUND

    for (let i = 0; i < this.data.waypoints.length; i++) {
      let waypoint = this.data.waypoints[i]

      // Draw a line to each destination along the waypoints.
      let star = this.stars.find(s => s.data._id === waypoint.destination)

      if (!star) {
        break
      }
      
      this.graphics_waypoints.lineTo(star.data.location.x, star.data.location.y)
    }
  }

  enableInteractivity() {
   this.container.interactive = true
   this.container.buttonMode = true
  }

  disableInteractivity() {
    this.container.interactive = false
    this.container.buttonMode = false
  }

  onTick( deltaTime, zoomPercent, viewportData) {
   let deltax = Math.abs(viewportData.center.x - this.data.location.x) - Carrier.culling_margin
   let deltay = Math.abs(viewportData.center.y - this.data.location.y) - Carrier.culling_margin

   if ((deltax > viewportData.xradius) || (deltay > viewportData.yradius)) {
     //cannot set parent container visibility, since waypoints lines stretch away from carrier location
     // maybe put waypoints on its own container, since this piece of code should remain as small as possible
     this.graphics_colour.visible = false
     this.graphics_ship.visible = false
     if (this.text_garrison) this.text_garrison.visible = false
   } 
   else {
     this.graphics_colour.visible = true
     if (this.text_garrison) this.text_garrison.visible = true
     this.updateVisibility()
     this.setScale(zoomPercent)
   }
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
    let displayTextZoom = 150

    this.graphics_ship.visible = !this.data.orbiting && !this.hasSpecialist()
    this.text_garrison.visible = !this.data.orbiting && (this.zoomPercent > displayTextZoom || (this.isSelected && this.zoomPercent > displayTextZoom ) || (this.isMouseOver && this.zoomPercent > displayTextZoom))
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
}

export default Carrier
