import * as PIXI from 'pixi.js'
import {EventEmitter} from "./eventEmitter";
import type { Game } from '../types/game';
import type { Location } from '@solaris-common';

type RulerPoint = {
  location: Location,
}

export class RulerPoints extends EventEmitter {
  container: PIXI.Container;
  game: Game | undefined;
  rulerPoints: RulerPoint[] = [];
  lightYearDistance: number = 0;
  techLevel: number = 0;

  constructor () {
    super()

    this.container = new PIXI.Container()
  }

  setup (game: Game) {
    this.game = game

    this.rulerPoints = []
    this.lightYearDistance = game.constants.distances.lightYear

    this.techLevel = 1
    let userPlayer = game.galaxy.players.find(x => x.userId)

    if (userPlayer) {
      this.techLevel = userPlayer.research.hyperspace.level
    }

    this.emit('onRulerPointsCleared', undefined);

    this.clear()
  }

  clear () {
    this.container.removeChildren()
  }

  draw () {
    this.clear()

    this.drawPaths()
    this.drawHyperspaceRange()
  }

  drawPaths () {
    if (!this.rulerPoints.length) {
      return
    }

    // Draw all paths to each ruler point
    let graphics = new PIXI.Graphics()

    // Start the line from where the first point is.
    const firstPoint = this.rulerPoints[0]
    graphics.moveTo(firstPoint.location.x, firstPoint.location.y)

    // Draw a line to each other point
    for (let i = 1; i < this.rulerPoints.length; i++) {
      let point = this.rulerPoints[i]

      graphics.lineTo(point.location.x, point.location.y)
    }

    graphics.stroke({
      width: 1,
      color: 0xFFFFFF,
      alpha: 0.8
    })

    this.container.addChild(graphics)
  }

  drawHyperspaceRange () {
    let lastPoint = this.rulerPoints[this.rulerPoints.length - 1]

    if (!lastPoint) {
      return
    }

    let graphics = new PIXI.Graphics()

    let radius = ((this.techLevel || 1) + 1.5) * this.lightYearDistance

    graphics.star(lastPoint.location.x, lastPoint.location.y, radius, radius, radius - 3)

    graphics.fill({
      color: 0xFFFFFF,
      alpha: 0.075
    });

    graphics.stroke({
      width: 1,
      color: 0xFFFFFF,
      alpha: 0.2
    })

    graphics.zIndex = -1

    this.container.addChild(graphics)
  }

  onStarClicked (e) {
    this._createRulerPoint({
      type: 'star',
      object: e,
      location: e.location
    })
  }

  onCarrierClicked (e) {
    this._createRulerPoint({
      type: 'carrier',
      object: e,
      location: e.location
    })
  }

  removeLastRulerPoint () {
    const old = this.rulerPoints.pop()

    this.draw()

    this.emit('onRulerPointRemoved', old)
  }

  _createRulerPoint (desiredPoint) {
    let lastPoint = this.rulerPoints[this.rulerPoints.length - 1]

    if (lastPoint &&
      lastPoint.location.x === desiredPoint.location.x &&
      lastPoint.location.y === desiredPoint.location.y) {
      return
    }

    desiredPoint.distance = this.rulerPoints.push(desiredPoint)

    this.draw()

    this.emit('onRulerPointCreated', desiredPoint)
  }
}

export default RulerPoints
