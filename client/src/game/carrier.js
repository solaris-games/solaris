import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'
import TextureService from './texture'
import gameHelper from '../services/gameHelper'

class Carrier extends EventEmitter {

  static culling_margin = 16

  constructor () {
    super()

    this.container = new PIXI.Container()
    this.fixedContainer = new PIXI.Container() // this container isnt affected by culling or user setting scalling
    this.pathContainer = new PIXI.Container()
    this.container.interactive = true
    this.container.buttonMode = true

    this.graphics_colour = new PIXI.Graphics()
    this.graphics_ship = new PIXI.Graphics()

    this.container.addChild(this.graphics_colour)
    this.container.addChild(this.graphics_ship)

    // TODO: Make sure these events are unsubscribed (use .off and see CarrierWaypoints.vue as an example)
    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.caps = Array()

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

  _clearPaths() {
    while( this.pathContainer.children[0]) {
      this.pathContainer.removeChild(this.pathContainer.children[0])
    }
    for( let cap of this.caps ) {
      let mapObject = cap.mapObject
      mapObject.container.removeChild(cap)
    }
  }

  _drawLoopedPathSegment(lineWidth,lineAlpha, objectA, objectB) {
      let pointA = objectA.data.location
      let pointB = objectB.data.location
      if( this.userSettings.map.carrierLoopStyle == 'solid' ) {
        this._drawRegularPathSegment(lineWidth/3.0, lineAlpha, objectA, objectB)
        return
      }
      const DASH_LENGTH = Math.min( Math.max(1, this.userSettings.map.carrierPathDashLength), 12 )//clamp 1-12
      const VOID_LENGTH = DASH_LENGTH/2.0
      const COMBINED_LENGTH = DASH_LENGTH+VOID_LENGTH

      let pathLength = gameHelper.getDistanceBetweenLocations(pointA,pointB)
      
      let dashCount = Math.floor( pathLength/(DASH_LENGTH+VOID_LENGTH) )
      let endpointsLength =  pathLength - (dashCount*(DASH_LENGTH+VOID_LENGTH))

      let initialX = (endpointsLength/2.0)+(VOID_LENGTH/2.0)
      let path = new PIXI.Graphics()

      path.moveTo(0, lineWidth)
      path.beginFill(this.colour, lineAlpha)
      path.lineTo(0, -lineWidth)
      path.lineTo(Math.max(initialX-VOID_LENGTH,0), -lineWidth)
      path.lineTo(Math.max(initialX-VOID_LENGTH,0), lineWidth)
      path.endFill()

      for( let i = 0; i<dashCount; i++ ) {
        path.moveTo(initialX+(i*COMBINED_LENGTH), lineWidth)
        path.beginFill(this.colour, lineAlpha)
        path.lineTo(initialX+(i*COMBINED_LENGTH), -lineWidth)
        path.lineTo(initialX+(i*COMBINED_LENGTH)+DASH_LENGTH, -lineWidth)
        path.lineTo(initialX+(i*COMBINED_LENGTH)+DASH_LENGTH, lineWidth)
        path.endFill()
      }

      path.moveTo(Math.min(initialX+(dashCount*COMBINED_LENGTH),pathLength), lineWidth)
      path.beginFill(this.colour, lineAlpha)
      path.lineTo(Math.min(initialX+(dashCount*COMBINED_LENGTH),pathLength), -lineWidth)
      path.lineTo(pathLength, -lineWidth)
      path.lineTo(pathLength, lineWidth)
      path.endFill()

      path.rotation = Math.atan2(pointB.y-pointA.y,pointB.x-pointA.x)
      path.position = pointA
      this.pathContainer.addChild(path)

      //TODO make line caps optional since they are barely visible and shit performance
      let cap1 = new PIXI.Graphics()
      cap1.beginFill(this.colour, lineAlpha)
      cap1.arc(0, 0, lineWidth, 0, Math.PI)
      cap1.endFill()
      cap1.rotation = path.rotation+Math.PI/2.0
      let cap2 = new PIXI.Graphics()
      cap2.beginFill(this.colour, lineAlpha)
      cap2.arc(0, 0, lineWidth, 0, Math.PI)
      cap2.endFill()
      cap2.rotation = path.rotation-Math.PI/2.0
      // keep a list of caps so we can remove them latter
      cap1.mapObject = objectA
      cap2.mapObject = objectB
      this.caps.push(cap1)
      this.caps.push(cap2)
      // add line caps to mapObject's container so they can inherit its scalling and be culled
      objectA.container.addChild(cap1)
      objectB.container.addChild(cap2)
  }

  _drawRegularPathSegment(lineWidth,lineAlpha, objectA, objectB) {
      let pointA = objectA.data.location
      let pointB = objectB.data.location
      let pathLength = gameHelper.getDistanceBetweenLocations(pointA,pointB)
      
      let path = new PIXI.Graphics()
      path.beginFill(this.colour, lineAlpha)
      path.moveTo(0, lineWidth)
      path.lineTo(0, -lineWidth)
      path.lineTo(pathLength, -lineWidth)
      path.lineTo(pathLength, lineWidth)
      path.endFill()
      path.rotation = Math.atan2(pointB.y-pointA.y,pointB.x-pointA.x)
      path.position = pointA
      this.pathContainer.addChild(path)

      let cap1 = new PIXI.Graphics()
      cap1.beginFill(this.colour, lineAlpha)
      cap1.arc(0, 0, lineWidth, 0, Math.PI)
      cap1.endFill()
      cap1.rotation = path.rotation+Math.PI/2.0
      let cap2 = new PIXI.Graphics()
      cap2.beginFill(this.colour, lineAlpha)
      cap2.arc(0, 0, lineWidth, 0, Math.PI)
      cap2.endFill()
      cap2.rotation = path.rotation-Math.PI/2.0
      // keep a list of caps so we can remove them latter
      cap1.mapObject = objectA
      cap2.mapObject = objectB
      this.caps.push(cap1)
      this.caps.push(cap2)
      // add line caps to mapObject's container so they can inherit its scalling and be culled
      objectA.container.addChild(cap1)
      objectB.container.addChild(cap2)
  }

  _isSourceLastDestination() {
    let numof_waypoints = this.data.waypoints.length
    let lastWaypoint = this.data.waypoints[numof_waypoints-1]
    if (numof_waypoints<2) return false;
    return (this.data.waypoints[0].source === lastWaypoint.destination)
  }

  drawCarrierWaypoints () {
    this._clearPaths()

    const PATH_WIDTH = 0.5*this.userSettings.map.carrierPathWidth

    let lineWidth = this.data.waypointsLooped ? PATH_WIDTH : PATH_WIDTH
    let lineAlpha = this.data.waypointsLooped ? 0.3 : 0.5
    let lastPoint = this
    let sourceIsLastDestination = false
    sourceIsLastDestination = this._isSourceLastDestination()
    // if looping and source is last destination, begin drawing path from the star instead of carrier
    if ( this.data.waypointsLooped ) {
      if ( ( sourceIsLastDestination ) && (this.data.inTransitFrom) )  {
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
        this._drawLoopedPathSegment(lineWidth, lineAlpha, lastPoint, star)
      }
      else {
        this._drawRegularPathSegment(lineWidth, lineAlpha, lastPoint, star)
      }

      lastPoint = star
    }
    //draw path back to the first destination
    if ( this.data.waypointsLooped ) {
      if ( !sourceIsLastDestination ) {
        let firstPoint
        firstPoint = this.stars.find(s => s.data._id === this.data.waypoints[0].destination)
        if( firstPoint !== lastPoint ) {
          this._drawLoopedPathSegment(lineWidth, lineAlpha, star, firstPoint)
        }
      }
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
   }
   this.setScale(zoomPercent)
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
    
    for( let path of this.pathContainer.children) {
      path.scale.y = this.container.scale.y
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
