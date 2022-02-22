import * as PIXI from 'pixi.js-legacy'
import gameHelper from '../services/gameHelper'
import seededRandom from 'random-seed'

class TextureService {

    static WARP_GATE_INDEX = 1
    static PARTIAL_STRIDE = 2
    static seededRNG = seededRandom.create()

    DEFAULT_FONT_STYLE = null

    STARLESS_NEBULA_TEXTURES = []
    STAR_NEBULA_TEXTURES = []
    STAR_ASTEROID_FIELD_TEXTURES = []
    STAR_WORMHOLE_TEXTURES = []
    SPECIALIST_TEXTURES = {}
    PLAYER_SYMBOLS = {}
    STAR_SYMBOLS = {}
    CARRIER_TEXTURE = null

    initialize () {
      this._loadPlayerSymbols()
      this._loadStarSymbols()

      this.CARRIER_TEXTURE = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_carrier.svg')))
      this.DEFAULT_FONT_STYLE = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3
      })

      this.DEFAULT_FONT_STYLE_BOLD = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        fontWeight: "bold",
        padding: 3
      })

      this.DEFAULT_FONT_BITMAP = PIXI.BitmapFont.from(
        "space-mono",
        this.DEFAULT_FONT_STYLE,
        {
          chars: PIXI.BitmapFont.ASCII,
          resolution: 2
        }
      )
      // disable mipmap
      this.DEFAULT_FONT_BITMAP.pageTextures[0].baseTexture.mipmap = 0
      this.DEFAULT_FONT_BITMAP.pageTextures[1].baseTexture.mipmap = 0

      this.DEFAULT_FONT_BOLD_BITMAP = PIXI.BitmapFont.from(
        "space-mono-bold",
        this.DEFAULT_FONT_STYLE_BOLD,
        {
          chars: PIXI.BitmapFont.ASCII,
          resolution: 2
        }
      )
      // disable mipmap
      this.DEFAULT_FONT_BOLD_BITMAP.pageTextures[0].baseTexture.mipmap = 0
      this.DEFAULT_FONT_BOLD_BITMAP.pageTextures[1].baseTexture.mipmap = 0

      this.STAR_TEXTURE = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/stars/star.png')))

      // STARLESS NEBULAS
      this.STARLESS_NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/neb0-starless.png'))))
      this.STARLESS_NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/neb1-starless.png'))))

      // STAR NEBULAS
      this.STAR_NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/star-nebula-0.png'))))
      this.STAR_NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/star-nebula-1.png'))))
      this.STAR_NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/star-nebula-2.png'))))

      // STAR ASTEROID FIELDS
      this.STAR_ASTEROID_FIELD_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/stars/star-asteroid-field-0.png'))))
      this.STAR_ASTEROID_FIELD_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/stars/star-asteroid-field-1.png'))))
      this.STAR_ASTEROID_FIELD_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/stars/star-asteroid-field-2.png'))))

      this.STAR_WORMHOLE_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/stars/vortex.png'))))

      // SPECIALISTS
      this._loadSpecialistTexture('mecha-head')
      this._loadSpecialistTexture('mecha-mask')
      this._loadSpecialistTexture('android-mask')
      this._loadSpecialistTexture('hazmat-suit')
      this._loadSpecialistTexture('cyborg-face')
      this._loadSpecialistTexture('lunar-module')
      this._loadSpecialistTexture('spaceship')
      this._loadSpecialistTexture('power-generator')
      this._loadSpecialistTexture('energise')
      this._loadSpecialistTexture('sattelite')
      this._loadSpecialistTexture('airtight-hatch')
      this._loadSpecialistTexture('cannister')
      this._loadSpecialistTexture('defense-satellite')
      this._loadSpecialistTexture('habitat-dome')
      this._loadSpecialistTexture('techno-heart')
      this._loadSpecialistTexture('missile-pod')
      this._loadSpecialistTexture('space-suit')
      this._loadSpecialistTexture('strafe')
      this._loadSpecialistTexture('ringed-planet')
      this._loadSpecialistTexture('observatory')
      this._loadSpecialistTexture('alien-stare')
      this._loadSpecialistTexture('afterburn')
      this._loadSpecialistTexture('pirate')
      this._loadSpecialistTexture('spoutnik')
      this._loadSpecialistTexture('starfighter')
      this._loadSpecialistTexture('double-ringed-orb')
      this._loadSpecialistTexture('rocket')
      this._loadSpecialistTexture('ray-gun')
      this._loadSpecialistTexture('radar-dish')
      this._loadSpecialistTexture('energy-tank')
      this._loadSpecialistTexture('cryo-chamber')
      this._loadSpecialistTexture('vintage-robot')
    }

    _loadSpecialistTexture(name) {
      this.SPECIALIST_TEXTURES[name] = PIXI.Texture.from(require(`../assets/specialists/${name}.svg`))
      //disable mipmap
      this.SPECIALIST_TEXTURES[name].baseTexture.mipmap = 0
    }

    getSpecialistTexture(specialistKey) {
      return this.SPECIALIST_TEXTURES[specialistKey]
    }

    _loadPlayerSymbols() {
      this.PLAYER_SYMBOLS['circle'] = [
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_circle.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_circle_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_circle_partial.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_circle_partial_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_circle_carrier.svg')))
      ]
      this.PLAYER_SYMBOLS['hexagon'] = [
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_hexagon.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_hexagon_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_hexagon_partial.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_hexagon_partial_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_hexagon_carrier.svg')))
      ]
      this.PLAYER_SYMBOLS['diamond'] = [
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_diamond.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_diamond_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_diamond_partial.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_diamond_partial_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_diamond_carrier.svg')))
      ]
      this.PLAYER_SYMBOLS['square'] = [
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_square.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_square_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_square_partial.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/256x256_square_partial_warp_gate.svg'))),
        new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_square_carrier.svg')))
      ]
    }

    _loadStarSymbols() {
      this.STAR_SYMBOLS['scannable'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_scannable.svg')))
      this.STAR_SYMBOLS['unscannable'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_unscannable.svg')))
      this.STAR_SYMBOLS['home'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_home.svg')))
      this.STAR_SYMBOLS['black_hole'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_black_hole.svg')))
      this.STAR_SYMBOLS['black_hole_binary'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_black_hole_binary.svg')))
      this.STAR_SYMBOLS['binary_scannable'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_scannable_binary.svg')))
      this.STAR_SYMBOLS['binary_unscannable'] = new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/map-objects/128x128_star_unscannable_binary.svg')))
    }

    getRandomStarNebulaTexture(seed) {
      TextureService.seededRNG.seed(seed+'n')
      let index = Math.floor(TextureService.seededRNG.random() * this.STAR_NEBULA_TEXTURES.length)

      return this.STAR_NEBULA_TEXTURES[index]
    }

    getRandomStarAsteroidFieldTexture(seed) {
      TextureService.seededRNG.seed(seed+'a')
      let index = Math.floor(TextureService.seededRNG.random() * this.STAR_ASTEROID_FIELD_TEXTURES.length)

      return this.STAR_ASTEROID_FIELD_TEXTURES[index]
    }

    getRandomWormholeTexture () {
      // TODO: More textures?
      return this.STAR_WORMHOLE_TEXTURES[0]
    }
}

export default new TextureService()
