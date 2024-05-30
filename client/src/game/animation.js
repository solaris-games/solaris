import * as PIXI from 'pixi.js-legacy'

class AnimationService {
  drawSelectedCircle (app, container, location) {
    // It ain't pretty, but it works.
    let graphics = new PIXI.Graphics()

    graphics.radius = 1

    graphics.animation = (delta) => {
      if (graphics.alpha <= 0) {
        return
      }

      graphics.clear()
      graphics.lineStyle(1, 0xFFFFFF, 0.3)

      graphics.alpha -= 0.02 * delta
      graphics.radius = graphics.radius + delta

      graphics.drawCircle(location.x, location.y, graphics.radius)
    }

    app.ticker.add(graphics.animation)

    setTimeout(() => {
      container.removeChild(graphics)
      // When leaving the game, the app can be destroyed
      if (app?.ticker) {
        app.ticker.remove(graphics.animation)
      }
    }, 3000)

    container.addChild(graphics)
  }
}

export default new AnimationService()
