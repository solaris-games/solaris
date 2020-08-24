import * as PIXI from 'pixi.js'
import EventEmitter from 'events'
import TextureService from './texture'

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
    this.zoomPercent = 0
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

  draw () {
    // Note: The star may become visible/hidden due to changing scanning range.
    // If a star is revealed or a star becomes masked then we want to force the entire
    // star to be re-drawn.
    let force = this.isInScanningRange !== this._isInScanningRange()

    this.drawStar(force)
    // this.drawTerritory(force)
    this.drawPlanets(force)
    this.drawColour(force)
    this.drawScanningRange(force)
    this.drawHyperspaceRange(force)
    this.drawName(force)
    this.drawGarrison(force)
    this.drawActive(force)

    this.isInScanningRange = this._isInScanningRange()
  }

  drawActive (force) {
    this.drawInfrastructure(force)
    this.drawGarrison(force)
    this.drawScanningRange(force)
    this.drawHyperspaceRange(force)
  }

  drawStar (force) {
    if (force && this.graphics_star) {
      this.container.removeChild(this.graphics_star)
      this.graphics_star = null
    }

    if (!this.graphics_star) {
      this.graphics_star = new PIXI.Graphics()

      this.container.addChild(this.graphics_star)
    }

    this.graphics_star.clear()

    this.graphics_star.visible = !this._getStarCarriers().length

    let radius = 3
    let alpha = this._isInScanningRange() ? 1 : 0.3

    this.graphics_star.beginFill(0xFFFFFF, alpha)
    this.graphics_star.drawStar(this.data.location.x, this.data.location.y, radius * 2, radius, radius - 3)
    this.graphics_star.endFill()

    this.container.hitArea = new PIXI.Circle(this.data.location.x, this.data.location.y, 15)
  }

  drawTerritory (force) {
    if (force && this.graphics_territory) {
      this.container.removeChild(this.graphics_territory)
      this.graphics_territory = null
    }

    if (!this.graphics_territory) {
      this.graphics_territory = new PIXI.Graphics()

      this.container.addChild(this.graphics_territory)
    }

    this.graphics_territory.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    this.graphics_territory.beginFill(player.colour.value, 0.1)
    this.graphics_territory.drawCircle(this.data.location.x, this.data.location.y, this.lightYearDistance / 3)
    this.graphics_territory.endFill()
  }

  drawPlanets (force) {
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

        let distanceToStar = 10 + (4 * i)
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

    this.container_planets.visible = this._isInScanningRange() && this.zoomPercent < 60
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

  drawName (force) {
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

    this.text_name.visible = this.isSelected || this.zoomPercent < 60
  }

  drawGarrison (force) {
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
    this.text_garrison.visible = totalGarrison > 0 && (this.isSelected || this.isMouseOver || this.zoomPercent < 50)
  }

  drawInfrastructure (force) {
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

      this.text_infrastructure.visible = this.isMouseOver || this.isSelected || this.zoomPercent < 40
    } else {
      this.text_infrastructure.visible = false
    }
  }

  // TODO: Not used, decide whether we actually want to display the player name on the map at all.
  // If not, remove this.
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
      } else {
        this.text_playerName.y = this.data.location.y + 17
      }

      this.text_playerName.visible = this.zoomPercent < 60
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

    let radius = ((player.research.scanning.level || 1) + 1) * this.lightYearDistance

    this.graphics_scanningRange.lineStyle(1, player.colour.value, 0.2)
    this.graphics_scanningRange.beginFill(player.colour.value, 0.075)
    this.graphics_scanningRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 2)
    this.graphics_scanningRange.endFill()
    this.graphics_scanningRange.zIndex = -1
    this.container.zIndex = -1
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
      this.container.zIndex = 0
      return
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    let radius = ((player.research.hyperspace.level || 1) + 1.5) * this.lightYearDistance

    this.graphics_hyperspaceRange.lineStyle(1, player.colour.value, 0.2)
    this.graphics_hyperspaceRange.beginFill(player.colour.value, 0.075)
    this.graphics_hyperspaceRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 3)
    this.graphics_hyperspaceRange.endFill()
    this.graphics_hyperspaceRange.zIndex = -1
    this.container.zIndex = -1
  }

  onClicked (e) {
    this.emit('onStarClicked', this.data)

    this.drawActive(false)
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
    this.zoomPercent = zoomPercent

    // Note: Should never need to force a redraw when zooming
    // so we should be fine to pass in false to the force draw parameter.
    this.drawName(false)
    this.drawGarrison(false)
    this.drawInfrastructure(false)
    this.drawPlanets(false)
  }
}

export default Star
