import * as PIXI from 'pixi.js';
import Nebula from './nebula';

class Background {
    constructor(container, width, height) {
        this.container = container;
        this.width = width;
        this.height = height;

        this.nebulaCount = 3; // TODO: Should be calculated based on the size of the world.

        console.log(this.nebulaCount);
    }

    draw() {
        // Draw X of each nebula.
        for(let i = 0; i < this.nebulaCount; i++) {
            const n1 = PIXI.Texture.from(require('../assets/map/neb1.png'))
            const n2 = PIXI.Texture.from(require('../assets/map/neb2.png'))
            const n3 = PIXI.Texture.from(require('../assets/map/neb3.png'))
            const n4 = PIXI.Texture.from(require('../assets/map/neb4.png'))

            let neb1 = new Nebula(this.container, this.width, this.height, new PIXI.Sprite(n1));
            let neb2 = new Nebula(this.container, this.width, this.height, new PIXI.Sprite(n2));
            let neb3 = new Nebula(this.container, this.width, this.height, new PIXI.Sprite(n3));
            let neb4 = new Nebula(this.container, this.width, this.height, new PIXI.Sprite(n4));

            neb1.draw();
            neb2.draw();
            neb3.draw();
            neb4.draw();
        }
    }
};

export default Background;