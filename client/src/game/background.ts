import { Container, Sprite, type BLEND_MODES } from 'pixi.js'
import TextureService from './texture'
import * as rng from 'random-seed'
import gameHelper from '../services/gameHelper'
import type { Game } from '../types/game'
import type { DrawingContext } from './container'
import type { UserGameSettings } from '@solaris-common'

interface BackgroundSprite extends Sprite {
  parallax: number;
  originX: number;
  originY: number;
  baseRotation: number;
  baseRotationTime: number;
  baseScaleTime: number;
}

export class Background {
  static MAX_PARALLAX = 0.333
  static STAR_DENSITY = 10 // maybe make this into a user setting?
  static STAR_SCALE = 1.0/8.0
  static NEBULA_SCALE = 1.5
  static NEBULA_DELTA_SCALE = Background.NEBULA_SCALE*0.25
  static NEBULA_DELTA_ROTATION = (Math.PI*2.0)/64.0

  static zoomLevelDefinitions = {
    nebulas: 100,
    stars: 100,
  }

  container: Container;
  starContainer: Container;
  zoomPercent: number;
  time: number;
  game: Game;
  context: DrawingContext;
  userSettings: UserGameSettings;
  rng: any;
  galaxyCenterX: number = 0;
  galaxyCenterY: number = 0;
  moveNebulas = false;
  timeScale = 0;
  blendMode: BLEND_MODES = 'normal';

  constructor (game: Game, userSettings: UserGameSettings, context: DrawingContext) {
    this.container = new Container()
    this.starContainer = new Container()
    this.zoomPercent = 0
    this.container.interactiveChildren = false
    this.starContainer.interactiveChildren = false
    this.time = 0

    this.game = game
    this.context = context
    this.userSettings = userSettings
    this.rng = rng.create(game._id)

    this.galaxyCenterX = gameHelper.calculateGalaxyCenterX(game);
    this.galaxyCenterY = gameHelper.calculateGalaxyCenterY(game);

    Background.zoomLevelDefinitions = userSettings.map.zoomLevels.background
    this.container.alpha = userSettings.map.background.nebulaOpacity
    this.starContainer.alpha = userSettings.map.background.starsOpacity

    this.moveNebulas = userSettings.map.background.moveNebulas == 'enabled'
    this.timeScale = (1.0/(2048.0*64.0)) * userSettings.map.background.nebulaMovementSpeed
    this.blendMode = userSettings.map.background.blendMode == 'ADD' ? 'add' : 'normal';
  }

  clear () {
    this.container.removeChildren()
    this.starContainer.removeChildren()
  }

  draw () {
    this.clear()

    this.drawNebulas()
  }

  drawNebulas () {
    const NEBULA_FREQUENCY = this.userSettings.map.background.nebulaFrequency
    const NEBULA_DENSITY = this.userSettings.map.background.nebulaDensity

    const FALLBACK_NEBULA_COLOR = 0xffffff

    let NEBULA_COLOUR1
    let NEBULA_COLOUR2
    let NEBULA_COLOUR3

    try {
      NEBULA_COLOUR1 = this._getNumberFromHexString(this.userSettings!.map.background.nebulaColour1)
      NEBULA_COLOUR2 = this._getNumberFromHexString(this.userSettings!.map.background.nebulaColour2)
      NEBULA_COLOUR3 = this._getNumberFromHexString(this.userSettings!.map.background.nebulaColour3)
    } catch(err) {
      NEBULA_COLOUR1 = FALLBACK_NEBULA_COLOR
      NEBULA_COLOUR2 = FALLBACK_NEBULA_COLOR
      NEBULA_COLOUR3 = FALLBACK_NEBULA_COLOR
      console.error(err)
    }

    //divide the galaxy in chunks roughly the nebula size

    const CHUNK_SIZE = 512.0
    const MINIMUM_STARS = 2 //chunks must have these many stars to be elegible to host a nebula
    const NEBULA_MAX_OFFSET = CHUNK_SIZE/4.0

    const minX = gameHelper.calculateMinStarX(this.game!)
    const minY = gameHelper.calculateMinStarY(this.game!)
    const maxX = gameHelper.calculateMaxStarX(this.game!)
    const maxY = gameHelper.calculateMaxStarY(this.game!)

    const firstChunkX = Math.floor(minX/CHUNK_SIZE)
    const firstChunkY = Math.floor(minY/CHUNK_SIZE)
    const lastChunkX = Math.floor(maxX/CHUNK_SIZE)
    const lastChunkY = Math.floor(maxY/CHUNK_SIZE)

    const chunksXlen = (lastChunkX-firstChunkX)+1
    const chunksYlen = (lastChunkY-firstChunkY)+1

    let chunks = Array(chunksXlen)
    for(let x=0; x<chunksXlen; x+=1) {
      chunks[x] = Array(chunksYlen)
      for(let y=0; y<chunksYlen; y+=1) {
        chunks[x][y] = Array()
      }
    }

    //add locations to the chunks for quick lookup
    for(let star of this.game!.galaxy.stars) {
      let cx = Math.floor(star.location.x/CHUNK_SIZE)-firstChunkX
      let cy = Math.floor(star.location.y/CHUNK_SIZE)-firstChunkY
      chunks[cx][cy].push(star.location)
    }

    //generate nebulas and starfields on the chunks
    //TODO use these chunks to implement viewport culling
    for( let x=0; x<chunksXlen; x+=1) {
      for( let y=0; y<chunksYlen; y+=1) {
        if(chunks[x][y].length > MINIMUM_STARS) {
          let i: number = 0;

          const nebulaTextureCount = TextureService.STARLESS_NEBULA_TEXTURES.length
          const textures = TextureService.STARLESS_NEBULA_TEXTURES

          if( Math.round(this.rng.random()*16) <= NEBULA_FREQUENCY ) {
            let nebulaCount = 0
            while(nebulaCount < NEBULA_DENSITY) {
              nebulaCount+=1
              if(NEBULA_DENSITY>2) { if(this.rng.random()<0.5) { continue; } }
              i = Math.round(this.rng.random()*(nebulaTextureCount-1))
              const texture = textures[i]
              const nebulaSprite = new Sprite(texture) as BackgroundSprite;
              nebulaSprite.x = (x*CHUNK_SIZE) + (firstChunkX*CHUNK_SIZE) + (CHUNK_SIZE/2.0)
              nebulaSprite.x += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
              nebulaSprite.y = (y*CHUNK_SIZE) + (firstChunkY*CHUNK_SIZE) + (CHUNK_SIZE/2.0)
              nebulaSprite.y += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
              nebulaSprite.anchor.set(0.5)

              nebulaSprite.parallax = this.rng.random()*Background.MAX_PARALLAX
              nebulaSprite.blendMode = this.blendMode

              nebulaSprite.originX = nebulaSprite.x
              nebulaSprite.originY = nebulaSprite.y
              nebulaSprite.baseRotation = this.rng.random()*Math.PI*2.0
              nebulaSprite.baseRotationTime = this.rng.random()*Math.PI*2.0
              nebulaSprite.baseScaleTime = this.rng.random()*Math.PI*2.0

              nebulaSprite.tint = NEBULA_COLOUR1
              if(this.rng.random()>(1.0/3.0)) { nebulaSprite.tint = NEBULA_COLOUR2 }
              if(this.rng.random()>(1.0/3.0*2.0)) { nebulaSprite.tint = NEBULA_COLOUR3 }
              nebulaSprite.scale.x = Background.NEBULA_SCALE
              nebulaSprite.scale.y = Background.NEBULA_SCALE

              this.container.addChild(nebulaSprite);

              let starCount = 0;
              const starTexture = TextureService.STAR_TEXTURE
              while(starCount < Background.STAR_DENSITY) {
                starCount+=1
                const starSprite = new Sprite(starTexture) as BackgroundSprite;
                starSprite.x = (x*CHUNK_SIZE) + (firstChunkX*CHUNK_SIZE) + (CHUNK_SIZE*this.rng.random())
                starSprite.x += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
                starSprite.y = (y*CHUNK_SIZE) + (firstChunkY*CHUNK_SIZE) + (CHUNK_SIZE*this.rng.random())
                starSprite.y += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
                starSprite.anchor.set(0.5)

                starSprite.parallax = this.rng.random()*Background.MAX_PARALLAX
                starSprite.blendMode = this.blendMode

                starSprite.originX = starSprite.x
                starSprite.originY = starSprite.y

                const inverseParallaxNormalized = 1.0-(starSprite.parallax/Background.MAX_PARALLAX);
                starSprite.scale.x = ( (Background.STAR_SCALE) + (inverseParallaxNormalized*Background.STAR_SCALE) )/2.0
                starSprite.scale.y = ( (Background.STAR_SCALE) + (inverseParallaxNormalized*Background.STAR_SCALE) )/2.0

                this.starContainer.addChild(starSprite)
              }

            }
          }
        }
      }
    }
  }

  refreshZoom (zoomPercent: number) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent > Background.zoomLevelDefinitions.nebulas
    }
    if (this.starContainer) {
      this.starContainer.visible = zoomPercent > Background.zoomLevelDefinitions.stars
    }
  }

  onTick (deltaTime: number, viewportData) {
    this.time += deltaTime*1000
    let compressedTime = this.time*this.timeScale
    for (let i = 0; i < this.container.children.length; i++) {
      let child = this.container.children[i] as BackgroundSprite;
      let deltax = viewportData.center.x-child.originX
      let deltay = viewportData.center.y-child.originY

      child.x = child.originX + deltax * child.parallax
      child.y = child.originY + deltay * child.parallax

      if( this.moveNebulas ) { // TODO compare performance of this conditional branch with looping the child array twice
        child.scale.x = Background.NEBULA_SCALE + Math.sin(child.baseScaleTime+compressedTime)*Background.NEBULA_DELTA_SCALE
        child.rotation = child.baseRotation + Math.sin(child.baseRotationTime+compressedTime)*Background.NEBULA_DELTA_ROTATION
      }
    }

    for (let i = 0; i < this.starContainer.children.length; i++) {
      let child = this.starContainer.children[i] as BackgroundSprite;
      let deltax = viewportData.center.x-child.originX
      let deltay = viewportData.center.y-child.originY

      child.x = child.originX + deltax * child.parallax
      child.y = child.originY + deltay * child.parallax
    }
  }

  _getNumberFromHexString( colorString ) {
    let hexString = colorString.replace(/^#/, '')

    if( !(/^[0-9A-F]{6}$/i.test(hexString)) ) { throw new Error('Invalid Hex Color String') }

    let hex = parseInt(hexString, 16)

    return hex
  }
}

export default Background
