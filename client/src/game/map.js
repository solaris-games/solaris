import * as PIXI from 'pixi.js';
import { logoTexture } from "../game/textures";
import gameContainer from '../game/container';
import Star from './star';

function drawStars(game) {
    const container = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    
    // Draw all stars in their positions.
    for (let i = 0; i < game.galaxy.stars.length; i++) {
        let star = new Star(game.galaxy.stars[i]);

        star.draw(container, graphics);
    }

    container.addChild(graphics);
    
    gameContainer.viewport.addChild(container);
}

export default {
    draw(game) {
        drawStars(game);

        // TODO: Draw other shit.
    }
}