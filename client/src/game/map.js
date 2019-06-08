import * as PIXI from 'pixi.js';
import { neb1, neb2, neb3, neb4 } from "../game/textures";
import gameContainer from '../game/container';
import Star from './star';

let nebulaContainer;

function drawNebula() {
    nebulaContainer = new PIXI.Container();
    nebulaContainer.zIndex = -1;

    const spriteNeb1 = new PIXI.Sprite(neb1);
    const spriteNeb2 = new PIXI.Sprite(neb2);
    const spriteNeb3 = new PIXI.Sprite(neb3);
    const spriteNeb4 = new PIXI.Sprite(neb4);

    spriteNeb1.x = gameContainer.viewport.hitArea.x;
    spriteNeb1.y = gameContainer.viewport.hitArea.y;

    spriteNeb2.x = gameContainer.viewport.hitArea.x + gameContainer.viewport.hitArea.width - spriteNeb1.width;
    spriteNeb2.y = gameContainer.viewport.hitArea.y;

    spriteNeb3.x = gameContainer.viewport.hitArea.x;
    spriteNeb3.y = gameContainer.viewport.hitArea.y + gameContainer.viewport.hitArea.height - spriteNeb3.height;

    spriteNeb4.x = gameContainer.viewport.hitArea.x + gameContainer.viewport.hitArea.width - spriteNeb1.width;
    spriteNeb4.y = gameContainer.viewport.hitArea.y + gameContainer.viewport.hitArea.height - spriteNeb3.height;

    nebulaContainer.addChild(spriteNeb1);
    nebulaContainer.addChild(spriteNeb2);
    nebulaContainer.addChild(spriteNeb3);
    nebulaContainer.addChild(spriteNeb4);

    gameContainer.viewport.addChild(nebulaContainer);
}

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
        drawNebula();
        drawStars(game);

        // TODO: Draw other shit.
    },

    refreshBackground() {
        gameContainer.viewport.removeChild(nebulaContainer);
        drawNebula();
    }
}