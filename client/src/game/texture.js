import * as PIXI from 'pixi.js-legacy'
import gameHelper from '../services/gameHelper'

class TextureService {
    DEFAULT_FONT_STYLE = null

    NEBULA_TEXTURES = []
    SPECIALIST_TEXTURES = {}

    constructor () {
      this.DEFAULT_FONT_STYLE = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3
      })

      // NEBULAS
      this.NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/neb1.png'))))
      this.NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/neb2.png'))))
      this.NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/neb3.png'))))
      this.NEBULA_TEXTURES.push(new PIXI.Texture(PIXI.BaseTexture.from(require('../assets/nebula/neb4.png'))))

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
    }

    _loadSpecialistTexture(name) {
      this.SPECIALIST_TEXTURES[name] = PIXI.Texture.from(require(`../assets/specialists/${name}.svg`))
    }

    getSpecialistTexture(specialistId, isCarrier) {
      let name = gameHelper.getSpecialistName(isCarrier ? 'carrier':'star', specialistId)

      return this.SPECIALIST_TEXTURES[name]
    }
}

export default new TextureService()
