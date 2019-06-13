import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import Background from './background';

class GameContainer {
    constructor() {
        PIXI.settings.SORTABLE_CHILDREN = true;

        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000, // black hexadecimal
            resolution: window.devicePixelRatio || 1
        });
    }

    setup(game) {
        console.log(game);

        this.app = new PIXI.Application({
            width: window.innerWidth, //window.innerWidth,
            height: window.innerHeight, //window.innerHeight,
            backgroundColor: 0x000000, // black hexadecimal
            resolution: window.devicePixelRatio || 1
        });

        // create viewport
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,

            worldWidth: this._calculateWorldWidth(game),
            worldHeight: this._calculateWorldHeight(game),
        
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });

        // add the viewport to the stage
        this.app.stage.addChild(this.viewport);

        // activate plugins
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate({ friction: 0.9 })
            .clamp({
                left: -250,
                right: this.viewport.worldWidth + 250,
                top: -250,
                bottom: this.viewport.worldHeight + 250
            })
            .clampZoom({
                minWidth: 250,
                minHeight: 250,
                maxWidth: this.viewport.worldWidth * 2,
                maxHeight: this.viewport.worldHeight * 2
            });
    }

    _calculateWorldWidth(game) {
        let min = game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
        let max = game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x;

        return max - min;
    }

    _calculateWorldHeight(game) {
        let min = game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;
        let max = game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y;

        return max - min;
    }
}

export default GameContainer;
