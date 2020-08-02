import * as PIXI from 'pixi.js'
import EventEmitter from 'events'

class RulerPoints extends EventEmitter {
  constructor () {
    super()

    this.container = new PIXI.Container()
  }

  setup (game) {
    this.game = game

    this.rulerPoints = []

    this.emit('onRulerPointsCleared')

    this.clear()
  }

  clear () {
    this.container.removeChildren()
  }

  draw () {
    this.clear()

    this.drawPaths()
  }

  drawPaths () {
    if (!this.rulerPoints.length) {
        return
    }

    // Draw all paths to each ruler point
    let graphics = new PIXI.Graphics()
    
    // Start the line from where the first point is.
    let firstPoint = this.rulerPoints[0]
    graphics.moveTo(firstPoint.x, firstPoint.y)
    graphics.lineStyle(1, 0xFFFFFF, 0.8)

    // Draw a line to each other point
    for (let i = 1; i < this.rulerPoints.length; i++) {
        let point = this.rulerPoints[i]
        
        graphics.lineTo(point.x, point.y)
    }

    this.container.addChild(graphics)
  }

  onStarClicked (e) {
    this._createRulerPoint(e.location)
  }

  onCarrierClicked (e) {
    this._createRulerPoint(e.location)
  }

  _createRulerPoint (desiredLocation) {
    let lastPoint = this.rulerPoints[this.rulerPoints.length - 1]

    if (lastPoint
      && lastPoint.x === desiredLocation.x
      && lastPoint.y === desiredLocation.y) {
        return
      }

    this.rulerPoints.push(desiredLocation)
    
    this.draw()

    this.emit('onRulerPointCreated', desiredLocation)
  }

}

export default RulerPoints
