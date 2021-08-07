import * as PIXI from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import Star from './Star'

class GalaxyEditor {

  constructor() {
    this.stars = new Array()
  }

  createPixiApp () {

    // Cleanup if the app already exists.
    this.destroy()

    //let antialiasing = userSettings.map.antiAliasing === 'enabled';

    this.app = new PIXI.Application({
      width: window.innerWidth, // window.innerWidth,
      height: window.innerHeight, // window.innerHeight,
      backgroundColor: 0x000000, // black hexadecimal
      resolution: window.devicePixelRatio || 1,
      antialias: 'enabled',
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

      interaction: this.app.renderer.plugins.interaction, // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
      disableOnContextMenu: true
    })
    this.setupViewport()

    // add the viewport to the stage
    this.app.stage.addChild(this.viewport)

    let testStar = new Star( this.app, {x: 64.0, y: 64.0} )
    this.viewport.addChild(testStar.container)
  }

  destroy () {
    // Cleanup if the app already exists.
    if (this.app) {
      this.app.destroy(false, {
        children: true
      })

      this.app = null
    }

    if (this.viewport) {
      this.viewport.destroy()
      this.viewport = null
    }
  }

  zoomIn () {
    this.viewport.zoomPercent(0.5, true)
  }

  zoomOut () {
    this.viewport.zoomPercent(-0.3, true)
  }

  setupViewport () {
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

    this.viewport.on('clicked', this._onViewportClicked.bind(this))
  }

  _onViewportClicked(clickEvent) {
    this.addStar(clickEvent.world)
  }

  addStar( location ) {
    let star = new Star(this.app, location)
    this.stars.push(star)
    this.viewport.addChild(star.container)
  }

  clear() {
    for(let star of this.stars) {
      this.viewport.removeChild(star)
    }
  }
}

export default new GalaxyEditor()
