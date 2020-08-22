import * as PIXI from 'pixi.js'
import EventEmitter from 'events'
import TextureService from './texture'

class Carrier extends EventEmitter {
  constructor () {
    super()

    this.container = new PIXI.Container()
    this.container.interactive = true
    this.container.buttonMode = true

    // TODO: Make sure these events are unsubscribed (use .off and see CarrierWaypoints.vue as an example)
    this.container.on('pointerdown', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.isMouseOver = false
    this.zoomPercent = 0
  }

  setup (data, stars, player, lightYearDistance) {
    this.data = data
    this.stars = stars
    this.player = player
    this.colour = player.colour.value
    this.lightYearDistance = lightYearDistance
  }

  draw () {
    this.drawColour()
    this.drawShip()
    this.drawGarrison()
    this._drawCarrierWaypoints()
  }

  drawActive () {
    this.drawGarrison()
  }

  drawColour () {
    if (!this.graphics_colour) {
      this.graphics_colour = new PIXI.Graphics()
      this.container.addChild(this.graphics_colour)
    }

    this.graphics_colour.clear()

    if (!this.data.orbiting) {
      this.graphics_colour.lineStyle(1, this.colour)
      this.graphics_colour.drawCircle(this.data.location.x, this.data.location.y, 4)
    }
  }

  drawShip () {
    if (!this.graphics_ship) {
      this.graphics_ship = new PIXI.Graphics()
      this.container.addChild(this.graphics_ship)
    }

    this.graphics_ship.clear()

    this.graphics_ship.lineStyle(0.3, 0x000000)
    this.graphics_ship.beginFill(0xFFFFFF)
    this.graphics_ship.moveTo(this.data.location.x, this.data.location.y - 4)
    this.graphics_ship.lineTo(this.data.location.x + 1.5, this.data.location.y + 1)
    this.graphics_ship.lineTo(this.data.location.x + 3, this.data.location.y + 2)
    this.graphics_ship.lineTo(this.data.location.x + 1, this.data.location.y + 2)
    this.graphics_ship.lineTo(this.data.location.x + 0, this.data.location.y + 3)
    this.graphics_ship.lineTo(this.data.location.x + -1, this.data.location.y + 2)
    this.graphics_ship.lineTo(this.data.location.x - 3, this.data.location.y + 2)
    this.graphics_ship.lineTo(this.data.location.x - 1.5, this.data.location.y + 1)
    this.graphics_ship.lineTo(this.data.location.x, this.data.location.y - 4)
    this.graphics_ship.endFill()

    this.graphics_ship.pivot.set(this.data.location.x, this.data.location.y)
    this.graphics_ship.position.x = this.data.location.x
    this.graphics_ship.position.y = this.data.location.y
    this.graphics_ship.scale.set(1)

    this._rotateCarrierTowardsWaypoint(this.graphics_ship)

    // Add a larger hit radius so that the star is easily clickable
    this.graphics_ship.hitArea = new PIXI.Circle(this.data.location.x, this.data.location.y, 10)
  }

  drawGarrison () {
    if (this.text_garrison) {
      this.container.removeChild(this.text_garrison)
      this.text_garrison = null
    }

    if (!this.text_garrison) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4

      this.text_garrison = new PIXI.Text('', style)
      this.text_garrison.resolution = 10

      this.container.addChild(this.text_garrison)
    }

    let totalGarrison = this.data.ships

    this.text_garrison.text = totalGarrison
    this.text_garrison.x = this.data.location.x - (this.text_garrison.width / 2)
    this.text_garrison.y = this.data.location.y + 5
    this.text_garrison.visible = !this.data.orbiting && totalGarrison > 0 && (this.isSelected || this.isMouseOver || this.zoomPercent < 50)
  }

  _rotateCarrierTowardsWaypoint (graphics) {
    // If the carrier has waypoints, get the first one and calculate the angle
    // between the carrier's current position and the destination.
    if (this.data.waypoints.length) {
      let waypoint = this.data.waypoints[0]
      let destination = this.stars.find(s => s.data._id === waypoint.destination).data.location

      let angle = this.getAngleTowardsLocation(this.data.location, destination)

      graphics.angle = (angle * (180 / Math.PI)) + 90
    }
  }

  _drawCarrierWaypoints () {
    if (!this.graphics_waypoints) {
      this.graphics_waypoints = new PIXI.Graphics()
      this.container.addChild(this.graphics_waypoints)
    }

    this.graphics_waypoints.clear()

    let lineWidth = this.data.waypointsLooped ? 0.5 : 1
    let lineAlpha = this.data.waypointsLooped ? 0.1 : 0.3

    this.graphics_waypoints.moveTo(this.data.location.x, this.data.location.y)
    this.graphics_waypoints.lineStyle(lineWidth, 0xFFFFFF, lineAlpha)

    for (let i = 0; i < this.data.waypoints.length; i++) {
      let waypoint = this.data.waypoints[i]

      // Draw a line to each destination along the waypoints.
      let star = this.stars.find(s => s.data._id === waypoint.destination)

      this.graphics_waypoints.lineTo(star.data.location.x, star.data.location.y)
    }
  }

  onClicked (e) {
    this.emit('onCarrierClicked', this.data)
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

    this.drawGarrison()
  }
}

export default Carrier
