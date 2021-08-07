import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'

class Star extends EventEmitter {

  constructor (app, location) {
    super()

    this.app = app
    this.container = new PIXI.Container()
    this.container.position.x = location.x
    this.container.position.y = location.y
    this.container.interactive = true
    //this.container.interactiveChildren = false
    this.container.buttonMode = true
    this.container.hitArea = new PIXI.Circle(0, 0, 32)

    this.graphics = new PIXI.Graphics()
    this._setupGraphics()

    this.container.addChild(this.graphics)

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))
  }

  _setupGraphics() {
    this.graphics.lineStyle(2, 0xFFFFFF, 1.0)
    this.graphics.drawStar(0, 0, 4, 16, 8)
  }

  onClicked (e) {
    console.log('clicked a star')
    this.emit('onStarClicked', {
      star: this,
      e,
    })
  }

  onMouseOver (e) {
    this.emit('onStarMouseOver', this.data)
  }

  onMouseOut (e) {
    this.emit('onStarMouseOut', this.data)
  }

  destroy () {
    this.container.destroy()
  }

}

export default Star
