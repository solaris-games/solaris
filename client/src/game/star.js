import * as PIXI from 'pixi.js-legacy'
import EventEmitter from 'events'
import TextureService from './texture'

class Star extends EventEmitter {

  static culling_margin = 16

  /*
    Defines what zoompercentage correspond to what
    depth level.
    This is something you can tinker with
    Potentially even make user defined.
  */
  static zoomLevelDefinitions = {
    infrastructure: 200,
    name: 160,
    naturalResources: 160,
    shipCount: 120
  }

  constructor (app) {
    super()

    this.app = app
    this.container = new PIXI.Container()
    this.fixedContainer = new PIXI.Container() // this container isnt affected by culling or user setting scalling
    this.container.interactive = true
    this.container.buttonMode = true

    this.graphics_shape_part = new PIXI.Graphics()
    this.graphics_shape_full = new PIXI.Graphics()
    this.graphics_shape_part_warp = new PIXI.Graphics()
    this.graphics_shape_full_warp = new PIXI.Graphics()
    this.graphics_hyperspaceRange = new PIXI.Graphics()
    this.graphics_natural_resources_ring = new PIXI.Graphics()
    this.graphics_scanningRange = new PIXI.Graphics()
    this.graphics_star = new PIXI.Graphics()

    this.container.addChild(this.graphics_star)
    this.container.addChild(this.graphics_natural_resources_ring)
    this.container.addChild(this.graphics_shape_part)
    this.container.addChild(this.graphics_shape_full)
    this.container.addChild(this.graphics_shape_part_warp)
    this.container.addChild(this.graphics_shape_full_warp)

    this.fixedContainer.addChild(this.graphics_scanningRange)
    this.fixedContainer.addChild(this.graphics_hyperspaceRange)

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.isSelected = false
    this.isMouseOver = false
    this.isInScanningRange = false // Default to false to  initial redraw
    this.zoomPercent = 0

    /**
      Zoomdepth
      I'd make this an enum if I could...

      This is a value ranging from 1 to 4
      1: Display stars only
      2: Display shipcounts and orbit
      3: Display shipcount, orbit and name
      4: Display shipcount, orbit, name and infrastructure

      What zoompercentage corresponds with what depth level
      can be read from static property "zoomLevelDefinitions"
    */
    this.zoomDepth = 1
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

  setup (data, userSettings, players, carriers, lightYearDistance) {
    this.data = data
    this.players = players
    this.carriers = carriers
    this.lightYearDistance = lightYearDistance
    this.container.position.x = this.data.location.x
    this.container.position.y = this.data.location.y
    this.fixedContainer.position.x = this.data.location.x
    this.fixedContainer.position.y = this.data.location.y
    this.container.hitArea = new PIXI.Circle(0, 0, 15)

    this.userSettings = userSettings

    // TODO maybe all these could be static variables since these are all the same for every star
    this.clampedScaling = this.userSettings.map.objectsScaling == 'clamped'
    this.baseScale = 1 //TODO add user setting for this independent of clamped or default
    //divide these by 4 to allow more control while keeping the UI as int
    this.minScale = this.userSettings.map.objectsMinimumScale/4.0
    this.maxScale = this.userSettings.map.objectsMaximumScale/4.0

    Star.zoomLevelDefinitions = userSettings.map.zoomLevels.star
  }

  draw () {
    // Note: The star may become visible/hidden due to changing scanning range.
    // If a star is revealed or a star becomes masked then we want to  the entire
    // star to be re-drawn.

    this.drawStar()
    this.drawSpecialist()
    this.drawPlanets()
    this.drawNaturalResourcesRing()
    this.drawColour()
    this.drawScanningRange()
    this.drawHyperspaceRange()
    this.drawName()
    this.drawGarrison()
    this.drawInfrastructure()

    this.isInScanningRange = this._isInScanningRange()
  }


  drawStar () {
    this.graphics_star.clear()

    let isInScanningRange = this._isInScanningRange()
    let radius = 4
    let alpha = isInScanningRange ? 1 : 0.5
    let starPoints = 6

    this.graphics_star.lineStyle(1, 0xFFFFFF, alpha)

    if (isInScanningRange) {
      this.graphics_star.beginFill(0xFFFFFF, alpha)
    }
    this.graphics_star.drawStar(0, 0, starPoints, radius, radius - 2)
    if (isInScanningRange) {
      this.graphics_star.endFill()
    }

  }

  drawSpecialist () {
    if (!this.hasSpecialist()) {
      return
    }

    if (this.specialistSprite) {
      this.container.removeChild(this.specialistSprite)
      this.specialistSprite = null
    }

    //FIXME potential resource leak, should not create a new sprite every time
    let specialistTexture = TextureService.getSpecialistTexture(this.data.specialistId, false)
    this.specialistSprite = new PIXI.Sprite(specialistTexture)

    this.specialistSprite.width = 10
    this.specialistSprite.height = 10
    this.specialistSprite.x = -5
    this.specialistSprite.y = -5

    this.container.addChild(this.specialistSprite)
  }

  hasSpecialist () {
    return this.data.specialistId && this.data.specialistId > 0
  }

  drawPlanets () {
    if (this.userSettings.map.naturalResources !== 'planets') {
      if (this.container_planets) {
        this.container.removeChild(this.container_planets)
        this.container_planets = null
      }

      return
    }
    if (!this.container_planets) {
      this.container_planets = new PIXI.Container()

      // The more resources a star has the more planets it has.
      let planetCount = this._getPlanetsCount()

      if (planetCount === 0) {
        return
      }

      let player = this._getStarPlayer()
      let playerColour = player ? player.colour.value : 0xFFFFFF

      let rotationDirection = this._getPlanetOrbitDirection()
      let rotationSpeedModifier = this._getPlanetOrbitSpeed()

      for (let i = 0; i < planetCount; i++) {
        let planetContainer = new PIXI.Container()

        let distanceToStar = 15 + (5 * i)
        let planetSize = Math.floor(Math.abs(this.data.location.y) + distanceToStar) % 1.5 + 0.5

        let orbitGraphics = new PIXI.Graphics()
        orbitGraphics.lineStyle(0.3, 0xFFFFFF)
        orbitGraphics.alpha = 0.1
        orbitGraphics.drawCircle(0, 0, distanceToStar -(planetSize / 2))
        this.container_planets.addChild(orbitGraphics)

        let planetGraphics = new PIXI.Graphics()
        planetGraphics.beginFill(playerColour)
        planetGraphics.drawCircle(planetSize / 2, 0, planetSize)
        planetGraphics.endFill()

        if (!this._isInScanningRange()) {
          planetGraphics.alpha = 0.3
        }

        planetContainer.addChild(planetGraphics)

        planetContainer.pivot.set(distanceToStar, 0)

        let rotationSpeed = (planetCount - i) / rotationSpeedModifier

        this.app.ticker.add((delta) => {
          //TODO maybe check if visible? no need to rotate planets outside viewport
          if (rotationDirection) {
            planetContainer.rotation += rotationSpeed * delta
          } else {
            planetContainer.rotation -= rotationSpeed * delta
          }
        })

        this.container_planets.addChild(planetContainer)
      }

      this.container.addChild(this.container_planets)
    }
  }

  drawNaturalResourcesRing () {
    this.graphics_natural_resources_ring.clear()

    if (this.userSettings.map.naturalResources !== 'single-ring') {
      return
    }

    // let ringRadius = this.data.naturalResources > 100 ? 100 : this.data.naturalResources
    // TODO: Experimental:
    let ringRadius = this.data.naturalResources <= 50 ? this.data.naturalResources : this.data.naturalResources > 400 ? 100 : (12.5 * Math.log2(this.data.naturalResources / 50) + 50)

    this.graphics_natural_resources_ring.clear()
    this.graphics_natural_resources_ring.lineStyle(1, 0xFFFFFF, 0.1)
    this.graphics_natural_resources_ring.drawCircle(0, 0, ringRadius * 0.75)
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
    this.graphics_shape_part.clear()
    this.graphics_shape_full.clear()
    this.graphics_shape_part_warp.clear()
    this.graphics_shape_full_warp.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) {
      return
    }

    this.graphics_shape_part.lineStyle(3, player.colour.value)
    this.graphics_shape_full.lineStyle(3, player.colour.value)
    this.graphics_shape_part_warp.lineStyle(2, player.colour.value)
    this.graphics_shape_full_warp.lineStyle(2, player.colour.value)

    switch (player.shape) {
      case 'circle':
        this._drawColourCircle()
        break
      case 'square':
        this._drawColourSquare()
        break
      case 'diamond':
        this._drawColourDiamond()
        break;
      case 'hexagon':
        this._drawColourHexagon()
        break;
    }
  }

  _drawColourCircle () {
    this.graphics_shape_part.arc(0, 0, 7, 0.785398, -0.785398)
    this.graphics_shape_full.drawCircle(0, 0, 7)

    this.graphics_shape_part_warp.arc(0, 0, 10, 0.785398, -0.785398)
    this.graphics_shape_full_warp.drawCircle(0, 0, 10)
  }

  _drawColourSquare () {
    this.graphics_shape_part.moveTo(7, -7)
    this.graphics_shape_part.lineTo(-7, -7)
    this.graphics_shape_part.lineTo(-7, 7)
    this.graphics_shape_part.lineTo(7, 7)

    this.graphics_shape_full.drawRect(-7, -7, 14, 14)

    this.graphics_shape_part_warp.moveTo(7, -10)
    this.graphics_shape_part_warp.lineTo(-10, -10)
    this.graphics_shape_part_warp.lineTo(-10, 10)
    this.graphics_shape_part_warp.lineTo(7, 10)

    this.graphics_shape_full_warp.drawRect(-10, -10, 20, 20)
  }

  _drawColourDiamond () {
    let s = 9;
    let w = 14;

    this.graphics_shape_part.moveTo(0, -s)
    this.graphics_shape_part.lineTo(-s, 0)
    this.graphics_shape_part.lineTo(0, s)

    this.graphics_shape_full.moveTo(0, -s)
    this.graphics_shape_full.lineTo(-s, 0)
    this.graphics_shape_full.lineTo(0, s)
    this.graphics_shape_full.lineTo(s, 0)
    this.graphics_shape_full.closePath()

    this.graphics_shape_part_warp.moveTo(0, -w)
    this.graphics_shape_part_warp.lineTo(-w, 0)
    this.graphics_shape_part_warp.lineTo(0, w)

    this.graphics_shape_full_warp.moveTo(0, -w)
    this.graphics_shape_full_warp.lineTo(-w, 0)
    this.graphics_shape_full_warp.lineTo(0, w)
    this.graphics_shape_full_warp.lineTo(w, 0)
    this.graphics_shape_full_warp.closePath()
  }

  _drawColourHexagon () {
    this.graphics_shape_part.moveTo(4, -7)
    this.graphics_shape_part.lineTo(-4, -7)
    this.graphics_shape_part.lineTo(-8, 0)
    this.graphics_shape_part.lineTo(-4, 7)
    this.graphics_shape_part.lineTo(4, 7)

    this.graphics_shape_full.moveTo(4, -7)
    this.graphics_shape_full.lineTo(-4, -7)
    this.graphics_shape_full.lineTo(-8, 0)
    this.graphics_shape_full.lineTo(-4, 7)
    this.graphics_shape_full.lineTo(4, 7)
    this.graphics_shape_full.lineTo(8, 0)
    this.graphics_shape_full.closePath()

    this.graphics_shape_part_warp.moveTo(6.5, -10.5)
    this.graphics_shape_part_warp.lineTo(-6.5, -10.5)
    this.graphics_shape_part_warp.lineTo(-12, 0)
    this.graphics_shape_part_warp.lineTo(-6.5, 10.5)
    this.graphics_shape_part_warp.lineTo(6.5, 10.5)

    this.graphics_shape_full_warp.moveTo(6.5, -10.5)
    this.graphics_shape_full_warp.lineTo(-6.5, -10.5)
    this.graphics_shape_full_warp.lineTo(-12, 0)
    this.graphics_shape_full_warp.lineTo(-6.5, 10.5)
    this.graphics_shape_full_warp.lineTo(6.5, 10.5)
    this.graphics_shape_full_warp.lineTo(12, 0)
    this.graphics_shape_full_warp.closePath()
  }

  _hasUnknownShips() {
      let carriersOrbiting = this._getStarCarriers()
      let scramblers = carriersOrbiting.reduce( (sum, c ) => sum + (c.ships==null), 0 )
      let scrambler = this.data.garrison == null
      return ( (scramblers || scrambler) && this._isInScanningRange() )
  }

  drawName () {
    if (!this.text_name) {
      let style = Object.assign({}, TextureService.DEFAULT_FONT_STYLE)
      style.fontSize = 4

      this.text_name = new PIXI.Text(this.data.name, style)
      this.text_name.x = 5
      this.text_name.resolution = 15

      this.container.addChild(this.text_name)
    }

    let totalKnownGarrison = (this.data.garrison || 0) + this._getStarCarrierGarrison()

    if ((totalKnownGarrison > 0) || (this._getStarCarriers().length > 0) || this._hasUnknownShips()) {
      this.text_name.y = 0
    } else {
      this.text_name.y = -(this.text_name.height / 2)
    }
  }

  drawGarrison () {
    if (this.text_garrison_small) {
      this.text_garrison_small.texture.destroy(true)
      this.container.removeChild(this.text_garrison_small)
      this.text_garrison_small = null
    }

    if (this.text_garrison_big) {
      this.text_garrison_big.texture.destroy(true)
      this.container.removeChild(this.text_garrison_big)
      this.text_garrison_big = null
    }

    let style_small = Object.assign({}, TextureService.DEFAULT_FONT_STYLE)
    let style_big = Object.assign({}, TextureService.DEFAULT_FONT_STYLE)
    style_small.fontSize = 4
    style_big.fontSize = 7

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

    function make_garrison_text(small) {
      let text_garrison = new PIXI.Text(garrisonText, small ? style_small : style_big)
      text_garrison.scale.x = 1.5
      text_garrison.scale.y = 1.5
      text_garrison.resolution = 10

      text_garrison.x = 5
      text_garrison.y = -text_garrison.height + (small ? 1.5 : 6)
      return text_garrison
    }

    if (garrisonText) {
      this.text_garrison_small = make_garrison_text(true)
      this.text_garrison_big = make_garrison_text(false)
      this.container.addChild(this.text_garrison_small)
      this.container.addChild(this.text_garrison_big)
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

        this.text_infrastructure.x = -(this.text_infrastructure.width / 2)
        this.text_infrastructure.y = -15

        this.container.addChild(this.text_infrastructure)
      }
    }
  }

  drawScanningRange () {
    this.graphics_scanningRange.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    // TODO: Use the game helper instead?
    let techLevel = player.research.scanning.level

    if (this.data.specialist && this.data.specialist.modifiers.local) {
      techLevel += this.data.specialist.modifiers.local.scanning || 0
    }

    techLevel = Math.max(1, techLevel)

    let radius = ((techLevel || 1) + 1) * this.lightYearDistance

    this.graphics_scanningRange.lineStyle(1, player.colour.value, 0.2)
    this.graphics_scanningRange.beginFill(player.colour.value, 0.075)
    // this.graphics_scanningRange.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 2)
    this.graphics_scanningRange.drawCircle(0, 0, radius)
    this.graphics_scanningRange.endFill()
    this.graphics_scanningRange.zIndex = -1
    this.container.zIndex = -1

    this.graphics_scanningRange.visible = this.isSelected
  }

  drawHyperspaceRange () {
    this.graphics_hyperspaceRange.clear()

    if (!this.isSelected) {
      this.container.zIndex = 0
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) { return }

    // TODO: Use the game helper instead?
    let techLevel = player.research.hyperspace.level

    if (this.data.specialist && this.data.specialist.modifiers.local) {
      techLevel += this.data.specialist.modifiers.local.hyperspace || 0
    }

    techLevel = Math.max(1, techLevel)

    let radius = ((techLevel || 1) + 1.5) * this.lightYearDistance

    this.graphics_hyperspaceRange.lineStyle(1, player.colour.value, 0.2)
    this.graphics_hyperspaceRange.beginFill(player.colour.value, 0.075)
    this.graphics_hyperspaceRange.drawStar(0, 0, radius, radius, radius - 3)
    this.graphics_hyperspaceRange.endFill()
    this.graphics_hyperspaceRange.zIndex = -1
    this.container.zIndex = -1

    this.graphics_hyperspaceRange.visible = this.isSelected
  }


  onTick( deltaTime, zoomPercent, viewportData ) {
   let deltax = Math.abs(viewportData.center.x - this.data.location.x) - Star.culling_margin
   let deltay = Math.abs(viewportData.center.y - this.data.location.y) - Star.culling_margin

   if ((deltax > viewportData.xradius) || (deltay > viewportData.yradius)) {
     //cannot set parent container visibility, since scannrange and hyperrange circles stretch away from star location
     // maybe put them on their own container, since this piece of code should remain as small as possible
     this.graphics_star.visible = false
     this.graphics_shape_part.visible = false
     this.graphics_shape_full.visible = false
     this.graphics_shape_part_warp.visible = false
     this.graphics_shape_full_warp.visible = false
     this.graphics_natural_resources_ring.visible = false

     if (this.text_name) this.text_name.visible = false
     if (this.container_planets) this.container_planets.visible = false
     if (this.text_infrastructure) this.text_infrastructure.visible = false
     if (this.text_garrison_small) this.text_garrison_small.visible = false
     if (this.text_garrison_big) this.text_garrison_big.visible = false
   }
   else {
     this.updateVisibility()
     this.setScale(zoomPercent)
   }
  }

  setScale( zoomPercent ) {
     if(this.clampedScaling) {
       let currentScale = zoomPercent/100
       if (currentScale < this.minScale) {
         this.container.scale.x = (1/currentScale)*this.minScale
         this.container.scale.y = (1/currentScale)*this.minScale
       } else if (currentScale > this.maxScale) {
         this.container.scale.x = (1/currentScale)*this.maxScale
         this.container.scale.y = (1/currentScale)*this.maxScale
       }
       else {
         this.container.scale.x = this.baseScale
         this.container.scale.y = this.baseScale
       }
     }
     else {
       this.container.scale.x = this.baseScale
       this.container.scale.y = this.baseScale
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
        // this.setScale()
      }
    }
  }

  updateVisibility() {
    this.graphics_star.visible = !this.hasSpecialist()
    this.graphics_hyperspaceRange.visible = this.isSelected
    this.graphics_scanningRange.visible = this.isSelected
    this.graphics_natural_resources_ring.visible = this._isInScanningRange() && this.zoomPercent >= Star.zoomLevelDefinitions.naturalResources

    if (this.text_name) this.text_name.visible = this.isSelected || this.zoomPercent >= Star.zoomLevelDefinitions.name
    if (this.container_planets) this.container_planets.visible = this._isInScanningRange() && this.zoomPercent >= Star.zoomLevelDefinitions.naturalResources
    if (this.text_infrastructure) this.text_infrastructure.visible = this.isSelected || this.zoomPercent >= Star.zoomLevelDefinitions.infrastructure

    let small_garrison = this.zoomPercent >= Star.zoomLevelDefinitions.name || this.isSelected
    let visible_garrison = !!(this.data.infrastructure && (this.isSelected || this.isMouseOver || this.zoomPercent >= Star.zoomLevelDefinitions.shipCount))

    if (this.text_garrison_small) this.text_garrison_small.visible = small_garrison && visible_garrison
    if (this.text_garrison_big) this.text_garrison_big.visible = !small_garrison && visible_garrison

    let partial_ring = (this.text_garrison_big && this.text_garrison_big.visible)
      || (this.text_garrison_small && this.text_garrison_small.visible)
      || (this.text_name && this.text_name.visible)

    this.graphics_shape_part.visible = partial_ring
    this.graphics_shape_full.visible = !partial_ring
    this.graphics_shape_part_warp.visible = partial_ring && this.data.warpGate
    this.graphics_shape_full_warp.visible = !partial_ring && this.data.warpGate

    // this.baseScale = this.isSelected ? 1.5 : 1
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

  //This could in the future be a setter function on ZoomPercent
  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent
    this._updateDepthLevel()
  }

  //I hope I can make this independant from this class at some point
  ///Updates the zoomDepth value according to zoomPercent
  _updateDepthLevel() {
    let old = this.zoomDepth
    this.zoomDepth = 1
    for (let depth in Star.zoomLevelDefinitions) {
      if (Star.zoomLevelDefinitions[depth] < this.zoomPercent) {
        this.zoomDepth = depth
      }
    }

    //Update everything
    if (this.zoomDepth != old) this.updateVisibility()
  }
}

export default Star
