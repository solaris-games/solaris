import * as PIXI from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import Star from './Star'

class GalaxyEditor {

  static COLOURS = require('./colours.json') //TODO pull this from the api
  static SPECIALISTS = require('./specialists.json')

  constructor() {
    this.stars = new Array()
    this.selectedStar = null
    //this.vueContainer = null

    this.brushOptions = {
      brushRadius: 2,
      starAmount: 3
    }
    this.specialists = GalaxyEditor.SPECIALISTS
    this.playerShapeAndColours = []
    let shapes = ['circle', 'square', 'diamond', 'hexagon'] //TODO pull this from api, this is hardcoded in the server's player service and not defined in any specific file
    for( let shape of shapes ) {
      for( let colour of GalaxyEditor.COLOURS ) {
        let alias = colour.alias
        this.playerShapeAndColours.push(alias+' '+shape)
      }
    }
  }

  createPixiApp () {

    // Cleanup if the app already exists.
    this.destroy()

    //let antialiasing = userSettings.map.antiAliasing === 'enabled';

    this.app = new PIXI.Application({
      width: window.innerWidth/2.0, // window.innerWidth,
      height: window.innerHeight/2.0, // window.innerHeight,
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
    if( this.hoveredStar ) {
      this.selectedStar = this.hoveredStar
    }
    else {
      this.selectedStar = null
      this.addStars(clickEvent.world)
    }
  }

  addStar( location ) {
    let star = new Star(this.app, location)
    star.on('onStarMouseOver', this.onStarMouseOver.bind(this))
    star.on('onStarMouseOut', this.onStarMouseOut.bind(this))
    this.stars.push(star)
    this.viewport.addChild(star.container)
  }

  addStars( location ) {
    let amount = this.brushOptions.starAmount
    let radius = this.brushOptions.brushRadius*50
    if(amount === 1) {
      this.addStar(location)
      return
    }
    for( let i = 0; i < amount; i++ ) {
      let randomLocation = {
        x: (location.x - radius) + (Math.random()*radius*2.0),
        y: (location.y - radius) + (Math.random()*radius*2.0)
      }
      let star = new Star(this.app, randomLocation)
      star.on('onStarMouseOver', this.onStarMouseOver.bind(this))
      star.on('onStarMouseOut', this.onStarMouseOut.bind(this))
      this.stars.push(star)
      this.viewport.addChild(star.container)
    }
  }

  clear() {
    for(let star of this.stars) {
      this.viewport.removeChild(star.container)
    }
    this.stars = new Array()
  }

  generateJSON() {
    return JSON.stringify({
      homeStars: this.homeStars,
      stars: this.stars
    }, null, 2)
  }

  loadFromJSON( json ) {
    this.clear()
  }

  onStarMouseOver(star) {
    this.hoveredStar = star
  }

  onStarMouseOut(star) {
    this.hoveredStar = null
  }

  updateSelected() {
    if( this.selectedStar ) {
      this.selectedStar.update()
    }
  }

  destroySelected() {
    if( this.selectedStar ) {

      //TODO check if this is implemented in any helper class
      const index = this.stars.indexOf(this.selectedStar)
      if( index > -1 ) { this.stars.splice(index, 1) }

      this.viewport.removeChild( this.selectedStar.container )
      this.selectedStar = null
    }
  }
}

export default new GalaxyEditor()
