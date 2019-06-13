import * as PIXI from 'pixi.js';
import gameContainer from '../game/container';
import Star from './star';
import Background from './background';

class Map {
    constructor(container) {
        this.container = container;
    }

    draw(game) {
        // Draw all stars in their positions.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = new Star(this.container);

            star.draw(game.galaxy.stars[i]);
        }
    }
}

export default Map;
