import * as PIXI from 'pixi.js'
import type { Game } from '../types/game';

class WormHoleLayer {
  container: PIXI.Container;

  constructor() {
    this.container = new PIXI.Container()
  }

  draw(game: Game) {
    this.container.removeChildren();
    
    const stars = game.galaxy.stars.filter(s => s.wormHoleToStarId);

    for (let star of stars) {
      const starPair = stars.find(s => s._id === star.wormHoleToStarId && s.wormHoleToStarId === star._id);

      if (!starPair) {
        continue;
      }

      const graphics = new PIXI.Graphics();

      const alpha = 0.1;
      const lineWidth = 5;

      graphics.moveTo(star.location.x, star.location.y);
      graphics.lineTo(starPair.location.x, starPair.location.y);
      graphics.stroke({
        width: lineWidth,
        color: 0xFFFFFF,
        alpha,
      });

      this.container.addChild(graphics);
    }
  }

}

export default WormHoleLayer
