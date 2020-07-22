import * as PIXI from 'pixi.js'
import EventEmitter from 'events'
import TextureService from './texture'
import gameContainer from './container'

class Star extends EventEmitter {

  constructor (app) {
    super()

    this.app = app

    this.container = new PIXI.Container()
    this.container.interactive = true
    this.container.buttonMode = true

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.isSelected = false
    this.isMouseOver = false
  }

  _getStarPlayer () {
    return this.players.find(x => x._id === this.data.ownedByPlayerId)
  }

  _getStarCarriers () {
    let carriersAtStar = this.carriers.filter(x => x.orbiting === this.data._id)

    return carriersAtStar
  }

  _getStarCarrierGarrison () {
    return this._getStarCarriers().reduce((sum, c) => sum + c.ships, 0)
  }

  _isOutOfScanningRange () {
    // These may be undefined, if so it means that they are out of scanning range.
    return typeof this.data.infrastructure === 'undefined'
  }

  setup (game, data, players, carriers) {
    this.game = game
    this.data = data
    this.players = players
    this.carriers = carriers
  }

  draw () {
    this.container.removeChildren()

    if (!this._getStarCarriers().length) {
      this.drawStar()
    }

    if (!this._isOutOfScanningRange()) {
      this.drawPlanets()
    }

    this.drawColour()

    if (this.isSelected) {
      this.drawScanningRange()
      this.drawHyperspaceRange()
    }

    this.drawName()
    this.drawGarrison()

    this.drawActive()
  }

  drawActive () {
    this.drawInfrastructure()
  }

  drawStar () {
    let starTexture = TextureService.getStarTexture()

    let sprite = new PIXI.Sprite(starTexture)
    sprite.width = 10
    sprite.height = 10
    sprite.position.x = this.data.location.x - 5
    sprite.position.y = this.data.location.y - 5

    if (this._isOutOfScanningRange()) {
      sprite.alpha = 0.3
    }

    // Add a larger hit radius so that the star is easily clickable
    // sprite.hitArea = new PIXI.Circle(this.data.location.x, this.data.location.y, 12)

    this.container.addChild(sprite)
  }

  drawPlanets () {
    // The more resources a star has the more planets it has.
    let planetCount = Math.floor(this.data.naturalResources / 50 * 3)
    
    if (planetCount === 0) {
      return
    }

    let rotationDirection = Math.floor(Math.abs(this.data.location.y)) % 2 === 0
    let rotationSpeedModifier = Math.floor(Math.random() * (1000 - 500 + 1) + 500) // Random number between 500 and 1000

    for (let i = 0; i < planetCount; i++) {
      let planetContainer = new PIXI.Container()
      
      let distanceToStar = 10 + (4 * i);
      let planetSize = Math.floor(Math.abs(this.data.location.y) + distanceToStar) % 3 + 1

      let orbitGraphics = new PIXI.Graphics()
      orbitGraphics.lineStyle(0.3, 0xFFFFFF)
      orbitGraphics.alpha = 0.1
      orbitGraphics.drawCircle(this.data.location.x, this.data.location.y, distanceToStar - (planetSize / 2))
      this.container.addChild(orbitGraphics)

      let planetTexture = TextureService.getPlanetTexture(this.data.location.x * planetSize, this.data.location.y * distanceToStar)
  
      let sprite = new PIXI.Sprite(planetTexture)
      sprite.width = planetSize
      sprite.height = planetSize

      if (this._isOutOfScanningRange()) {
        sprite.alpha = 0.3
      }
  
      planetContainer.pivot.set(distanceToStar, 0)
      planetContainer.position.x = this.data.location.x
      planetContainer.position.y = this.data.location.y
  
      let rotationSpeed = (planetCount - i) / rotationSpeedModifier

      this.app.ticker.add((delta) => {
        if (rotationDirection) {
          planetContainer.rotation += rotationSpeed * delta
        } else {
          planetContainer.rotation -= rotationSpeed * delta
        }
      })
  
      planetContainer.addChild(sprite)
      this.container.addChild(planetContainer)
    }
  }

  drawColour () {
    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let graphics = new PIXI.Graphics()

    graphics.lineStyle(2, player.colour.value)

    // If its a warp gate then draw a rectangle.
    // Otherwise draw a circle.
    if (this.data.warpGate) {
      graphics.drawRect(this.data.location.x - 5, this.data.location.y - 5, 10, 10)
    } else {
      graphics.drawCircle(this.data.location.x, this.data.location.y, 5)
    }

    this.container.addChild(graphics)
  }

  drawName () {
    if (this.textName) {
      this.container.removeChild(this.textName)
      this.textName = null
    }

    let style = TextureService.DEFAULT_FONT_STYLE
    style.fontSize = 4

    this.textName = new PIXI.Text(this.data.name, style)

    this.textName.visible = gameContainer.getViewportZoomPercentage() < 40
    this.textName.x = this.data.location.x - (this.textName.width / 2)
    this.textName.y = this.data.location.y + 7
    this.textName.resolution = 10

    this.container.addChild(this.textName)
  }

  drawGarrison () {
    // TODO: A better approach is to use .visible instead of removing
    // the item from the container. Will need to first check to see how
    // things are being drawn first as this will probably be a big refactor.
    if (this.textGarrison) {
      this.container.removeChild(this.textGarrison)
      this.textGarrison = null
    }

    let totalGarrison = (this.data.garrison || 0) + this._getStarCarrierGarrison()

    if (!totalGarrison) return

    let style = TextureService.DEFAULT_FONT_STYLE
    style.fontSize = 4

    this.textGarrison = new PIXI.Text(totalGarrison, style)

    this.textGarrison.visible = gameContainer.getViewportZoomPercentage() < 20
    this.textGarrison.x = this.data.location.x - (this.textGarrison.width / 2)
    this.textGarrison.y = this.data.location.y + 12
    this.textGarrison.resolution = 10

    this.container.addChild(this.textGarrison)
  }

  drawInfrastructure () {
    if (this.infrastructureGraphics) {
      this.container.removeChild(this.infrastructureGraphics)
      this.infrastructureGraphics = null
    }

    if (!this.data.ownedByPlayerId) return
    if (this._isOutOfScanningRange()) return

    let style = TextureService.DEFAULT_FONT_STYLE
    style.fontSize = 4

    let text = new PIXI.Text(`${this.data.infrastructure.economy} ${this.data.infrastructure.industry} ${this.data.infrastructure.science}`, style)

    text.visible = this.isMouseOver || this.isSelected || gameContainer.getViewportZoomPercentage() < 10
    text.x = this.data.location.x - (text.width / 2)
    text.y = this.data.location.y - 12
    text.resolution = 10

    this.infrastructureGraphics = text
    this.container.addChild(text)
  }

  drawPlayerName () {
    if (this.playerNameGraphics) {
      this.container.removeChild(this.playerNameGraphics)
      this.playerNameGraphics = null
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let style = TextureService.DEFAULT_FONT_STYLE
    style.fontSize = 4

    let text = new PIXI.Text(player.alias, style)

    text.x = this.data.location.x - (text.width / 2)

    if (this.data.garrison == null) {
      text.y = this.data.location.y + 12
    } 
    else {
      text.y = this.data.location.y + 17
    }
    
    text.resolution = 10

    this.playerNameGraphics = text
    this.container.addChild(text)
  }

  drawScanningRange () {
    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let graphics = new PIXI.Graphics()

    let radius = ((player.research.scanning.level || 1) + 2) * this.game.constants.distances.lightYear

    graphics.lineStyle(1, 0xFFFFFF, 0.3)
    graphics.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 1)

    this.container.addChild(graphics)
  }

  drawHyperspaceRange () {
    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let graphics = new PIXI.Graphics()

    let radius = ((player.research.hyperspace.level || 1) + 3) * this.game.constants.distances.lightYear

    graphics.lineStyle(1, 0xFFFFFF, 0.3)
    graphics.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 2)

    this.container.addChild(graphics)
  }

  onClicked (e) {
    this.emit('onStarClicked', this.data)

    this.drawAnimatedSelectCircle()
  }

  drawAnimatedSelectCircle () {
    // It ain't pretty, but it works.
    let graphics = new PIXI.Graphics()

    graphics.radius = 1

    graphics.animation = (delta) => {
      if (graphics.alpha <= 0) {
        return
      }

      graphics.clear()
      graphics.lineStyle(1, 0xFFFFFF, 0.3)

      graphics.alpha -= 0.02 * delta
      graphics.radius = graphics.radius + delta

      graphics.drawCircle(this.data.location.x, this.data.location.y, graphics.radius)
    }

    this.app.ticker.add(graphics.animation)

    var that = this

    setTimeout (() => {
      that.container.removeChild(graphics)
      that.app.ticker.remove(graphics.animation);
    }, 3000)

    this.container.addChild(graphics)
  }

  onMouseOver (e) {
    this.isMouseOver = true

    this.drawActive()

    this.emit('onStarMouseOver', this.data)
  }

  onMouseOut (e) {
    this.isMouseOver = false

    this.drawActive()

    this.emit('onStarMouseOut', this.data)
  }

  refreshZoom (zoomPercent) {
    if (this.textName)
      this.textName.visible = zoomPercent < 40

    if (this.textGarrison)
      this.textGarrison.visible = zoomPercent < 20

    if (this.infrastructureGraphics)
      this.infrastructureGraphics.visible = this.isMouseOver || this.isSelected || zoomPercent < 10

    // this.drawName()
    // this.drawGarrison()
    // this.drawInfrastructure()
  }
}

export default Star
