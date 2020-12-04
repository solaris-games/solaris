import * as PIXI from 'pixi.js-legacy'
import TextureService from './texture'
import * as rng from 'random-seed'

class Background {
  constructor () {
    this.container = new PIXI.Container()
    this.container.alpha = 0.5
  }

  setup (game) {
    this.game = game
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
    for (let star of this.game.galaxy.stars) {
        // let rnd = Math.floor(Math.random() * 20) // 1 in X chance to draw.

        // if (rnd > 0) {
        //     continue
        // }

        // let i = Math.floor(Math.random() * TextureService.NEBULA_TEXTURES.length)

        // pRoCeDuRaL gEnErAtiOn
        // If the star X + star Y is divisible by a given value then draw a nebula.
        let val = Math.abs(Math.floor(star.location.x + star.location.y))
        
        if (val % 10 !== 0) {
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
