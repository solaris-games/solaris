import * as PIXI from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import Map from './map'
import gameHelper from '../services/gameHelper'

class GameContainer {
  constructor () {
    PIXI.settings.SORTABLE_CHILDREN = true
    PIXI.GRAPHICS_CURVES.minSegments = 20 // Smooth arcs

    this.frames = 0
    this.dtAccum = 0
  }

  calcFPS(deltaTime) {
    //assumes PIXI ticker is set to 60(default)
    this.frames++
    this.dtAccum += deltaTime/60.0
    if (this.frames >= 60*5) {
      let avg = this.dtAccum/(60.0*5.0)
      console.log( 'avg dt: '+avg )
      console.log( 'avg fps: '+1000.0/(1000.0*avg) )
      this.frames = 0
      this.dtAccum = 0
    }
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

    this.app.ticker.add(this.onTick.bind(this))

    if ( process.env.NODE_ENV == 'development') {
      this.app.ticker.add(this.calcFPS.bind(this))
    }

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

      interaction: this.app.renderer.plugins.interaction, // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
      disableOnContextMenu: true
    })

    // add the viewport to the stage
    this.app.stage.addChild(this.viewport)

    // Add a new map to the viewport
    this.map = new Map(this.app)
    this.viewport.addChild(this.map.container)
  }

  zoomIn () {
    this.viewport.zoomPercent(0.5, true)
  }

  zoomOut () {
    this.viewport.zoomPercent(-0.3, true)
  }

  setupViewport (game) {
    this.game = game

    this.starFieldLeft = gameHelper.calculateMinStarX(game) - 1000
    this.starFieldRight = gameHelper.calculateMaxStarX(game) + 1000
    this.starFieldTop = gameHelper.calculateMinStarY(game) - 500
    this.starFieldBottom = gameHelper.calculateMaxStarY(game) + 500

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
    this.viewport.on('pointerdown', this.map.onViewportPointerDown.bind(this.map))
  }

  setup (game, userSettings) {
    this.userSettings = userSettings
    
    this.map.setup(this.game, userSettings)
  }

  draw () {
    this.map.draw()
  }

  reloadGame (game, userSettings) {
    this.game = game
    this.userSettings = userSettings
    this.map.reloadGame(game, userSettings)
  }

  reloadStar (star) {
    let starObject = this.map.setupStar(this.game, this.userSettings, star)
    this.map.drawStar(starObject)
  }

  reloadCarrier (carrier) {
    let carrierObject = this.map.setupCarrier(this.game, this.userSettings, carrier)
    this.map.drawCarrier(carrierObject)
  }

  undrawCarrier (carrier) {
    this.map.undrawCarrier(carrier)
  }

  getViewportZoomPercentage () {
    let viewportWidth = this.viewport.right - this.viewport.left
    let viewportPercent = (this.viewport.screenWidth / viewportWidth) * 100

    return viewportPercent
  }

  onTick (deltaTime) {
    this.map.onTick(deltaTime)
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
