import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import Map from './map'

class GameContainer {
  constructor () {
    PIXI.settings.SORTABLE_CHILDREN = true
  }

  setupApp () {
    // Cleanup if the app already exists.
    if (this.app) {
      this.app.destroy(false, {
        children: true
      });
    }

    if (this.viewport) {
      this.viewport.destroy();
    }

    this.app = new PIXI.Application({
      width: window.innerWidth, // window.innerWidth,
      height: window.innerHeight, // window.innerHeight,
      backgroundColor: 0x000000, // black hexadecimal
      resolution: window.devicePixelRatio || 1,
      autoResize: true
    })
    
    // create viewport
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,

      // yolo
      worldWidth: Number.MAX_VALUE,
      worldHeight: Number.MAX_VALUE,

      divWheel: this.app.renderer.view, // Ensures that when using the scroll wheel it only takes affect when the mouse is over the canvas (prevents scrolling in overlaying divs from scrolling the canvas)
      stopPropagation: true,
      passiveWheel: true,

      interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
    })

    // add the viewport to the stage
    this.app.stage.addChild(this.viewport)

    // Add a new map to the viewport
    this.map = new Map(this.app)
    this.viewport.addChild(this.map.container)
  }

  setupViewport (game) {
    this.game = game

    this.starFieldLeft = this._calculateMinStarX(game) - 500
    this.starFieldRight = this._calculateMaxStarX(game) + 500
    this.starFieldTop = this._calculateMinStarY(game) - 250
    this.starFieldBottom = this._calculateMaxStarY(game) + 250

    // activate plugins
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate({ friction: 0.9 })
      .clamp({
        left: this.starFieldLeft,
        right: this.starFieldRight,
        top: this.starFieldTop,
        bottom: this.starFieldBottom
      })
      .clampZoom({
        minWidth: 50,
        minHeight: 50,
        maxWidth: Math.abs(this.starFieldLeft) + Math.abs(this.starFieldRight),
        maxHeight: Math.abs(this.starFieldBottom) + Math.abs(this.starFieldTop)
      })
  }

  setup () {
    this.map.setup(this.game)
  }

  draw () {
    this.map.draw()
  }

  reloadStar (star) {
    // TODO: If we are reloading the star, will the game have the updated star data?
    let starObject = this.map.setupStar(star)
    this.map.drawStar(starObject)
  }

  reloadCarrier (carrier) {
    // TODO: If we are reloading the carrier, will the game have the updated carrier data?
    let carrierObject = this.map.setupCarrier(carrier)
    this.map.drawCarrier(carrierObject)
  }

  _calculateMinStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  _calculateMinStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  _calculateMaxStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  _calculateMaxStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }
}

export default new GameContainer()
