import * as PIXI from 'pixi.js'
import EventEmitter from 'events'
import TextureService from './texture'

class Star extends EventEmitter {

  static culling_margin = 16

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
    this.isInScanningRange = false // Default to false to  initial redraw
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
    return this._getStarCarriers().reduce((sum, c) => sum + (c.ships || 0), 0)
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
    this.container.hitArea = new PIXI.Circle(this.data.location.x, this.data.location.y, 15)
  }

  draw () {
    // Note: The star may become visible/hidden due to changing scanning range.
    // If a star is revealed or a star becomes masked then we want to  the entire
    // star to be re-drawn.

    this.drawStar()
    this.drawSpecialist()
    // this.drawTerritory()
    this.drawPlanets()
    this.drawColour()
    this.drawScanningRange()
    this.drawHyperspaceRange()
    this.drawName()
    this.drawGarrison()
    this.drawInfrastructure()

    this.isInScanningRange = this._isInScanningRange()
  }


  drawStar () {
    if (!this.graphics_star) {
      this.graphics_star = new PIXI.Graphics()
      this.container.addChild(this.graphics_star)
    }

    this.graphics_star.clear()

    let isInScanningRange = this._isInScanningRange()
    let radius = 4
    let alpha = isInScanningRange ? 1 : 0.5

    this.graphics_star.lineStyle(1, 0xFFFFFF, alpha)

    if (isInScanningRange) {
      this.graphics_star.beginFill(0xFFFFFF, alpha)
    }

    this.graphics_star.drawStar(this.data.location.x, this.data.location.y, 6, radius, radius - 2)

    if (isInScanningRange) {
      this.graphics_star.endFill()
    }
  }

  drawSpecialist () {
    if (!this.hasSpecialist()) {
      return
    }
    
    //FIXME potential resource leak, should not create a new sprite every time
    let specialistTexture = TextureService.getSpecialistTexture(this.data.specialistId, false)
    let specialistSprite = new PIXI.Sprite(specialistTexture)
    specialistSprite.width = 10
    specialistSprite.height = 10
    specialistSprite.x = this.data.location.x - 5
    specialistSprite.y = this.data.location.y - 5
    
    this.container.addChild(specialistSprite)
  }

  hasSpecialist () {
    return this.data.specialistId && this.data.specialistId > 0
  }

  drawTerritory () {

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

  drawPlanets () {
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

        let distanceToStar = 15 + (5 * i)
        let planetSize = Math.floor(Math.abs(this.data.location.y) + distanceToStar) % 3 + 1

        let orbitGraphics = new PIXI.Graphics()
        orbitGraphics.lineStyle(0.3, 0xFFFFFF)
        orbitGraphics.alpha = 0.1
        orbitGraphics.drawCircle(this.data.location.x, this.data.location.y, distanceToStar - (planetSize / 2))
        this.container_planets.addChild(orbitGraphics)

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
  }

  _getPlanetsCount () {
    if (!this.data.naturalResources) {
      return 0
    }
    
    return Math.min(Math.floor(this.data.naturalResources / 45 * 3), 5) // Anything over 45 gets 3 planets
  }

  _getPlanetOrbitDirection () {
    return Math.floor(Math.abs(this.data.location.y)) % 2 === 0
  }

  _getPlanetOrbitSpeed () {
    return Math.floor(Math.random() * (1000 - 500 + 1) + 500) // Random number between 500 and 1000
  }

  drawColour () {
    if (!this.graphics_colour_arc) {
      this.graphics_colour_arc = new PIXI.Graphics()
      this.container.addChild(this.graphics_colour_arc)
    }
    if (!this.graphics_colour_cir) {
      this.graphics_colour_cir = new PIXI.Graphics()
      this.container.addChild(this.graphics_colour_cir)
    }
    if (!this.graphics_colour_warp_arc) {
      this.graphics_colour_warp_arc = new PIXI.Graphics()
      this.container.addChild(this.graphics_colour_warp_arc)
    }
    if (!this.graphics_colour_warp_cir) {
      this.graphics_colour_warp_cir = new PIXI.Graphics()
      this.container.addChild(this.graphics_colour_warp_cir)
    }

    this.graphics_colour_arc.clear()
    this.graphics_colour_cir.clear()
    this.graphics_colour_warp_arc.clear()
    this.graphics_colour_warp_cir.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) {
      return
    }
    
    this.graphics_colour_arc.lineStyle(3, player.colour.value)
    this.graphics_colour_cir.lineStyle(3, player.colour.value)
    this.graphics_colour_warp_arc.lineStyle(2, player.colour.value)
    this.graphics_colour_warp_cir.lineStyle(2, player.colour.value)

    this.graphics_colour_arc.arc(this.data.location.x, this.data.location.y, 7, 0.785398, -0.785398)
    this.graphics_colour_cir.drawCircle(this.data.location.x, this.data.location.y, 7)
    
    this.graphics_colour_warp_arc.arc(this.data.location.x, this.data.location.y, 10, 0.785398, -0.785398)
    this.graphics_colour_warp_cir.drawCircle(this.data.location.x, this.data.location.y, 10)
  }

  _hasUnknownShips() {
      let carriersOrbiting = this._getStarCarriers()
      let scramblers = carriersOrbiting.reduce( (sum, c ) => sum + (c.ships==null), 0 )
      let scrambler = this.data.garrison == null 
      return ( (scramblers || scrambler) && this._isInScanningRange() )
  }

  drawName () {
    if (!this.text_name) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4

      this.text_name = new PIXI.Text(this.data.name, style)
      this.text_name.x = this.data.location.x + 5
      this.text_name.resolution = 10

      let totalKnownGarrison = (this.data.garrison || 0) + this._getStarCarrierGarrison()
      if ( (totalKnownGarrison > 0) || (this._getStarCarriers().length > 0) || this._hasUnknownShips() ) {
        this.text_name.y = this.data.location.y
      } else {
        this.text_name.y = this.data.location.y - (this.text_name.height / 2)
      }

      this.container.addChild(this.text_name)
    }
  }

  drawGarrison () {
    if (this.text_garrison) {
      this.text_garrison.texture.destroy(true)
      this.container.removeChild(this.text_garrison)
      this.text_garrison = null
    }

    if (!this.text_garrison) {
      let style = TextureService.DEFAULT_FONT_STYLE
      style.fontSize = 4

      let totalKnownGarrison = (this.data.garrison || 0) + this._getStarCarrierGarrison()

      let carriersOrbiting = this._getStarCarriers()
      let carrierCount = carriersOrbiting.length

      let garrisonText = ''
      let scramblers = 0
      if (carriersOrbiting) {
        scramblers = carriersOrbiting.reduce( (sum, c ) => sum + (c.ships==null), 0 )
      }
      if ( (scramblers == carrierCount) && (this.data.garrison == null) ) {
        garrisonText = '???'
      }
      else {
        garrisonText = totalKnownGarrison
        if( (scramblers > 0) || (this.data.garrison == null) ) {
          garrisonText += '*'
        }
      }

      if (carrierCount) {
        garrisonText += '/'
        garrisonText += carrierCount.toString()
      }

      if (garrisonText) {
        this.text_garrison = new PIXI.Text(garrisonText, style)
        this.text_garrison.scale.x = 1.5
        this.text_garrison.scale.y = 1.5
        this.text_garrison.resolution = 10

        this.text_garrison.x = this.data.location.x + 5
        this.text_garrison.y = this.data.location.y - this.text_garrison.height + 1.5

        this.container.addChild(this.text_garrison)
      }
    }
  }

  drawInfrastructure () {
    if ( this.text_infrastructure ) {
      this.text_infrastructure.texture.destroy(true)
      this.container.removeChild(this.text_infrastructure)
      this.text_infrastructure = null
    }

    if (!this.text_infrastructure) {
      if (this.data.ownedByPlayerId && this._isInScanningRange()) {
        let style = TextureService.DEFAULT_FONT_STYLE
        style.fontSize = 4
        let displayInfrastructure = `${this.data.infrastructure.economy} ${this.data.infrastructure.industry} ${this.data.infrastructure.science}`

        this.text_infrastructure = new PIXI.Text(displayInfrastructure, style)
        this.text_infrastructure.resolution = 10

        this.text_infrastructure.x = this.data.location.x - (this.text_infrastructure.width / 2)
        this.text_infrastructure.y = this.data.location.y - 15

        this.container.addChild(this.text_infrastructure)
      }
    }
  }

  drawScanningRange () {
    if (!this.graphics_scanningRange) {
      this.graphics_scanningRange = new PIXI.Graphics()
      this.container.addChild(this.graphics_scanningRange)
    }

    this.graphics_scanningRange.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    // TODO: Use the game helper instead?
    let techLevel = player.research.scanning.effective
    
    if (this.data.specialist && this.data.specialist.modifiers.local) {
      techLevel += this.data.specialist.modifiers.local.scanning || 0
    }

    techLevel = Math.max(1, techLevel)

    let radius = ((techLevel || 1) + 1) * this.lightYearDistance

    this.graphics_scanningRange.lineStyle(1, player.colour.value, 0.2)
    this.graphics_scanningRange.beginFill(player.colour.value, 0.075)
    // this.graphics_scanningRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 2)
    this.graphics_scanningRange.drawCircle(this.data.location.x, this.data.location.y, radius)
    this.graphics_scanningRange.endFill()
    this.graphics_scanningRange.zIndex = -1
    this.container.zIndex = -1

    this.graphics_scanningRange.visible = this.isSelected
  }

  drawHyperspaceRange () {

    if (!this.graphics_hyperspaceRange) {
      this.graphics_hyperspaceRange = new PIXI.Graphics()
      this.container.addChild(this.graphics_hyperspaceRange)
    }

    this.graphics_hyperspaceRange.clear()

    if (!this.isSelected) {
      this.container.zIndex = 0
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    // TODO: Use the game helper instead?
    let techLevel = player.research.hyperspace.effective
    
    if (this.data.specialist && this.data.specialist.modifiers.local) {
      techLevel += this.data.specialist.modifiers.local.hyperspace || 0
    }

    techLevel = Math.max(1, techLevel)

    let radius = ((techLevel || 1) + 1.5) * this.lightYearDistance

    this.graphics_hyperspaceRange.lineStyle(1, player.colour.value, 0.2)
    this.graphics_hyperspaceRange.beginFill(player.colour.value, 0.075)
    this.graphics_hyperspaceRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 3)
    this.graphics_hyperspaceRange.endFill()
    this.graphics_hyperspaceRange.zIndex = -1
    this.container.zIndex = -1

    this.graphics_hyperspaceRange.visible = this.isSelected
  }

  onTick(deltaTime, viewportData) {
   let deltax = Math.abs(viewportData.center.x - this.data.location.x) - Star.culling_margin
   let deltay = Math.abs(viewportData.center.y - this.data.location.y) - Star.culling_margin
 
   if ((deltax > viewportData.xradius) || (deltay > viewportData.yradius)) {
     //cannot set parent container visibility, since scannrange and hyperrange circles stretch away from star location
     // maybe put them on their own container, since this piece of code should remain as small as possible
     this.graphics_star.visible = false
     this.graphics_colour_arc.visible = false
     this.graphics_colour_cir.visible = false
     this.graphics_colour_warp_arc.visible = false
     this.graphics_colour_warp_cir.visible = false
     this.text_name.visible = false
     this.container_planets.visible = false
     if (this.text_infrastructure) { this.text_infrastructure.visible = false }
     if (this.text_garrison) { this.text_garrison.visible = false }
   } 
   else {
     this.updateVisibility()
   }
  }

  onClicked (e) {
    if (e && e.data && e.data.originalEvent && e.data.originalEvent.button === 2) {
      this.emit('onStarRightClicked', this.data)
    } else {
      let eventData = e ? e.data : null

      this.emit('onStarClicked', {starData: this.data, eventData} )

      // Need to do this otherwise sometimes text gets highlighted.
      this.deselectAllText()
      
      if (this._getStarPlayer()) {
        this.updateVisibility()
      }
    }
  }

  updateVisibility() {
    this.graphics_star.visible = !this.hasSpecialist()
    this.graphics_colour_arc.visible = this.zoomPercent < 60
    this.graphics_colour_cir.visible = this.zoomPercent >= 60
    this.graphics_colour_warp_arc.visible = this.zoomPercent < 60 && this.data.warpGate
    this.graphics_colour_warp_cir.visible = this.zoomPercent >= 60 && this.data.warpGate
    this.graphics_hyperspaceRange.visible = this.isSelected// && this.zoomPercent < 100
    this.graphics_scanningRange.visible = this.isSelected// && this.zoomPercent < 100
    this.text_name.visible = this.zoomPercent < 60 || (this.isSelected && this.zoomPercent < 60) 
    this.container_planets.visible = this._isInScanningRange() && this.zoomPercent < 60

    if (this.text_infrastructure) { // may not exist for stars out of range
      this.text_infrastructure.visible = this.zoomPercent < 35 || (this.isSelected && this.zoomPercent < 35) || (this.isMouseOver && this.zoomPercent < 35)
    }
    if (this.text_garrison) {
      this.text_garrison.visible = this.data.infrastructure && (this.zoomPercent < 60 || (this.isSelected && this.zoomPercent < 60) || (this.isMouseOver && this.zoomPercent < 60))
    }
  }

  deselectAllText () {
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
  }

  onMouseOver (e) {
    this.isMouseOver = true

    this.emit('onStarMouseOver', this.data)
  }

  onMouseOut (e) {
    this.isMouseOver = false

    this.emit('onStarMouseOut', this.data)
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent
  }
}

export default Star
