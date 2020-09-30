import * as PIXI from 'pixi.js'

class TextureService {
    DEFAULT_FONT_STYLE = null

    PLANET_BASE_TEXTURE = null
    PLANET_TEXTURES = []
    SPECIALIST_TEXTURES = {}

    constructor () {
      this.DEFAULT_FONT_STYLE = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3
      })

      this.PLANET_BASE_TEXTURE = PIXI.BaseTexture.from(require('../assets/PixelPlanets.png'))
      this.PLANET_BASE_TEXTURE.setSize(390, 460)

      // Terran
      this._loadPlanetTexture(79, 73, 28, 28)
      this._loadPlanetTexture(116, 73, 28, 28)
      this._loadPlanetTexture(153, 73, 28, 28)
      this._loadPlanetTexture(190, 73, 28, 28)
      this._loadPlanetTexture(227, 73, 28, 28)
      this._loadPlanetTexture(264, 73, 28, 28)

      // Jungle
      this._loadPlanetTexture(79, 110, 28, 28)
      this._loadPlanetTexture(116, 110, 28, 28)
      this._loadPlanetTexture(153, 110, 28, 28)
      this._loadPlanetTexture(190, 110, 28, 28)
      this._loadPlanetTexture(227, 110, 28, 28)
      this._loadPlanetTexture(264, 110, 28, 28)

      // Rock
      this._loadPlanetTexture(79, 147, 28, 28)
      this._loadPlanetTexture(116, 147, 28, 28)
      this._loadPlanetTexture(153, 147, 28, 28)
      this._loadPlanetTexture(190, 147, 28, 28)
      this._loadPlanetTexture(227, 147, 28, 28)
      this._loadPlanetTexture(264, 147, 28, 28)

      // Ocean
      this._loadPlanetTexture(79, 184, 28, 28)
      this._loadPlanetTexture(116, 184, 28, 28)
      this._loadPlanetTexture(153, 184, 28, 28)
      this._loadPlanetTexture(190, 184, 28, 28)
      this._loadPlanetTexture(227, 184, 28, 28)
      this._loadPlanetTexture(264, 184, 28, 28)

      // Desert
      this._loadPlanetTexture(79, 221, 28, 28)
      this._loadPlanetTexture(116, 221, 28, 28)
      this._loadPlanetTexture(153, 221, 28, 28)
      this._loadPlanetTexture(190, 221, 28, 28)
      this._loadPlanetTexture(227, 221, 28, 28)
      this._loadPlanetTexture(264, 221, 28, 28)

      // Arctic
      this._loadPlanetTexture(79, 258, 28, 28)
      this._loadPlanetTexture(116, 258, 28, 28)
      this._loadPlanetTexture(153, 258, 28, 28)
      this._loadPlanetTexture(190, 258, 28, 28)
      this._loadPlanetTexture(227, 258, 28, 28)
      this._loadPlanetTexture(264, 258, 28, 28)

      // Gas
      this._loadPlanetTexture(79, 295, 28, 28)
      this._loadPlanetTexture(116, 295, 28, 28)
      this._loadPlanetTexture(153, 295, 28, 28)
      this._loadPlanetTexture(190, 295, 28, 28)
      this._loadPlanetTexture(227, 295, 28, 28)
      this._loadPlanetTexture(264, 295, 28, 28)

      // Inferno
      this._loadPlanetTexture(79, 332, 28, 28)
      this._loadPlanetTexture(116, 332, 28, 28)
      this._loadPlanetTexture(153, 332, 28, 28)
      this._loadPlanetTexture(190, 332, 28, 28)

      // Toxic
      this._loadPlanetTexture(79, 369, 28, 28)
      this._loadPlanetTexture(116, 369, 28, 28)
      this._loadPlanetTexture(153, 369, 28, 28)
      this._loadPlanetTexture(190, 369, 28, 28)

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
      this._loadSpecialistTexture('power-generator')
    }

    getPlanetTexture (x, y) {
      let index = Math.floor(Math.abs(x * y)) % this.PLANET_TEXTURES.length

      return this.PLANET_TEXTURES[index]
    }

    getRandomPlanetTexture () {
      let index = Math.floor(Math.random() * this.PLANET_TEXTURES.length)

      return this.PLANET_TEXTURES[index]
    }

    _loadPlanetTexture (x, y, w, h) {
      let texture = new PIXI.Texture(this.PLANET_BASE_TEXTURE)
      texture.frame = new PIXI.Rectangle(x, y, w, h)
      this.PLANET_TEXTURES.push(texture)
    }

    _loadSpecialistTexture(name) {
      this.SPECIALIST_TEXTURES[name] = PIXI.Texture.from(require(`../assets/specialists/${name}.svg`))
    }

    getSpecialistTexture(specialistId, isCarrier) {
      if (isCarrier) {
        switch (specialistId) {
          case 1:
            return this.SPECIALIST_TEXTURES['mecha-head']
          case 2:
            return this.SPECIALIST_TEXTURES['mecha-mask']
          case 3:
            return this.SPECIALIST_TEXTURES['android-mask']
          case 4:
            return this.SPECIALIST_TEXTURES['hazmat-suit']
          case 5:
            return this.SPECIALIST_TEXTURES['cyborg-face']
          case 6:
            return this.SPECIALIST_TEXTURES['lunar-module']
          case 7:
            return this.SPECIALIST_TEXTURES['spaceship']
          case 8:
            return this.SPECIALIST_TEXTURES['power-generator']
          case 9:
            return this.SPECIALIST_TEXTURES['energise']
        }
      } else {
        switch (specialistId) {
          case 1:
            return this.SPECIALIST_TEXTURES['sattelite']
          case 2:
            return this.SPECIALIST_TEXTURES['airtight-hatch']
          case 3:
            return this.SPECIALIST_TEXTURES['cannister']
          case 4:
            return this.SPECIALIST_TEXTURES['defense-satellite']
          case 5:
            return this.SPECIALIST_TEXTURES['habitat-dome']
          case 6:
            return this.SPECIALIST_TEXTURES['techno-heart']
          case 7:
            return this.SPECIALIST_TEXTURES['missile-pod']
          case 8:
            return this.SPECIALIST_TEXTURES['power-generator']
        }
      }
    }
}

export default new TextureService()
