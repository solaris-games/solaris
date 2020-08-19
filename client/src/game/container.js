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
      })
    }

    if (this.viewport) {
      this.viewport.destroy()
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
      .wheel({
        // percent: 2,
        smooth: 5
      })
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

    this.viewport.on('zoomed-end', this.onViewportZoomed.bind(this))
  }

  setup () {
    this.map.setup(this.game)
  }

  draw () {
    this.map.draw()
  }

  reloadGame (game) {
    this.game = game
    this.map.reloadGame(game)
  }

  reloadStar (star) {
    let starObject = this.map.setupStar(this.game, star)
    this.map.drawStar(starObject)
  }

  reloadCarrier (carrier) {
    let carrierObject = this.map.setupCarrier(this.game, carrier)
    this.map.drawCarrier(carrierObject)
  }

  undrawCarrier (carrier) {
    this.map.undrawCarrier(carrier)
  }

  getViewportZoomPercentage () {
    let viewportWidth = this.viewport.right - this.viewport.left
    let viewportPercent = (viewportWidth / this.viewport.screenWidth) * 100

    return viewportPercent
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

  onViewportZoomed (e) {
    let zoomPercent = this.getViewportZoomPercentage()

    this.map.refreshZoom(zoomPercent)
  }

  setMode (mode, args) {
    this.map.setMode(mode, args)
  }

  resetMode () {
    this.map.resetMode()
  }
}

export default new GameContainer()
