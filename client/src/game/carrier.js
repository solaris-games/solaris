import * as PIXI from 'pixi.js'

class Carrier {
  constructor (container, data) {
    this.container = container
    this.data = data
  }

  draw () {
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

    // TODO: If the carrier has waypoints, get the first one and calculate the angle
    // between the carrier's current position and the destination.
    // graphics.angle = 90;

    // TODO: Draw carrier waypoints.

    this.container.addChild(graphics)
  }
}

export default Carrier
