import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'

class Star extends EventEmitter {

  constructor (app, location) {
    super()

    this.location = location
    this.infrastructure = {
      economy: 0,
      industry: 0,
      science: 0,
    }
    this.hasWarpGate = false
    this.isHomeStar = false
    this.playerIndex = -1
    this.specialistID = -1

    this.naturalResources = Math.round(Math.random()*50)
    this.app = app
    this.container = new PIXI.Container()
    this.container.position.x = location.x
    this.container.position.y = location.y
    this.container.interactive = true
    //this.container.interactiveChildren = false
    this.container.buttonMode = true
    this.container.hitArea = new PIXI.Circle(0, 0, 32)

    this.graphics = new PIXI.Graphics()
    this._updateGraphics()

    this.container.addChild(this.graphics)

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))
  }

  _updateGraphics() {
    let color = 0xB0B0B0; if( this.isHomeStar ) { color = 0xFFFFFF }
    this._updateStarGeometry(color)
    this._updateWarpGateGeometry(color)
    this._updateInfrastructureText()
    this._updateNaturalResourcesText()
  }

  _updateWarpGateGeometry( color ) {
    if( this.warpGate_geometry ) {
      this.container.removeChild(this.warpGate_geometry)
    }
    if( this.hasWarpGate ) {
      this.warpGate_geometry = new PIXI.Graphics()
      this.warpGate_geometry.lineStyle(2, color, 1.0)
      this.warpGate_geometry.drawStar(0, 0, 4, 32+2, 16+2)
      this.container.addChild(this.warpGate_geometry)
    }
  }

  _updateStarGeometry( color ) {
    if( this.star_geometry ) {
      this.container.removeChild(this.star_geometry)
    }

    this.star_geometry = new PIXI.Graphics()
    this.star_geometry.lineStyle(2, color, 1.0)
    this.star_geometry.drawStar(0, 0, 4, 16, 8)
    this.container.addChild(this.star_geometry)
  }

  _updateNaturalResourcesText() {
    //TODO use bitmap text, change text without creating another object
    if( this.naturalResources_text ) {
      this.container.removeChild(this.naturalResources_text)
    }
    this.naturalResources_text = new PIXI.Text(`${this.naturalResources}`, {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, align: 'center'})
    this.naturalResources_text.position.x = -(this.naturalResources_text.width/2.0)
    this.naturalResources_text.position.y = 16
    this.container.addChild(this.naturalResources_text)
  }

  _updateInfrastructureText() {
    //TODO use bitmap text, ignore if 0, change text without creating another object
    if( this.infrastructure_text ) {
      this.container.removeChild(this.infrastructure_text)
    }
    this.infrastructure_text = new PIXI.Text(`${this.infrastructure.economy} ${this.infrastructure.industry} ${this.infrastructure.science}`, {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, align: 'center'})
    this.infrastructure_text.position.x = (-this.infrastructure_text.width/2.0)
    this.infrastructure_text.position.y = -16-(this.infrastructure_text.height)
    this.container.addChild(this.infrastructure_text)
  }

  onClicked (e) {
    this.emit('onStarClicked', {
      star: this,
      e,
    })
  }

  update() {
    this._updateGraphics()
  }

  onMouseOver (e) {
    this.emit('onStarMouseOver', this)
  }

  onMouseOut (e) {
    this.emit('onStarMouseOut', this)
  }

  destroy () {
    this.container.destroy()
  }

  toJSON() {
    return( {
      location: this.location,
      naturalResources: this.naturalResources,
      infrastructure: this.infrastructure,
      hasWarpGate: this.hasWarpGate,
      isHomeStar: this.isHomeStar
    })
  }

}

export default Star
