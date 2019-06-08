import * as PIXI from 'pixi.js';
import { logoTexture } from "../game/textures";
import gameContainer from '../game/container';

function drawStars(game) {
    const container = new PIXI.Container();

    const graphics = new PIXI.Graphics();
    
    // Draw all stars in their positions.
    for (let i = 0; i < game.galaxy.stars.length; i++) {
        let star = game.galaxy.stars[i];

        // Draw the star itself.
        graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawCircle(star.location.x, star.location.y, 2);
        graphics.endFill();

        // Draw the star name.
        let text = new PIXI.Text(star.name, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = star.location.x - (text.width / 2);
        text.y = star.location.y + 3;
        text.resolution = 10;

        container.addChild(text);
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