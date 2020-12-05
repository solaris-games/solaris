import * as PIXI from 'pixi.js-legacy'
import TextureService from './texture'
import * as rng from 'random-seed'

class Background {
  NEBULA_GENERATION = {
    none: 0,
    sparse: 0.05,
    standard: 0.1,
    abundant: 0.2
  }

  constructor () {
    this.container = new PIXI.Container()
    this.container.alpha = 0.5
  }

  setup (game, userSettings) {
    this.game = game
    this.userSettings = userSettings
    this.rng = rng.create(game._id)
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
    let generationChance = this.NEBULA_GENERATION[this.userSettings.map.nebulaDensity]

    if (generationChance === 0) {
      return
    }

    for (let star of this.game.galaxy.stars) {
      // Nebula have a set chance to draw based on the nebula density setting.
      let rndGenerate = this.rng.random()

      if (rndGenerate > generationChance) {
        continue
      }

      // Pick a nebula texture based on the star's location.
      let i = Math.abs(Math.floor(star.location.x - star.location.y)) % TextureService.NEBULA_TEXTURES.length
      let texture = TextureService.NEBULA_TEXTURES[i]

      let sprite = new PIXI.Sprite(texture)
      sprite.x = star.location.x - 320 // Note: the file isn't loaded at this point so we need to use hard coded width and height
      sprite.y = star.location.y - 320

      sprite.parallax = this.rng.random()
        
      sprite.originX = sprite.x
      sprite.originY = sprite.y

      this.container.addChild(sprite)
    }
  }

  onTick (deltaTime, viewportData) {
    let deltax = viewportData.center.x
    let deltay = viewportData.center.y
 
    for (let i = 0; i < this.container.children.length; i++) {
      let child = this.container.children[i]

      child.x = child.originX + deltax * child.parallax
      child.y = child.originY + deltay * child.parallax
    }
  }
}

export default Background
