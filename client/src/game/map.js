import * as PIXI from 'pixi.js';
import gameContainer from '../game/container';
import Star from './star';
import Background from './background';

class Map {
    constructor(container) {
        this.container = container;
    }

    draw(game) {
        const graphics = new PIXI.Graphics();
        
        // Draw all stars in their positions.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = new Star(this.container, graphics);

            star.draw(game.galaxy.stars[i]);
        }

        this.container.addChild(graphics);
    }
}

export default Map;
