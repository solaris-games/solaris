import * as PIXI from "pixi.js";

class GameContainer {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000, // black hexadecimal
            resolution: window.devicePixelRatio || 1
        });
    }
}

export default new GameContainer();
