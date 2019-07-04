import * as PIXI from 'pixi.js';
import Random from './random';

class Nebula {

    constructor(maxX, maxY, sprite) {
        this.maxX = maxX;
        this.maxY = maxY;
        this.sprite = sprite;
    }

    draw() {
        // Get random position and draw there.
        let x = Random.getRandomNumber(this.maxX - this.sprite.width);
        let y = Random.getRandomNumber(this.maxY - this.sprite.height);

        this.drawAt(x, y);
    }

    drawAt(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
    }

}

export default Nebula;
