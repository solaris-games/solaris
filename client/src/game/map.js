import * as PIXI from 'pixi.js';
import { logoTexture } from "../game/textures";
import gameContainer from '../game/container';

export default {
    draw(game) {
        const container = new PIXI.Container();

        gameContainer.app.stage.addChild(container);

        // Create a new texture
        const texture = logoTexture;

        // Create a 5x5 grid of bunnies
        for (let i = 0; i < 25; i++) {
        const bunny = new PIXI.Sprite(texture);
        bunny.anchor.set(0.5);
        bunny.x = (i % 5) * 40;
        bunny.y = Math.floor(i / 5) * 40;
        container.addChild(bunny);
        }

        // Move container to the center
        container.x = gameContainer.app.screen.width / 2;
        container.y = gameContainer.app.screen.height / 2;

        // Center bunny sprite in local container coordinates
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;

        // Listen for animate update
        gameContainer.app.ticker.add(delta => {
        // rotate the container!
        // use delta to create frame-independent transform
        container.rotation -= 0.01 * delta;
        });

        // Listen for animate update
        gameContainer.app.ticker.add(delta => {
        // rotate the container!
        // use delta to create frame-independent transform
        container.rotation -= 0.01 * delta;
        });
    }
}