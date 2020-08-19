import * as PIXI from 'pixi.js'

class TextureService {
    DEFAULT_FONT_STYLE = null

    STAR_BASE_TEXTURE = null
    PLANET_BASE_TEXTURE = null
    PLANET_TEXTURES = []

    constructor () {
      this.DEFAULT_FONT_STYLE = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3
      })

      this.STAR_BASE_TEXTURE = PIXI.BaseTexture.from(require('../assets/star.png'))

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
    }

    getStarTexture () {
      return new PIXI.Texture(this.STAR_BASE_TEXTURE)
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
}

export default new TextureService()
