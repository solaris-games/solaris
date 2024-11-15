import * as PIXI from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import Map from './map'
import gameHelper from '../services/gameHelper'
import textureService from './texture'

class DrawingContext {
  constructor (store) {
    this.store = store;
  }

  getPlayerColour (playerId) {
    return this.store.getters.getColourForPlayer(playerId).value
  }
}

class GameContainer {


  constructor () {
    PIXI.settings.SORTABLE_CHILDREN = true
    PIXI.Graphics.curves.minSegments = 20 // Smooth arcs

    this.frames = 0
    this.dtAccum = 33.0*16
    this.lowest = 1000
    this.previousDTs = [ 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0 ]
    this.ma32accum = 0
  }

  calcFPS(deltaTime) {
    let elapsed = this.app.ticker.elapsedMS
    this.frames+=1
    this.previousDTs.pop()
    this.previousDTs.unshift(elapsed)

    this.dtAccum = this.previousDTs.reduce( (total, current) => { return total+current } )
    this.ma32accum += elapsed

    let movingAverageDT = this.dtAccum/16.0
    let movingAverageFPS = 1000.0/movingAverageDT
    let ma32DT = this.ma32accum/32.0

    let fps = 1000.0/elapsed
    if( fps < this.lowest ) { this.lowest = fps }
    if (this.fpsNowText) {
      this.fpsNowText.text = ( 'fps: ' + fps.toFixed(0) )
    }

    if(this.frames==31) {
      let ma32FPS = 1000.0/ma32DT

      if (this.fpsMAText) {
        this.fpsMAText.text =  ( 'fpsMA: ' + movingAverageFPS.toFixed(0) )
      }

      if (this.fpsMA32Text) {
        this.fpsMA32Text.text = ( 'fpsMA32: ' + ma32FPS.toFixed(0) )
      }

      if (this.jitterText) {
        this.jitterText.text = ( 'jitter: ' + (movingAverageFPS-this.lowest).toFixed(0) )
      }

      if (this.lowestText) {
        this.lowestText.text = ( 'lowest: '+ this.lowest.toFixed(0) )
      }

      if (this.zoomText) {
        this.zoomText.text = ( 'zoom%: '+ this.map.zoomPercent.toFixed(0) )
      }

      this.frames = 0
      this.lowest = 1000
      this.ma32accum = 0
    }
  }

  setupApp (store, userSettings) {
    this.store = store

    this.context = new DrawingContext(store)

    // Cleanup if the app already exists.
    this.destroy()

    let antialiasing = userSettings.map.antiAliasing === 'enabled';

    this.app = new PIXI.Application({
      width: window.innerWidth, // window.innerWidth,
      height: window.innerHeight - 45, // window.innerHeight,
      backgroundColor: 0x000000, // black hexadecimal
      resolution: window.devicePixelRatio || 1,
      antialias: antialiasing,
      autoResize: true,
      autoDensity: true,
    })

    this.app.ticker.add(this.onTick.bind(this))
    this.app.ticker.maxFPS = 0

    if (import.meta.env.DEV || userSettings?.technical?.performanceMonitor === 'enabled') {
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

      disableOnContextMenu: true,
      events: this.app.renderer.events
    })

    // add the viewport to the stage
    this.app.stage.addChild(this.viewport)

    // Add a new map to the viewport
    this.map = new Map(this.app, this.store, this, this.context)
    this.viewport.addChild(this.map.container)
  }

  destroy () {
    if (this.viewport) {
      this.viewport.destroy()
      this.viewport = null
    }

    // Cleanup if the app already exists.
    if (this.app) {
      this.app.destroy(false, {
        children: true
      })

      this.app = null
    }
  }

  zoomIn () {
    this.viewport.zoomPercent(0.5, true)
  }

  zoomOut () {
    this.viewport.zoomPercent(-0.3, true)
  }

  setupViewport (game) {
    this.game = game

    this.starFieldLeft = gameHelper.calculateMinStarX(game) - 1500
    this.starFieldRight = gameHelper.calculateMaxStarX(game) + 1500
    this.starFieldTop = gameHelper.calculateMinStarY(game) - 750
    this.starFieldBottom = gameHelper.calculateMaxStarY(game) + 750

    const maxWidth = Math.abs(this.starFieldLeft) + Math.abs(this.starFieldRight);
    const maxHeight = Math.abs(this.starFieldBottom) + Math.abs(this.starFieldTop);

    this.viewport.resize(window.innerWidth, window.innerHeight, maxWidth, maxHeight)

    // activate plugins
    this.viewport
      .drag()
      .pinch()
      .wheel({
        // percent: 2,
        smooth: 5
      })
      .decelerate({ friction: 0.9 })
      .clampZoom({
        minWidth: 50,
        minHeight: 50,
        maxWidth,
        maxHeight,
      })

    this.viewport.on('zoomed-end', this.onViewportZoomed.bind(this))
    this.viewport.on('pointerdown', this.map.onViewportPointerDown.bind(this.map))
  }

  setup (game, userSettings, context) {
    this.userSettings = userSettings
    textureService.initialize()

    this.map.setup(this.game, userSettings, context)
  }

  draw () {
    this.map.draw()

    if ( import.meta.env.DEV || this.userSettings?.technical?.performanceMonitor === 'enabled') {
      let bitmapFont = {fontName: "chakrapetch", fontSize: 16}
      let left = 64
      let top = 32

      this.fpsNowText = new PIXI.BitmapText("", bitmapFont)
      this.fpsMAText = new PIXI.BitmapText("", bitmapFont)
      this.fpsMA32Text = new PIXI.BitmapText("", bitmapFont)
      this.jitterText = new PIXI.BitmapText("", bitmapFont)
      this.lowestText = new PIXI.BitmapText("", bitmapFont)
      this.zoomText = new PIXI.BitmapText("", bitmapFont)
      this.fpsNowText.x = left
      this.fpsNowText.y = 128+16
      this.fpsMAText.x = left
      this.fpsMAText.y = this.fpsNowText.y + top+2
      this.fpsMA32Text.x = left
      this.fpsMA32Text.y = this.fpsMAText.y +top+2
      this.jitterText.x = left
      this.jitterText.y = this.fpsMA32Text.y + top+2
      this.lowestText.x = left
      this.lowestText.y = this.jitterText.y +top+2
      this.zoomText.x = left
      this.zoomText.y = this.lowestText.y +top+2
      this.app.stage.addChild(this.fpsNowText)
      this.app.stage.addChild(this.jitterText)
      this.app.stage.addChild(this.lowestText)
      this.app.stage.addChild(this.fpsMAText)
      this.app.stage.addChild(this.fpsMA32Text)
      this.app.stage.addChild(this.zoomText)
    }
  }

  drawWaypoints () {
    this.map.drawWaypoints()
  }

  reloadGame (game, userSettings) {
    this.game = game
    this.userSettings = userSettings
    this.map.reloadGame(game, userSettings)
  }

  reloadTerritories () {
    this.map.drawTerritories(this.userSettings)
  }

  reloadStar (star) {
    let starObject = this.map.setupStar(this.game, this.userSettings, star)
    this.map.drawStar(starObject)
    this.map.addContainerToChunk(starObject, this.map.chunks, this.map.firstChunkX, this.map.firstChunkY)
  }

  reloadCarrier (carrier) {
    let carrierObject = this.map.setupCarrier(this.game, this.userSettings, carrier)
    this.map.drawCarrier(carrierObject)
    this.map.addContainerToChunk(carrierObject, this.map.chunks, this.map.firstChunkX, this.map.firstChunkY)
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

  resize () {
    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight
    )

    this.viewport.resize(
      window.innerWidth,
      window.innerHeight,
      Number.MAX_VALUE,
      Number.MAX_VALUE
    )
  }

}

export default new GameContainer()
