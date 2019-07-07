import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import Background from './background';
import Map from './map';

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

    setupViewport(game) {
        this.game = game;

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

            // yolo
            worldWidth: Number.MAX_VALUE,
            worldHeight: Number.MAX_VALUE,
        
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });

        // add the viewport to the stage
        this.app.stage.addChild(this.viewport);

        this.starFieldLeft = this._calculateMinStarX(game) - 1000;
        this.starFieldRight = this._calculateMaxStarX(game) + 1000;
        this.starFieldTop = this._calculateMinStarY(game) - 1000;
        this.starFieldBottom = this._calculateMaxStarY(game) + 1000;

        // activate plugins
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate({ friction: 0.9 })
            .clamp({
                left: this.starFieldLeft,
                right: this.starFieldRight,
                top: this.starFieldTop,
                bottom: this.starFieldBottom
            })
            .clampZoom({
                minWidth: 200,
                minHeight: 200,
                maxWidth: 1000,
                maxHeight: 1000
            });
    }

    setupUI() {
        this.background = new Background(
            this.starFieldRight - this.starFieldLeft,
            this.starFieldBottom - this.starFieldTop
        );

        this.map = new Map();
        this.map.setup(this.game);
        
        this.viewport.addChild(this.background.container);
        this.viewport.addChild(this.map.container);
    }

    draw() {
        this.background.draw();
        this.map.draw();

        // Move the background so that it centers around the star map.
        this.background.container.x = this.map.container.x - (this.background.container.width / 2);
        this.background.container.y = this.map.container.y- (this.background.container.height / 2);
    }

    _calculateMinStarX(game) {
        return game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x;
    }

    _calculateMinStarY(game) {
        return game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y;
    }

    _calculateMaxStarX(game) {
        return game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x;
    }

    _calculateMaxStarY(game) {
        return game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y;
    }
}

export default new GameContainer();
