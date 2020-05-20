import * as PIXI from 'pixi.js'
import EventEmitter from 'events'

class Carrier extends EventEmitter {
  constructor () {
    super()

    this.container = new PIXI.Container()
    this.container.interactive = true
    this.container.buttonMode = true

    // TODO: Make sure these events are unsubscribed (use .off and see CarrierWaypoints.vue as an example)
    this.container.on('pointerdown', this.onClicked.bind(this))
  }

  setup (data, stars) {
    this.data = data
    this.stars = stars
  }

  draw () {
    this.container.removeChildren()

    let graphics = new PIXI.Graphics()

    graphics.lineStyle(0.3, 0x000000)
    graphics.beginFill(0xFFFFFF)
    graphics.moveTo(this.data.location.x, this.data.location.y - 4)
    graphics.lineTo(this.data.location.x + 1.5, this.data.location.y + 1)
    graphics.lineTo(this.data.location.x + 3, this.data.location.y + 2)
    graphics.lineTo(this.data.location.x + 1, this.data.location.y + 2)
    graphics.lineTo(this.data.location.x + 0, this.data.location.y + 3)
    graphics.lineTo(this.data.location.x + -1, this.data.location.y + 2)
    graphics.lineTo(this.data.location.x - 3, this.data.location.y + 2)
    graphics.lineTo(this.data.location.x - 1.5, this.data.location.y + 1)
    graphics.lineTo(this.data.location.x, this.data.location.y - 4)
    graphics.endFill()

    graphics.pivot.set(this.data.location.x, this.data.location.y)
    graphics.position.x = this.data.location.x
    graphics.position.y = this.data.location.y
    graphics.scale.set(1)

    this._rotateCarrierTowardsWaypoint(graphics)
    this._drawCarrierWaypoints()

    // Add a larger hit radius so that the star is easily clickable
    graphics.hitArea = new PIXI.Circle(this.data.location.x, this.data.location.y, 10)

    this.container.addChild(graphics)
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
    let graphics = new PIXI.Graphics()

    graphics.moveTo(this.data.location.x, this.data.location.y)
    graphics.lineStyle(1, 0xFFFFFF, 0.2)

    for (let i = 0; i < this.data.waypoints.length; i++) {
      let waypoint = this.data.waypoints[i]

      // Draw a line to each destination along the waypoints.
      let star = this.stars.find(s => s.data._id === waypoint.destination)
        
      graphics.lineTo(star.data.location.x, star.data.location.y)
    }

    this.container.addChild(graphics)
  }

  onClicked (e) {
    this.emit('onCarrierClicked', this.data)
  }

  getAngleTowardsLocation(source, destination) {
    let deltaX = destination.x - source.x;
    let deltaY = destination.y - source.y;

    return Math.atan2(deltaY, deltaX);
  }
}

export default Carrier
