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
    this.isInScanningRange = false // Default to false to force initial redraw
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

  _isInScanningRange () {
    // These may be undefined, if so it means that they are out of scanning range.
    return !(typeof this.data.infrastructure === 'undefined')
  }

  setup (data, players, carriers, lightYearDistance) {
    this.data = data
    this.players = players
    this.carriers = carriers
    this.lightYearDistance = lightYearDistance
  }

  draw (zoomPercent) {
    // Note: The star may become visible/hidden due to changing scanning range.
    // If a star is revealed or a star becomes masked then we want to force the entire
    // star to be re-drawn.
    let force = this.isInScanningRange != this._isInScanningRange()

    this.drawStar(force)
    this.drawPlanets(force, zoomPercent)
    this.drawColour(force)
    this.drawScanningRange(force)
    this.drawHyperspaceRange(force)
    this.drawName(force, zoomPercent)
    this.drawGarrison(force, zoomPercent)
    this.drawActive(force, zoomPercent)

    this.isInScanningRange = this._isInScanningRange()
  }

  drawActive (force, zoomPercent) {
    this.drawInfrastructure(force, zoomPercent)
    this.drawGarrison(force, zoomPercent)
    this.drawScanningRange(force)
    this.drawHyperspaceRange(force)
  }

  drawStar (force) {
    if (force && this.sprite_star) {
      this.container.removeChild(this.sprite_star)
      this.sprite_star = null
    }

    if (!this.sprite_star) {
      this.sprite_star = new PIXI.Sprite(TextureService.getStarTexture())

      this.sprite_star.width = 10
      this.sprite_star.height = 10
      this.sprite_star.position.x = this.data.location.x - 5
      this.sprite_star.position.y = this.data.location.y - 5

      this.container.addChild(this.sprite_star)
    }

    this.sprite_star.visible = !this._getStarCarriers().length

    if (!this._isInScanningRange()) {
      this.sprite_star.alpha = 0.3
    }

    // Add a larger hit radius so that the star is easily clickable
    // sprite.hitArea = new PIXI.Circle(this.data.location.x, this.data.location.y, 12)
  }

  drawPlanets (force, zoomPercent) {
    if (force && this.container_planets) {
      this.container.removeChild(this.container_planets)
      this.container_planets = null
    }

    if (!this.container_planets) {
      this.container_planets = new PIXI.Container()

      // The more resources a star has the more planets it has.
      let planetCount = this._getPlanetsCount()
      
      if (planetCount === 0) {
        return
      }

      let rotationDirection = this._getPlanetOrbitDirection()
      let rotationSpeedModifier = this._getPlanetOrbitSpeed()

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

        if (!this._isInScanningRange()) {
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

        this.container_planets.addChild(planetContainer)
      }

      this.container.addChild(this.container_planets)
    }

    this.container_planets.visible = this._isInScanningRange() && zoomPercent < 75
  }

  _getPlanetsCount () {
    return Math.floor(this.data.naturalResources / 50 * 3)
  }

  _getPlanetOrbitDirection () {
    return Math.floor(Math.abs(this.data.location.y)) % 2 === 0
  }

  _getPlanetOrbitSpeed () {
    return Math.floor(Math.random() * (1000 - 500 + 1) + 500) // Random number between 500 and 1000
  }

  drawColour (force) {
    if (force && this.graphics_colour) {
      this.container.removeChild(this.graphics_colour)
      this.graphics_colour = null
    }

    if (!this.graphics_colour) {
      this.graphics_colour = new PIXI.Graphics()
  
      this.container.addChild(this.graphics_colour)
    }

    this.graphics_colour.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    this.graphics_colour.lineStyle(2, player.colour.value)

    // If its a warp gate then draw a rectangle.
    // Otherwise draw a circle.
    if (this.data.warpGate) {
      this.graphics_colour.drawRect(this.data.location.x - 5, this.data.location.y - 5, 10, 10)
    } else {
      this.graphics_colour.drawCircle(this.data.location.x, this.data.location.y, 5)
    }
  }

  drawName (force, zoomPercent) {
    if (force && this.text_name) {
      this.container.removeChild(this.text_name)
      this.text_name = null
    }

    if (!this.text_name) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4
  
      this.text_name = new PIXI.Text(this.data.name, style)
      this.text_name.x = this.data.location.x - (this.text_name.width / 2)
      this.text_name.y = this.data.location.y + 7
      this.text_name.resolution = 10

      this.container.addChild(this.text_name)
    }

    this.text_name.visible = this.isSelected || zoomPercent < 40
  }

  drawGarrison (force, zoomPercent) {
    if (force && this.text_garrison) {
      this.container.removeChild(this.text_garrison)
      this.text_garrison = null
    }

    if (!this.text_garrison) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4
  
      this.text_garrison = new PIXI.Text('', style)
      this.text_garrison.resolution = 10
  
      this.container.addChild(this.text_garrison)
    }

    let totalGarrison = (this.data.garrison || 0) + this._getStarCarrierGarrison()

    this.text_garrison.text = totalGarrison
    this.text_garrison.x = this.data.location.x - (this.text_garrison.width / 2)
    this.text_garrison.y = this.data.location.y + 12
    this.text_garrison.visible = totalGarrison > 0 && (this.isSelected || this.isMouseOver || zoomPercent < 20)
  }

  drawInfrastructure (force, zoomPercent) {
    if (force && this.text_infrastructure) {
      this.container.removeChild(this.text_infrastructure)
      this.text_infrastructure = null
    }

    if (!this.text_infrastructure) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4

      this.text_infrastructure = new PIXI.Text('', style)
      this.text_infrastructure.resolution = 10
      
      this.container.addChild(this.text_infrastructure)
    }

    if (this.data.ownedByPlayerId && this._isInScanningRange()) {
      this.text_infrastructure.text = `${this.data.infrastructure.economy} ${this.data.infrastructure.industry} ${this.data.infrastructure.science}`
      this.text_infrastructure.x = this.data.location.x - (this.text_infrastructure.width / 2)
      this.text_infrastructure.y = this.data.location.y - 12
      
      this.text_infrastructure.visible = this.isMouseOver || this.isSelected || zoomPercent < 10
    } else {
      this.text_infrastructure.visible = false
    }
  }

  drawPlayerName (force) {
    if (force && this.text_playerName) {
      this.container.removeChild(this.text_playerName)
      this.text_playerName = null
    }

    if (!this.text_playerName) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4

      this.text_playerName = new PIXI.Text('', style)
      this.text_playerName.resolution = 10
      
      this.container.addChild(this.text_playerName)
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (player) {
      this.text_playerName.text = player.alias
      this.text_playerName.x = this.data.location.x - (this.text_playerName.width / 2)

      if (this.data.garrison == null) {
        this.text_playerName.y = this.data.location.y + 12
      } 
      else {
        this.text_playerName.y = this.data.location.y + 17
      }

      this.text_playerName.visible = gameContainer.getViewportZoomPercentage() < 30 // TODO: Move this into zoom refresh
    } else {
      this.text_playerName.visible = false
    }
  }

  drawScanningRange (force) {
    if (force && this.graphics_scanningRange) {
      this.container.removeChild(this.graphics_scanningRange)
      this.graphics_scanningRange = null
    }

    if (!this.graphics_scanningRange) {
      this.graphics_scanningRange = new PIXI.Graphics()

      this.container.addChild(this.graphics_scanningRange)
    }

    this.graphics_scanningRange.clear()
  
    if (!this.isSelected) {
      return
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let radius = ((player.research.scanning.level || 1) + 2) * this.lightYearDistance

    this.graphics_scanningRange.lineStyle(1, 0xFFFFFF, 0.3)
    this.graphics_scanningRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 1)
  }

  drawHyperspaceRange (force) {
    if (force && this.graphics_hyperspaceRange) {
      this.container.removeChild(this.graphics_hyperspaceRange)
      this.graphics_hyperspaceRange = null
    }

    if (!this.graphics_hyperspaceRange) {
      this.graphics_hyperspaceRange = new PIXI.Graphics()

      this.container.addChild(this.graphics_hyperspaceRange)
    }

    this.graphics_hyperspaceRange.clear()
  
    if (!this.isSelected) {
      return
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let radius = ((player.research.hyperspace.level || 1) + 3) * this.lightYearDistance

    this.graphics_hyperspaceRange.lineStyle(1, 0xFFFFFF, 0.3)
    this.graphics_hyperspaceRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 2)
  }

  onClicked (e) {
    this.emit('onStarClicked', this.data)

    this.drawAnimatedSelectCircle()
    this.drawActive(false)
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

    this.drawActive(false)

    this.emit('onStarMouseOver', this.data)
  }

  onMouseOut (e) {
    this.isMouseOver = false

    this.drawActive(false)

    this.emit('onStarMouseOut', this.data)
  }

  refreshZoom (zoomPercent) {
    // Note: Should never need to force a redraw when zooming
    // so we should be fine to pass in false to the force draw parameter.
    this.drawName(false, zoomPercent)
    this.drawGarrison(false, zoomPercent)
    this.drawInfrastructure(false, zoomPercent)
    this.drawPlanets(false, zoomPercent)
  }
}

export default Star
