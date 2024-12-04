import * as PIXI from 'pixi.js-legacy'

class AnimationService {
  drawSelectedCircle (app, container, location) {
    // It ain't pretty, but it works.
    let graphics = new PIXI.Graphics()

    let radius = 1

    const animation = (delta) => {
      if (graphics.alpha <= 0) {
        return
      }

      graphics.clear()
      graphics.lineStyle(1, 0xFFFFFF, 0.3)

      graphics.alpha -= 0.02 * delta
      radius = radius + delta

      graphics.drawCircle(location.x, location.y, radius)
    }

    app.ticker.add(animation)

    setTimeout(() => {
      container.removeChild(graphics)
      // When leaving the game, the app can be destroyed
      if (app?.ticker) {
        app.ticker.remove(animation)
      }
    }, 3000)

    container.addChild(graphics)
  }
}

export default new AnimationService()
