import * as PIXI from 'pixi.js'
import TextureService from './texture'

class Background {
  constructor () {
    this.container = new PIXI.Container()
    this.container.alpha = 0.5
  }

  setup (game) {
    this.game = game

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
    for (let star of this.game.galaxy.stars) {
        let rnd = Math.floor(Math.random() * 20) // 1 in X chance to draw.

        if (rnd > 0) {
            continue
        }

        let i = Math.floor(Math.random() * TextureService.NEBULA_TEXTURES.length)
        let texture = TextureService.NEBULA_TEXTURES[i]

        let sprite = new PIXI.Sprite(texture)
        sprite.x = star.location.x - 320
        sprite.y = star.location.y - 320
        
        this.container.addChild(sprite)
    }
  }
}

export default Background
