import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';

class GameContainer {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000, // black hexadecimal
            resolution: window.devicePixelRatio || 1
        });

        // create viewport
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,

            worldWidth: window.innerWidth,
            worldHeight: window.innerHeight,
        
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });

        // add the viewport to the stage
        this.app.stage.addChild(this.viewport);

        // activate plugins
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate({ friction: 0.9 });
    }
}

export default new GameContainer();
