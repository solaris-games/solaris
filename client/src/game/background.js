import * as PIXI from 'pixi.js';
import Nebula from './nebula';
import Random from './random';

class Background {
    constructor(maxWidth, maxHeight) {
        this.container = new PIXI.Container({
            zIndex: -1
        });

        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;

        this.nebulaCount = 3; // TODO: Should be calculated based on the size of the world.
    }

    draw() {
        // Draw X of each nebula.
        for(let i = 0; i < this.nebulaCount; i++) {
            const n1 = PIXI.Texture.from(require('../assets/map/neb1.png'));
            const n2 = PIXI.Texture.from(require('../assets/map/neb2.png'));
            const n3 = PIXI.Texture.from(require('../assets/map/neb3.png'));
            const n4 = PIXI.Texture.from(require('../assets/map/neb4.png'));

            const s1 = new PIXI.Sprite(n1);
            const s2 = new PIXI.Sprite(n2);
            const s3 = new PIXI.Sprite(n3);
            const s4 = new PIXI.Sprite(n4);

            let neb1 = new Nebula(this.maxWidth, this.maxHeight, s1);
            let neb2 = new Nebula(this.maxWidth, this.maxHeight, s2);
            let neb3 = new Nebula(this.maxWidth, this.maxHeight, s3);
            let neb4 = new Nebula(this.maxWidth, this.maxHeight, s4);

            this.container.addChild(neb1.sprite);
            this.container.addChild(neb2.sprite);
            this.container.addChild(neb3.sprite);
            this.container.addChild(neb4.sprite);

            neb1.draw();
            neb2.draw();
            neb3.draw();
            neb4.draw();
        }
    }
};

export default Background;