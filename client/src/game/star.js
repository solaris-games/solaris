import * as PIXI from 'pixi.js-legacy'
import TextureService from './texture'
import gameHelper from '../services/gameHelper'
import seededRandom from 'random-seed'
import Helpers from './helpers'
import {EventEmitter} from "./eventEmitter.js";

class Star extends EventEmitter {

  static culling_margin = 16
  static nameSize = 4
  static shipsSmallSize = 6
  static shipsBigSize = 10
  static maxLod = 4
  static seededRNG = seededRandom.create()

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
    this.fixedContainer = new PIXI.Container() // this container isnt affected by culling or user setting scalling
    this.fixedContainer.interactiveChildren = false
    this.fixedContainer.eventMode = 'none'
    this.container = new PIXI.Container()
    this.container.interactiveChildren = false
    this.container.cursor = 'pointer'
    this.container.eventMode = 'static';
    this.container.interactiveChildren = false;

    this.graphics_shape_part = new PIXI.Graphics()
    this.graphics_shape_full = new PIXI.Graphics()
    this.graphics_shape_part_warp = new PIXI.Graphics()
    this.graphics_shape_full_warp = new PIXI.Graphics()
    this.graphics_hyperspaceRange = new PIXI.Graphics()
    this.graphics_natural_resources_ring = new Array(Star.maxLod)
    this.graphics_scanningRange = new PIXI.Graphics()
    this.graphics_star = new PIXI.Graphics()
    this.graphics_targeted = new PIXI.Graphics()
    this.graphics_selected = new PIXI.Graphics()
    this.graphics_kingOfTheHill = new PIXI.Graphics()

    this.container.addChild(this.graphics_star)
    this.container.addChild(this.graphics_shape_part)
    this.container.addChild(this.graphics_shape_full)
    this.container.addChild(this.graphics_shape_part_warp)
    this.container.addChild(this.graphics_shape_full_warp)
    this.container.addChild(this.graphics_targeted)
    this.container.addChild(this.graphics_selected)
    this.container.addChild(this.graphics_kingOfTheHill)

    this.fixedContainer.addChild(this.graphics_scanningRange)
    this.fixedContainer.addChild(this.graphics_hyperspaceRange)

    this.container.on('pointerup', this.onClicked.bind(this))
    this.container.on('mouseover', this.onMouseOver.bind(this))
    this.container.on('mouseout', this.onMouseOut.bind(this))

    this.planets = null
    this.handleOrbitPlanetsStep = null

    this.isSelected = false
    this.isMouseOver = false
    this.zoomPercent = 100
    this.showIgnoreBulkUpgradeInfrastructure = false

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

  _getStarCarrierShips () {
    return this._getStarCarriers().reduce((sum, c) => sum + (c.ships || 0), 0)
  }

  setup (game, data, userSettings, context, players, carriers, lightYearDistance) {
    this.game = game
    this.data = data
    this.players = players
    this.carriers = carriers
    this.context = context
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

    this.drawKingOfTheHillCircle()
    this.drawWormHole()
    this.drawPulsar()
    this.drawNebula()
    this.drawAsteroidField()
    this.drawTarget()
    this.drawSelectedCircle()
    this.drawStar()
    this.drawSpecialist()
    this.drawPlanets()
    this.drawNaturalResourcesRing()
    this.drawColour()
    this.drawScanningRange()
    this.drawHyperspaceRange()
    this.drawName()
    this.drawShips()
    this.drawInfrastructure()
    this.drawInfrastructureBulkIgnored()
    this.drawDepth()
  }


  drawStar () {
    this.container.removeChild(this.graphics_star)

    if (this.data.isInScanningRange) {
      // ---- Binary stars ----
      if (this.isBinaryStar()) {
        if (this.hasBlackHole()) {
          this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['black_hole_binary'])
        } else if (this._isDeadStar()) {
          this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['binary_unscannable'])
        } else {
          this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['binary_scannable'])
        }
      }
      // ---- Non binary stars ----
      else if (this.hasBlackHole()) {
        this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['black_hole'])
      } else if (this._isDeadStar()) {
        this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['unscannable'])
      } else if (this.data.homeStar) {
        this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['home'])
      }  else {
        this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['scannable'])
      }
    }
    else {
      this.graphics_star = new PIXI.Sprite(TextureService.STAR_SYMBOLS['unscannable'])
      this.graphics_star.tint = 0xa0a0a0
    }

    if (gameHelper.isRedCapital(this.game, this.data)) {
      this.graphics_star.tint = 0xFF0000
    }

    this.graphics_star.anchor.set(0.5)
    this.graphics_star.width = 24.0/2.0
    this.graphics_star.height = 24.0/2.0

    this.container.addChild(this.graphics_star)
  }

  drawPulsar () {
    if(!this.isPulsar()) {
      return
    }

    if (this.pulsarGraphics) {
      this.container.removeChild(this.pulsarGraphics)
      this.pulsarGraphics = null
    }

    let seed = this.data._id
    Star.seededRNG.seed(seed)

    let player = this._getStarPlayer()
    let playerColour = player ? this.context.getPlayerColour(player._id) : 0xFFFFFF

    this.pulsarGraphics = new PIXI.Graphics()
    this.pulsarGraphics.zIndex = -1
    this.pulsarGraphics.lineStyle(1, playerColour, 0.5)
    this.pulsarGraphics.moveTo(0, -20)
    this.pulsarGraphics.lineTo(0, 20)
    this.pulsarGraphics.drawEllipse(-5, 0, 5, 5)
    this.pulsarGraphics.drawEllipse(5, 0, 5, 5)
    this.pulsarGraphics.drawEllipse(-8, 0, 8, 8)
    this.pulsarGraphics.drawEllipse(8, 0, 8, 8)
    this.pulsarGraphics.rotation = Star.seededRNG.random()*Math.PI*2.0

    this.container.addChild(this.pulsarGraphics)
  }

  drawNebula () {
    if(!this.hasNebula()) {
      return
    }
    if (this.nebulaSprite) {
      this.fixedContainer.removeChild(this.nebulaSprite)
      this.nebulaSprite = null
    }
    let seed = this.data._id
    Star.seededRNG.seed(seed)
    let nebulaTexture = TextureService.getRandomStarNebulaTexture(seed)
    this.nebulaSprite = new PIXI.Sprite(nebulaTexture)

    let spriteSize = 64
    this.nebulaSprite.width = spriteSize
    this.nebulaSprite.height = spriteSize
    this.nebulaSprite.anchor.set(0.5)
    this.nebulaSprite.rotation = Star.seededRNG.random()*Math.PI*2.0

    let player = this._getStarPlayer()
    let playerColour = player ? this.context.getPlayerColour(player._id): 0xFFFFFF
    this.nebulaSprite.tint = playerColour
    //this.nebulaSprite.blendMode = PIXI.BLEND_MODES.ADD // for extra punch

    let blendSprite = new PIXI.Sprite(nebulaTexture)
    blendSprite.anchor.set(0.5)
    blendSprite.rotation = Star.seededRNG.random()*Math.PI*2.0
    //blendSprite.blendMode = PIXI.BLEND_MODES.ADD
    blendSprite.tint = playerColour
    this.nebulaSprite.addChild(blendSprite)

    this.fixedContainer.addChild(this.nebulaSprite)
  }

  drawWormHole () {
    if (!this.data.wormHoleToStarId) {
      return
    }

    if (this.wormHoleSprite) {
      this.fixedContainer.removeChild(this.wormHoleSprite)
      this.wormHoleSprite = null
    }

    let texture = TextureService.getRandomWormholeTexture()
    this.wormHoleSprite = new PIXI.Sprite(texture)

    let spriteSize = 40
    this.wormHoleSprite.width = spriteSize
    this.wormHoleSprite.height = spriteSize
    this.wormHoleSprite.anchor.set(0.5)
    this.wormHoleSprite.rotation = Math.random()*Math.PI*2.0
    this.wormHoleSprite.alpha = 0.35

    let player = this._getStarPlayer()
    let playerColour = player ? this.context.getPlayerColour(player._id) : 0xFFFFFF
    this.wormHoleSprite.tint = playerColour
    //this.asteroidFieldSprite.blendMode = PIXI.BLEND_MODES.ADD // for extra punch

    this.fixedContainer.addChild(this.wormHoleSprite)
  }

  drawAsteroidField () {
    if(!this.hasAsteroidField()) {
      return
    }
    if (this.asteroidFieldSprite) {
      this.fixedContainer.removeChild(this.asteroidFieldSprite)
      this.asteroidFieldSprite = null
    }
    let seed = this.data._id
    Star.seededRNG.seed(seed)
    let texture = TextureService.getRandomStarAsteroidFieldTexture(seed)
    this.asteroidFieldSprite = new PIXI.Sprite(texture)

    let spriteSize = 64
    this.asteroidFieldSprite.width = spriteSize
    this.asteroidFieldSprite.height = spriteSize
    this.asteroidFieldSprite.anchor.set(0.5)
    this.asteroidFieldSprite.rotation = Star.seededRNG.random()*Math.PI*2.0

    let player = this._getStarPlayer()
    let playerColour = player ? this.context.getPlayerColour(player._id) : 0xFFFFFF
    this.asteroidFieldSprite.tint = playerColour
    //this.asteroidFieldSprite.blendMode = PIXI.BLEND_MODES.ADD // for extra punch

    this.fixedContainer.addChild(this.asteroidFieldSprite)
  }

  drawSpecialist () {
    if (this.specialistSprite) {
      this.container.removeChild(this.specialistSprite)
      this.specialistSprite = null
    }

    if (!this.hasSpecialist()) {
      return
    }

    //FIXME potential resource leak, should not create a new sprite every time
    let specialistTexture = TextureService.getSpecialistTexture(this.data.specialist.key)
    this.specialistSprite = new PIXI.Sprite(specialistTexture)

    this.specialistSprite.width = 10
    this.specialistSprite.height = 10
    this.specialistSprite.x = -5
    this.specialistSprite.y = -5

    if (gameHelper.isRedCapital(this.game, this.data)) {
      this.specialistSprite.tint = 0xFF0000
    }

    this.container.addChild(this.specialistSprite)
  }

  hasNebula () {
    return this.data.isNebula
  }

  hasAsteroidField () {
    return this.data.isAsteroidField
  }

  hasBlackHole () {
    return this.data.isBlackHole
  }

  isBinaryStar () {
    return this.data.isBinaryStar
  }

  isPulsar () {
    return this.data.isPulsar
  }

  hasSpecialist () {
    return this.data.specialistId && this.data.specialistId > 0 && this.data.specialist
  }

  drawPlanets () {
    if (this.userSettings.map.naturalResources !== 'planets') {
      if (this.container_planets) {
        this.unsubscribeToEvents()
        this.container.removeChild(this.container_planets)
        this.container_planets = null
        this.planets = null
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
      let playerColour = player ? this.context.getPlayerColour(player._id) : 0xFFFFFF

      let rotationDirection = this._getPlanetOrbitDirection()
      let rotationSpeedModifier = this._getPlanetOrbitSpeed()

      this.planets = []

      for (let i = 0; i < planetCount; i++) {
        let planetContainer = new PIXI.Container()

        let distanceToStar = 15 + (5 * i)
        let planetSize = Math.floor(Math.abs(this.data.location.y) + distanceToStar) % 1.5 + 0.5

        let orbitGraphics = new PIXI.Graphics()
        orbitGraphics.lineStyle(0.3, 0xFFFFFF)
        orbitGraphics.alpha = this.userSettings.map.naturalResourcesRingOpacity;
        orbitGraphics.drawCircle(0, 0, distanceToStar -(planetSize / 2))
        this.container_planets.addChild(orbitGraphics)

        let planetGraphics = new PIXI.Graphics()
        planetGraphics.beginFill(playerColour)
        planetGraphics.drawCircle(planetSize / 2, 0, planetSize)
        planetGraphics.endFill()

        if (!this.data.isInScanningRange) {
          planetGraphics.alpha = 0.3
        }

        planetContainer.addChild(planetGraphics)

        planetContainer.pivot.set(distanceToStar, 0)

        let rotationSpeed = (planetCount - i) / rotationSpeedModifier

        this.container_planets.addChild(planetContainer)

        this.planets.push({
          index: i,
          container: planetContainer,
          rotationSpeed,
          rotationDirection
        })
      }

      this.subscribeToEvents()

      this.container.addChild(this.container_planets)
    }
  }

  orbitPlanentsStep (delta) {
    if (!this.planets) {
      return
    }

    for (let planet of this.planets) {
      if (planet.rotationDirection) {
        planet.container.rotation += planet.rotationSpeed * delta
      } else {
        planet.container.rotation -= planet.rotationSpeed * delta
      }
    }
  }

  drawNaturalResourcesRing () {
    if (!this.data.naturalResources) {
      return
    }
    for(let lod = 0; lod<Star.maxLod; lod+=1) {
      if(!this.graphics_natural_resources_ring[lod]) {
        this.graphics_natural_resources_ring[lod] = new PIXI.Graphics()
        this.graphics_natural_resources_ring[lod].alpha = 0.5
        this.graphics_natural_resources_ring[lod].zIndex = -1
      }
      this.graphics_natural_resources_ring[lod].clear()

      if (this.userSettings.map.naturalResources !== 'single-ring') {
        return
      }

      let averageNaturalResources = this._calculateAverageNaturalResources(this.data.naturalResources);

      // let ringRadius = this.data.naturalResources > 100 ? 100 : this.data.naturalResources
      // TODO: Experimental:
      let ringRadius = averageNaturalResources <= 50 ? averageNaturalResources : averageNaturalResources > 400 ? 100 : (12.5 * Math.log2(averageNaturalResources / 50) + 50)

      ringRadius /= 8.0
      let lineWidht = 1.0/8.0
      ringRadius *= lod+1
      lineWidht *= lod+1
      this.graphics_natural_resources_ring[lod].clear()
      this.graphics_natural_resources_ring[lod].lineStyle(lineWidht, 0xFFFFFF, this.userSettings.map.naturalResourcesRingOpacity)
      this.graphics_natural_resources_ring[lod].drawCircle(0, 0, ringRadius * 0.75)
      this.graphics_natural_resources_ring[lod].scale.x = 1.0/( (1.0/8.0)*(lod+1) )
      this.graphics_natural_resources_ring[lod].scale.y = 1.0/( (1.0/8.0)*(lod+1) )
      this.container.addChild(this.graphics_natural_resources_ring[lod])
    }
  }

  _calculateAverageNaturalResources(naturalResources) {
    return Math.floor((naturalResources.economy + naturalResources.industry + naturalResources.science) / 3);
  }

  _getPlanetsCount () {
    if (!this.data.naturalResources) {
      return 0
    }
    let averageNaturalResources = this._calculateAverageNaturalResources(this.data.naturalResources);
    return Math.min(Math.floor(averageNaturalResources / 45 * 3), 5) // Anything over 45 gets 3 planets
  }

  _getPlanetOrbitDirection () {
    return Math.floor(Math.abs(this.data.location.y)) % 2 === 0
  }

  _getPlanetOrbitSpeed () {
    return Math.floor(Math.random() * (1000 - 500 + 1) + 500) // Random number between 500 and 1000
  }

  drawColour () {
    if (this.graphics_shape_part) {
      this.container.removeChild(this.graphics_shape_part)
      this.container.removeChild(this.graphics_shape_full)
    }

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    if (!player) {
      return
    }
    if (Object.keys(TextureService.PLAYER_SYMBOLS).includes(player.shape)) {
      this.graphics_shape_part = new PIXI.Sprite(TextureService.PLAYER_SYMBOLS[player.shape][2+this.data.warpGate])
      this.graphics_shape_full = new PIXI.Sprite(TextureService.PLAYER_SYMBOLS[player.shape][0+this.data.warpGate])
    }

    const playerColour = this.context.getPlayerColour(player._id)

    this.graphics_shape_part.tint = playerColour
    this.graphics_shape_full.tint = playerColour
    this.graphics_shape_part.anchor.set(0.5)
    this.graphics_shape_full.anchor.set(0.5)
    this.graphics_shape_part.width = 28.0
    this.graphics_shape_part.height = 28.0
    this.graphics_shape_full.width = 28.0
    this.graphics_shape_full.height = 28.0
    this.container.addChild(this.graphics_shape_part)
    this.container.addChild(this.graphics_shape_full)
  }


  _hasUnknownShips() {
      let carriersOrbiting = this._getStarCarriers()
      let scramblers = carriersOrbiting.reduce( (sum, c ) => sum + (c.ships==null), 0 )
      let scrambler = this.data.ships == null
      return ((scramblers || scrambler) && this.data.isInScanningRange)
  }

  drawName () {
    if (!this.text_name) {
      let bitmapFont = {fontName: "chakrapetch", fontSize: Star.nameSize}
      this.text_name = new PIXI.BitmapText(this.data.name, bitmapFont)
      this.text_name.x = 5

      this.container.addChild(this.text_name)
    }

    let totalKnownShips = (this.data.ships || 0) + this._getStarCarrierShips()
    let carriersOrbiting = this._getStarCarriers()

    if ((this.data.ownedByPlayerId || carriersOrbiting) && (totalKnownShips > 0 || carriersOrbiting.length > 0 || this._hasUnknownShips())) {
      this.text_name.y = ( (Star.nameSize+Star.shipsSmallSize)/2.0 )-Star.nameSize
    } else {
      this.text_name.y = -(this.text_name.height / 2)
    }
  }

  drawShips () {
    if (this.text_ships_small) {
      this.container.removeChild(this.text_ships_small)
      this.text_ships_small = null
    }
    if (this.text_ships_big) {
      this.container.removeChild(this.text_ships_big)
      this.text_ships_big = null
    }

    let totalKnownShips = (this.data.ships || 0) + this._getStarCarrierShips()

    let carriersOrbiting = this._getStarCarriers()
    let carrierCount = carriersOrbiting.length

    let shipsText = ''

    if (this.data.ownedByPlayerId || carriersOrbiting) {
      let scramblers = 0

      if (carriersOrbiting) {
        scramblers = carriersOrbiting.reduce( (sum, c ) => sum + (c.ships==null), 0 )
      }

      if (scramblers == carrierCount && this.data.ships == null) {
        shipsText = '???'
      }
      else {
        shipsText = totalKnownShips

        if (scramblers > 0 || this.data.ships == null) {
          shipsText += '*'
        }
      }

      if (carrierCount) {
        shipsText += '/'
        shipsText += carrierCount.toString()

        if (gameHelper.isStarHasMultiplePlayersInOrbit(this.game, this.data)) {
          shipsText += '+'
        }
      }
    }

    if (shipsText) {
      if (!this.text_ships_small) {
        let bitmapFont = {fontName: "chakrapetch", fontSize: Star.shipsSmallSize}
        this.text_ships_small = new PIXI.BitmapText(this.data.name, bitmapFont)
        this.container.addChild(this.text_ships_small)
        this.text_ships_small.x = 5
        this.text_ships_small.y = (-this.text_ships_small.height) +( ( (Star.nameSize+Star.shipsSmallSize)/2.0 )-Star.nameSize )
      }

      if (!this.text_ships_big) {
        let bitmapFont = {fontName: "chakrapetch", fontSize: Star.shipsBigSize}
        this.text_ships_big = new PIXI.BitmapText(this.data.name, bitmapFont)
        this.container.addChild(this.text_ships_big)
        this.text_ships_big.x = 5
        this.text_ships_big.y = -this.text_ships_big.height/2.0
      }
      this.text_ships_small.text = shipsText
      this.text_ships_big.text = shipsText
    }
  }

  drawInfrastructure () {
    if ( this.text_infrastructure ) {
      this.container.removeChild(this.text_infrastructure)
      this.text_infrastructure = null
    }

    if (this.data.infrastructure && (this.data.infrastructure.economy == null || this.data.infrastructure.industry == null || this.data.infrastructure.science == null)) {
      return
    }

    if (!this.text_infrastructure) {
      if (this.data.ownedByPlayerId && this.data.infrastructure) {
        let displayInfrastructure = `${this.data.infrastructure.economy} ${this.data.infrastructure.industry} ${this.data.infrastructure.science}`

        let bitmapFont = {fontName: "chakrapetch", fontSize: 4}
        this.text_infrastructure = new PIXI.BitmapText(displayInfrastructure, bitmapFont);
        this.text_infrastructure.x = -(this.text_infrastructure.width / 2.0)
        this.text_infrastructure.y = -15
        this.text_infrastructure.alpha = 0.75;

        this.container.addChild(this.text_infrastructure)
      }
    }
  }

  drawInfrastructureBulkIgnored () {
    if (this.text_infrastructureBulkIgnored) {
      this.container.removeChild(this.text_infrastructureBulkIgnored)
      this.text_infrastructureBulkIgnored = null
    }

    if (this.data.ignoreBulkUpgrade == null) {
      return
    }

    if (!this.text_infrastructureBulkIgnored) {
      let displayInfrastructure = `${this.data.ignoreBulkUpgrade.economy ? ' ' : 'E'} ${this.data.ignoreBulkUpgrade.industry ? ' ' : 'I'} ${this.data.ignoreBulkUpgrade.science ? ' ' : 'S'}`

      let bitmapFont = {fontName: "chakrapetch", fontSize: 8}
      this.text_infrastructureBulkIgnored = new PIXI.BitmapText(displayInfrastructure, bitmapFont);
      this.text_infrastructureBulkIgnored.x = -(this.text_infrastructureBulkIgnored.width / 2.0)
      this.text_infrastructureBulkIgnored.y = 12
      this.text_infrastructureBulkIgnored.visible = this.showIgnoreBulkUpgradeInfrastructure

      this.container.addChild(this.text_infrastructureBulkIgnored)
    }
  }

  drawScanningRange () {
    this.graphics_scanningRange.clear()

    // Get the player who owns the star.
    let player = this._getStarPlayer()

    // Dead stars do not have scanning range
    if (!player || this._isDeadStar()) { return }

    let radius = ((this.data.effectiveTechs.scanning || 1) + 1) * this.lightYearDistance

    this.graphics_scanningRange.lineStyle(1, 0xFFFFFF, 0.2)
    this.graphics_scanningRange.beginFill(this.context.getPlayerColour(player._id), 0.075)
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

    let radius = ((this.data.effectiveTechs.hyperspace || 1) + 1.5) * this.lightYearDistance

    this.graphics_hyperspaceRange.lineStyle(1, 0xFFFFFF, 0.2)
    this.graphics_hyperspaceRange.beginFill(this.context.getPlayerColour(player._id), 0.075)
    this.graphics_hyperspaceRange.drawStar(0, 0, radius, radius, radius - 3)
    this.graphics_hyperspaceRange.endFill()
    this.graphics_hyperspaceRange.zIndex = -1
    this.container.zIndex = -1

    this.graphics_hyperspaceRange.visible = this.isSelected
  }

  drawTarget () {
    this.graphics_targeted.clear()

    if (this.data.targeted) {
      this.graphics_targeted.lineStyle(2, 0xFF0000)
      this.graphics_targeted.moveTo(9, -9)
      this.graphics_targeted.lineTo(-9, 9)
      this.graphics_targeted.moveTo(-9, -9)
      this.graphics_targeted.lineTo(9, 9)
      this.graphics_targeted.closePath()
    }
  }

  drawSelectedCircle () {
    this.graphics_selected.clear()

    if (this.isSelected) {
      this.graphics_selected.lineStyle(0.5, 0xFFFFFF)
      this.graphics_selected.alpha = 0.3
      this.graphics_selected.drawCircle(0, 0, 20)
    }
  }

  drawKingOfTheHillCircle () {
    this.graphics_kingOfTheHill.clear()

    if (this.data.isKingOfTheHillStar) {
      this.graphics_kingOfTheHill.lineStyle(0.5, 0xFFFFFF)
      this.graphics_kingOfTheHill.alpha = 0.5
      this.graphics_kingOfTheHill.drawCircle(0, 0, 20)
    }
  }

  drawDepth () {
    const depth = Helpers.calculateDepthModifier(this.userSettings, this.data._id)

    this.container.alpha = depth
    this.baseScale = depth * (this.userSettings.map.objectsDepth === 'disabled' ? 1 : 1.5)
  }

  onZoomChanging(zoomPercent) {
    this.zoomPercent = zoomPercent
    this.setScale(zoomPercent)
    this.updateVisibility()
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

  onClicked(e, tryMultiSelect = true) {
    const eventData = e ? e.data : null

    const click = () => {
      this.emit('onStarClicked', {
        starData: this.data,
        tryMultiSelect,
        eventData,
        permitCallback: () => {
          // Need to do this otherwise sometimes text gets highlighted.
          this.deselectAllText()

          if (this._getStarPlayer()) {
            this.updateVisibility()
            // this.setScale()
          }
        }
      })
    };

    if (e?.data?.originalEvent) {
      const button = e.data.originalEvent.button;

      if (button === 2) {
        this.emit('onStarRightClicked', {
          starData: this.data,
          eventData
        });
      } else if (button === 1) {
        this.emit('onStarDefaultClicked', {
          starData: this.data,
          eventData
        });
      } else {
        click();
      }
    } else {
      click();
    }
  }

  updateVisibility() {
    //TODO compute on the map tick
    let aparentScale = this.container.scale.x * (this.zoomPercent/100.0)
    let lod = Math.max(Math.min(Math.floor(aparentScale)-1, Star.maxLod-1), 0.0)
    for(let l = 0; l<Star.maxLod; l+= 1) {
      let ring = this.graphics_natural_resources_ring[l]

      if (ring) {
        ring.visible = false
      }
    }

    this.graphics_star.visible = !this.hasSpecialist() //|| this.hasBlackHole()
    this.graphics_hyperspaceRange.visible = this.isSelected
    this.graphics_scanningRange.visible = this.isSelected

    if (this.userSettings.map.naturalResources !== 'planets') {
      if (this.graphics_natural_resources_ring[lod]) {
        this.graphics_natural_resources_ring[lod].visible = this.data.isInScanningRange && this.zoomPercent >= Star.zoomLevelDefinitions.naturalResources
      }
    }

    if (this.text_name) this.text_name.visible = this.isSelected || this.zoomPercent >= Star.zoomLevelDefinitions.name
    if (this.container_planets) this.container_planets.visible = this.data.isInScanningRange && this.zoomPercent >= Star.zoomLevelDefinitions.naturalResources
    if (this.text_infrastructure) this.text_infrastructure.visible = this.isSelected || this.zoomPercent >= Star.zoomLevelDefinitions.infrastructure

    let small_ships = this.zoomPercent >= Star.zoomLevelDefinitions.name || this.isSelected
    let visible_ships = !!(this.data.isInScanningRange && (this.isSelected || this.isMouseOver || this.zoomPercent >= Star.zoomLevelDefinitions.shipCount))

    if (this.text_ships_small) this.text_ships_small.visible = small_ships && visible_ships
    if (this.text_ships_big) this.text_ships_big.visible = !small_ships && visible_ships

    let partial_ring = (this.text_ships_big && this.text_ships_big.visible)
      || (this.text_ships_small && this.text_ships_small.visible)
      || (this.text_name && this.text_name.visible)

    this.graphics_shape_part.visible = partial_ring
    this.graphics_shape_full.visible = !partial_ring
    this.graphics_shape_part_warp.visible = partial_ring && this.data.warpGate
    this.graphics_shape_full_warp.visible = !partial_ring && this.data.warpGate

    // this.baseScale = this.isSelected ? 1.5 : 1
  }

  subscribeToEvents () {
    if (this.container_planets) {
      this.handleOrbitPlanetsStep = this.orbitPlanentsStep.bind(this)
      this.app.ticker.add(this.handleOrbitPlanetsStep)
    }
  }

  unsubscribeToEvents () {
    if (this.container_planets) {
      this.app.ticker.remove(this.handleOrbitPlanetsStep)
      this.handleOrbitPlanetsStep = null
    }
  }

  deselectAllText () {
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
  }

  onMouseOver (e) {
    this.isMouseOver = true

    this.emit('onStarMouseOver', this)
  }

  onMouseOut (e) {
    this.isMouseOver = false

    this.emit('onStarMouseOut', this)
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

  destroy () {
    this.container.destroy()
    this.fixedContainer.destroy()
  }

  _isDeadStar () {
    return this.data.naturalResources != null && this.data.naturalResources.economy <= 0 && this.data.naturalResources.industry <= 0 && this.data.naturalResources.science <= 0;
  }

  select () {
    this.isSelected = true
    this.drawSelectedCircle()
    this.emit('onSelected', this.data)
    this.updateVisibility()
  }

  unselect () {
    this.isSelected = false
    this.drawSelectedCircle()
    this.emit('onUnselected', this.data)
    this.updateVisibility()
  }

  toggleSelected () {
    if (this.isSelected) {
      this.unselect()
    } else {
      this.select()
    }
  }

  showIgnoreBulkUpgrade () {
    this.showIgnoreBulkUpgradeInfrastructure = true

    if (this.text_infrastructureBulkIgnored) {
      this.text_infrastructureBulkIgnored.visible = this.showIgnoreBulkUpgradeInfrastructure
    }
  }

  hideIgnoreBulkUpgrade () {
    this.showIgnoreBulkUpgradeInfrastructure = false

    if (this.text_infrastructureBulkIgnored) {
      this.text_infrastructureBulkIgnored.visible = this.showIgnoreBulkUpgradeInfrastructure
    }
  }
}

export default Star
