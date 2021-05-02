import * as PIXI from 'pixi.js-legacy'
import TextureService from './texture'
import * as rng from 'random-seed'
import gameHelper from '../services/gameHelper'

class Background {

  static MAX_PARALLAX = 0.333
  static STAR_DENSITY = 10
  static STAR_SCALE = 1.0/8.0

  NEBULA_GENERATION = {
    none: 0,
    sparse: 0.05,
    standard: 0.1,
    abundant: 0.2
  }

  constructor () {
    this.container = new PIXI.Container()
    this.starContainer = new PIXI.Container()
    this.container.alpha = 1.0
    this.zoomPercent = 0
    this.container.interactiveChildren = false
    this.starContainer.interactiveChildren = false
  }

  setup (game, userSettings) {
    this.game = game
    this.userSettings = userSettings
    this.rng = rng.create(game._id)
    this.galaxyCenterX = gameHelper.calculateGalaxyCenterX(game)
    this.galaxyCenterY = gameHelper.calculateGalaxyCenterY(game)
    this.clear()
  }

  clear () {
    this.container.removeChildren()
  }

  draw () {
    this.clear()

    this.drawNebulas()
  }

  drawNebulas () {

    let NEBULA_FREQUENCY = this.userSettings.map.background.nebulaFrequency
    let NEBULA_DENSITY = this.userSettings.map.background.nebulaDensity
    let GENERATE_STARS = this.userSettings.map.background.backgroundStars == 'enabled'
    let NEBULA_COLOR1 = parseInt(this.userSettings.map.background.nebulaColor1.replace(/^#/, '').substring(0, 6), 16)
    let NEBULA_COLOR2 = parseInt(this.userSettings.map.background.nebulaColor2.replace(/^#/, '').substring(0, 6), 16)
    let NEBULA_COLOR3 = parseInt(this.userSettings.map.background.nebulaColor3.replace(/^#/, '').substring(0, 6), 16)

    //divide the galaxy in chunks roughly the nebula size

    const CHUNK_SIZE = 512.0
    const MINIMUM_STARS = 2 //chunks must have these many stars to be elegible to host a nebula
    const NEBULA_MAX_OFFSET = CHUNK_SIZE/4.0

    let minX = gameHelper.calculateMinStarX(this.game)
    let minY = gameHelper.calculateMinStarY(this.game)
    let maxX = gameHelper.calculateMaxStarX(this.game)
    let maxY = gameHelper.calculateMaxStarY(this.game)

    let firstChunkX = Math.floor(minX/CHUNK_SIZE)
    let firstChunkY = Math.floor(minY/CHUNK_SIZE)
    let lastChunkX = Math.floor(maxX/CHUNK_SIZE)
    let lastChunkY = Math.floor(maxY/CHUNK_SIZE)

    let chunksXlen = (lastChunkX-firstChunkX)+1
    let chunksYlen = (lastChunkY-firstChunkY)+1

    let chunks = Array(chunksXlen)
    for(let x=0; x<chunksXlen; x+=1) {
      chunks[x] = Array(chunksYlen)
      for(let y=0; y<chunksYlen; y+=1) {
        chunks[x][y] = Array()
      }
    }

    //add locations to the chunks for quick lookup
    for(let star of this.game.galaxy.stars) {
      let cx = Math.floor(star.location.x/CHUNK_SIZE)-firstChunkX
      let cy = Math.floor(star.location.y/CHUNK_SIZE)-firstChunkY
      chunks[cx][cy].push(star.location)
    }

    //generate nebulas and starfields on the chunks
    //TODO use these chunks to implement viewport culling
    for( let x=0; x<chunksXlen; x+=1) {
      for( let y=0; y<chunksYlen; y+=1) {
        if(chunks[x][y].length > MINIMUM_STARS) {

          let i
          let texture
          let sprite
          let nebulaTextureCount
          let textures
          if(GENERATE_STARS) {
            nebulaTextureCount = TextureService.STARLESS_NEBULA_TEXTURES.length
            textures = TextureService.STARLESS_NEBULA_TEXTURES
          }
          else {
            nebulaTextureCount = TextureService.NEBULA_TEXTURES.length
            textures = TextureService.NEBULA_TEXTURES
          }

          if( Math.round(this.rng.random()*16) <= NEBULA_FREQUENCY ) {
            let nebulaCount = 0
            while(nebulaCount < NEBULA_DENSITY) {
              nebulaCount+=1
              if(NEBULA_DENSITY>2) { if(this.rng.random()<0.5) { continue; } }
              i = Math.round(this.rng.random()*(nebulaTextureCount-1))
              texture = textures[i]
              sprite = new PIXI.Sprite(texture)
              sprite.x = (x*CHUNK_SIZE) + (firstChunkX*CHUNK_SIZE) + (CHUNK_SIZE/2.0)
              sprite.x += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
              sprite.y = (y*CHUNK_SIZE) + (firstChunkY*CHUNK_SIZE) + (CHUNK_SIZE/2.0)
              sprite.y += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
              sprite.anchor.set(0.5)

              sprite.parallax = this.rng.random()*Background.MAX_PARALLAX
              sprite.blendMode = PIXI.BLEND_MODES.ADD

              sprite.originX = sprite.x
              sprite.originY = sprite.y
              sprite.rotation = this.rng.random()*Math.PI*2.0

              if(GENERATE_STARS) {
                sprite.tint = NEBULA_COLOR1
                if(this.rng.random()>(1.0/3.0)) { sprite.tint = NEBULA_COLOR2 }
                if(this.rng.random()>(1.0/3.0*2.0)) { sprite.tint = NEBULA_COLOR3 }
                sprite.scale.x = 1.25
                sprite.scale.y = 1.25
              }

              this.container.addChild(sprite)

              if(GENERATE_STARS) {
                let starCount = 0
                texture = TextureService.STAR_TEXTURE
                while(starCount < Background.STAR_DENSITY) {
                  starCount+=1
                  sprite = new PIXI.Sprite(texture)
                  sprite.x = (x*CHUNK_SIZE) + (firstChunkX*CHUNK_SIZE) + (CHUNK_SIZE*this.rng.random())
                  sprite.x += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
                  sprite.y = (y*CHUNK_SIZE) + (firstChunkY*CHUNK_SIZE) + (CHUNK_SIZE*this.rng.random())
                  sprite.y += NEBULA_MAX_OFFSET * Math.round( (this.rng.random()*2.0)-1.0 )
                  sprite.anchor.set(0.5)

                  sprite.parallax = this.rng.random()*Background.MAX_PARALLAX
                  sprite.blendMode = PIXI.BLEND_MODES.ADD

                  sprite.originX = sprite.x
                  sprite.originY = sprite.y

                  let inverseParallaxNormalized = 1.0-(sprite.parallax/Background.MAX_PARALLAX)
                  sprite.scale.x = ( (Background.STAR_SCALE) + (inverseParallaxNormalized*Background.STAR_SCALE) )/2.0
                  sprite.scale.y = ( (Background.STAR_SCALE) + (inverseParallaxNormalized*Background.STAR_SCALE) )/2.0

                  this.starContainer.addChild(sprite)
                }
              }

            }
          }
        }
      }
    }
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent > 100
    }
  }

  onTick (deltaTime, viewportData) {

    for (let i = 0; i < this.container.children.length; i++) {
      let child = this.container.children[i]
      let deltax = viewportData.center.x-child.originX
      let deltay = viewportData.center.y-child.originY

      child.x = child.originX + deltax * child.parallax
      child.y = child.originY + deltay * child.parallax
    }

    for (let i = 0; i < this.starContainer.children.length; i++) {
      let child = this.starContainer.children[i]
      let deltax = viewportData.center.x-child.originX
      let deltay = viewportData.center.y-child.originY

      child.x = child.originX + deltax * child.parallax
      child.y = child.originY + deltay * child.parallax
    }
  }
}

export default Background
