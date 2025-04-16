import type { Location } from '@solaris-common';
import {Application, Ticker, Container, Graphics} from 'pixi.js';

class AnimationService {
  drawSelectedCircle (app: Application, container: Container, location: Location) {
    // It ain't pretty, but it works.
    let graphics = new Graphics()

    let radius = 1

    const animation = (ticker: Ticker) => {
      if (graphics.alpha <= 0) {
        return
      }

      const delta = ticker.deltaTime;

      graphics.clear()

      radius = radius + delta

      graphics.circle(location.x, location.y, radius)
      graphics.alpha -= 0.02 * delta
      graphics.stroke({
        width: 1,
        color: 0xFFFFFF
      })
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
